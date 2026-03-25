require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors());
app.use(express.json());

// Rate limiting
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', defaultLimiter);
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkzone';

async function initDefaultSettings() {
  const Settings = require('./models/Settings');
  const defaults = {
    companyName: 'CheckZone',
    companyLat: parseFloat(process.env.COMPANY_LAT || '24.7136'),
    companyLng: parseFloat(process.env.COMPANY_LNG || '46.6753'),
    companyRadius: parseInt(process.env.COMPANY_RADIUS || '200'),
    workStart: process.env.WORK_START || '08:00',
    workEnd: process.env.WORK_END || '17:00',
    lateThresholdMinutes: 15,
    whatsappApiUrl: process.env.WHATSAPP_API_URL || '',
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN || '',
    whatsappPhone: process.env.WHATSAPP_PHONE || ''
  };
  for (const [key, value] of Object.entries(defaults)) {
    await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true });
  }
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await initDefaultSettings();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    // Start server anyway for health checks
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
  });

module.exports = app;
