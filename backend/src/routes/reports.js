const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Penalty = require('../models/Penalty');
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');

async function getSetting(key, defaultValue) {
  const s = await Settings.findOne({ key });
  return s ? s.value : defaultValue;
}

// Salary report for employee/month
router.get('/salary/:employeeId', authMiddleware, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'السنة والشهر مطلوبان' });

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'الموظف غير موجود' });

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const startDate = `${monthStr}-01`;
    const endDate = `${monthStr}-31`;

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1, time: 1 });

    // Group by date
    const dayMap = {};
    records.forEach(r => {
      if (!dayMap[r.date]) dayMap[r.date] = { checkin: null, checkout: null };
      if (r.type === 'checkin' && !dayMap[r.date].checkin) dayMap[r.date].checkin = r;
      if (r.type === 'checkout') dayMap[r.date].checkout = r;
    });

    const workStart = await getSetting('workStart', '08:00');
    const workEnd = await getSetting('workEnd', '17:00');
    const [startH, startM] = workStart.split(':').map(Number);
    const [endH, endM] = workEnd.split(':').map(Number);
    const expectedHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

    let workDays = 0;
    let totalMinutes = 0;
    let totalLateMinutes = 0;

    for (const [, day] of Object.entries(dayMap)) {
      if (day.checkin) {
        workDays++;
        if (day.checkin.isLate) totalLateMinutes += day.checkin.minutesLate || 0;
        if (day.checkin && day.checkout) {
          const [ciH, ciM] = day.checkin.time.split(':').map(Number);
          const [coH, coM] = day.checkout.time.split(':').map(Number);
          totalMinutes += (coH * 60 + coM) - (ciH * 60 + ciM);
        } else {
          totalMinutes += expectedHours * 60;
        }
      }
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const weekdays = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      return d.getDay() !== 5 && d.getDay() !== 6; // exclude Friday and Saturday
    }).filter(Boolean).length;

    const absences = Math.max(0, weekdays - workDays);
    const totalHours = (totalMinutes / 60).toFixed(2);
    const hourlyRate = employee.hourlyRate || (employee.monthlySalary / (22 * 8));
    const lateDeduction = (totalLateMinutes / 60) * hourlyRate;
    const absenceDeduction = absences * expectedHours * hourlyRate;
    const deductions = lateDeduction + absenceDeduction;

    const penalties = await Penalty.find({ employee: employeeId, month: monthStr, type: 'penalty' });
    const bonuses = await Penalty.find({ employee: employeeId, month: monthStr, type: 'bonus' });
    const totalPenalties = penalties.reduce((sum, p) => sum + p.amount, 0);
    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);

    const netSalary = (employee.monthlySalary || 0) - deductions - totalPenalties + totalBonuses;

    res.json({
      employee: { id: employee._id, name: employee.name, monthlySalary: employee.monthlySalary },
      month: monthStr,
      workDays,
      expectedWorkDays: weekdays,
      absences,
      totalHours: parseFloat(totalHours),
      lateMinutes: totalLateMinutes,
      deductions: Math.round(deductions * 100) / 100,
      penalties: totalPenalties,
      bonuses: totalBonuses,
      netSalary: Math.round(netSalary * 100) / 100,
      penaltiesList: penalties,
      bonusesList: bonuses
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

// Summary of today
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = await Attendance.find({ date: today });
    const presentEmployeeIds = [...new Set(todayRecords.filter(r => r.type === 'checkin').map(r => r.employee.toString()))];
    const lateIds = [...new Set(todayRecords.filter(r => r.type === 'checkin' && r.isLate).map(r => r.employee.toString()))];
    const totalEmployees = await Employee.countDocuments({ active: true });

    // Last 7 days chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = await Attendance.distinct('employee', { date: dateStr, type: 'checkin' });
      chartData.push({ date: dateStr, present: count.length });
    }

    res.json({
      totalEmployees,
      presentToday: presentEmployeeIds.length,
      absentToday: totalEmployees - presentEmployeeIds.length,
      lateToday: lateIds.length,
      chartData
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

// Penalties & Bonuses CRUD
router.get('/penalties', authMiddleware, async (req, res) => {
  try {
    const { employeeId, type, month } = req.query;
    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (type) filter.type = type;
    if (month) filter.month = month;
    const items = await Penalty.find(filter).sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

router.post('/penalties', authMiddleware, async (req, res) => {
  try {
    const { employeeId, type, amount, reason, month } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'الموظف غير موجود' });
    const item = new Penalty({
      employee: employeeId,
      employeeName: employee.name,
      type,
      amount,
      reason,
      month
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

router.delete('/penalties/:id', authMiddleware, async (req, res) => {
  try {
    await Penalty.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

module.exports = router;
