const router = require('express').Router();
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    }
    res.json({ message: 'تم حفظ الإعدادات بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
  }
});

module.exports = router;
