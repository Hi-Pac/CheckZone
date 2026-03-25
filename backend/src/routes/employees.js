const router = require('express').Router();
const Employee = require('../models/Employee');
const authMiddleware = require('../middleware/auth');

// Identify employee by fingerprint (no auth required - employee facing)
router.post('/identify', async (req, res) => {
  try {
    const { fingerprint } = req.body;
    if (!fingerprint) return res.json({ employee: null });
    const employee = await Employee.findOne({ deviceFingerprint: fingerprint, active: true });
    res.json({ employee: employee || null });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

// All below routes require admin auth
router.get('/', authMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'الموظف غير موجود' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, deviceFingerprint, monthlySalary, position, branch } = req.body;
    if (!name) return res.status(400).json({ message: 'اسم الموظف مطلوب' });
    const employee = new Employee({ name, deviceFingerprint, monthlySalary, position, branch });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'هذا الجهاز مسجل مسبقاً' });
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: 'الموظف غير موجود' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'الموظف غير موجود' });
    res.json({ message: 'تم حذف الموظف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

module.exports = router;
