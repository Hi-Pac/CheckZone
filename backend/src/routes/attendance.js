const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

async function getSetting(key, defaultValue) {
  const s = await Settings.findOne({ key });
  return s ? s.value : defaultValue;
}

async function sendWhatsAppNotification(employeeName, type, time, date) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const phone = process.env.WHATSAPP_PHONE;
  if (!apiUrl || !token || !phone) return;
  const typeText = type === 'checkin' ? 'حضور' : 'انصراف';
  const message = `✅ تسجيل ${typeText}\nالموظف: ${employeeName}\nالوقت: ${time}\nالتاريخ: ${date}`;
  try {
    await axios.post(apiUrl, { token, to: phone, body: message });
  } catch (err) {
    console.log(`WhatsApp notification failed for ${employeeName} (${typeText}):`, err.message);
  }
}

// Check-in/out (no auth required - employee facing)
router.post('/checkin', async (req, res) => {
  try {
    const { employeeId, type, location, fingerprint, date, time } = req.body;
    if (!employeeId || !type || !date || !time) {
      return res.status(400).json({ message: 'بيانات غير مكتملة' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'الموظف غير موجود' });

    let isLate = false;
    let minutesLate = 0;

    if (type === 'checkin') {
      const workStart = await getSetting('workStart', process.env.WORK_START || '08:00');
      const lateThreshold = await getSetting('lateThresholdMinutes', 15);
      const [startH, startM] = workStart.split(':').map(Number);
      const [timeH, timeM] = time.split(':').map(Number);
      const startTotal = startH * 60 + startM + Number(lateThreshold);
      const timeTotal = timeH * 60 + timeM;
      if (timeTotal > startTotal) {
        isLate = true;
        minutesLate = timeTotal - (startH * 60 + startM);
      }
    }

    const record = new Attendance({
      employee: employeeId,
      employeeName: employee.name,
      type,
      date,
      time,
      location,
      deviceFingerprint: fingerprint,
      isLate,
      minutesLate
    });
    await record.save();

    sendWhatsAppNotification(employee.name, type, time, date);

    res.status(201).json({ message: type === 'checkin' ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل الانصراف بنجاح', record });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

// Today's attendance (no auth - employee facing)
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await Attendance.find({ date: today }).sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

// Get attendance records (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, employeeId, type, startDate, endDate } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate };
    if (employeeId) filter.employee = employeeId;
    if (type) filter.type = type;
    const records = await Attendance.find(filter).sort({ timestamp: -1 }).limit(500);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

module.exports = router;
