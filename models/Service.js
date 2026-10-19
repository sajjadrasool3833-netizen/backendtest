const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
  name: String,
  category: String,
  ratePer1000: Number,
  min: Number,
  max: Number,
  providerServiceId: String,
  active: { type: Boolean, default: true }
});
module.exports = mongoose.model('Service', serviceSchema);