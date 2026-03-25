const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  deviceFingerprint: { type: String, unique: true, sparse: true },
  monthlySalary: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  position: { type: String, default: '' },
  branch: { type: String, default: 'الرئيسية' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

employeeSchema.pre('save', function(next) {
  if (this.monthlySalary > 0) {
    this.hourlyRate = this.monthlySalary / (22 * 8);
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
