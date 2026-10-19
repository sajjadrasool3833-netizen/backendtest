const router = require('express').Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  const { serviceId, link, quantity } = req.body;
  const service = await Service.findById(serviceId);
  const user = await User.findById(req.user.id);
  const charge = (service.ratePer1000 / 1000) * quantity;

  if (user.balance < charge) return res.status(400).json({ error: 'Low balance' });

  const order = await Order.create({
    user: user._id, service: service._id, link, quantity, charge
  });
  user.balance -= charge;
  await user.save();
  res.json(order);
});

router.get('/', auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  res.json(orders);
});
module.exports = router;