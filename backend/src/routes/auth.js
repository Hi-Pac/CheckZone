const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );

  res.json({ token, message: 'تم تسجيل الدخول بنجاح' });
});

module.exports = router;
