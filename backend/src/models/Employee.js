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

// Default working days per month and hours per day for hourly rate calculation
const WORKING_DAYS_PER_MONTH = 22;
const WORKING_HOURS_PER_DAY = 8;

employeeSchema.pre('save', function(next) {
  if (this.monthlySalary > 0) {
    this.hourlyRate = this.monthlySalary / (WORKING_DAYS_PER_MONTH * WORKING_HOURS_PER_DAY);
  }
  next();
});

employeeSchema.statics.WORKING_DAYS_PER_MONTH = WORKING_DAYS_PER_MONTH;
employeeSchema.statics.WORKING_HOURS_PER_DAY = WORKING_HOURS_PER_DAY;

module.exports = mongoose.model('Employee', employeeSchema);
