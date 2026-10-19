const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  link: String,
  quantity: Number,
  charge: Number,
  status: { type: String, default: 'pending' },
  startCount: Number,
  remains: Number
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);