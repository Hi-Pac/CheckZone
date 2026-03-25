const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  type: { type: String, enum: ['checkin', 'checkout'], required: true },
  timestamp: { type: Date, default: Date.now },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number
  },
  deviceFingerprint: String,
  isLate: { type: Boolean, default: false },
  minutesLate: { type: Number, default: 0 },
  notes: { type: String, default: '' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
