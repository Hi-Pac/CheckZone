const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  type: { type: String, enum: ['penalty', 'bonus'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  month: { type: String, required: true }
});

module.exports = mongoose.model('Penalty', penaltySchema);
