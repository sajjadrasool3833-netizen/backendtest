const router = require('express').Router();
const admin = require('../middleware/admin');
const User = require('../models/User');
const Order = require('../models/Order');
const Service = require('../models/Service');

// ============ DASHBOARD STATS ============
router.get('/stats', admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const revenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, sum: { $sum: '$charge' } } }
    ]);
    res.json({
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenue[0]?.sum || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ USERS ============
router.get('/users', admin, async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
  res.json(users);
});

router.get('/users/:id', admin, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/users/:id/balance', admin, async (req, res) => {
  const { amount, action } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (action === 'add') user.balance += Number(amount);
  else if (action === 'subtract') user.balance -= Number(amount);
  else return res.status(400).json({ error: 'Invalid action' });

  await user.save();
  res.json({ message: 'Balance updated', balance: user.balance });
});

router.patch('/users/:id/status', admin, async (req, res) => {
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id, { status }, { new: true }
  ).select('-password');
  res.json(user);
});

router.delete('/users/:id', admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// ============ SERVICES ============
router.get('/services', admin, async (req, res) => {
  const services = await Service.find().sort('-createdAt');
  res.json(services);
});

router.post('/services', admin, async (req, res) => {
  const { name, category, ratePer1000, min, max, providerServiceId } = req.body;
  const service = await Service.create({
    name, category, ratePer1000, min, max, providerServiceId
  });
  res.json(service);
});

router.put('/services/:id', admin, async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id, req.body, { new: true }
  );
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

router.delete('/services/:id', admin, async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: 'Service deleted' });
});

router.patch('/services/:id/toggle', admin, async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  service.active = !service.active;
  await service.save();
  res.json(service);
});

// ============ ORDERS ============
router.get('/orders', admin, async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('service', 'name')
    .sort('-createdAt');
  res.json(orders);
});

router.patch('/orders/:id/status', admin, async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'processing', 'completed', 'partial', 'canceled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (status === 'canceled' && order.status !== 'canceled') {
    await User.findByIdAndUpdate(order.user, { $inc: { balance: order.charge } });
  }

  order.status = status;
  await order.save();
  res.json(order);
});

router.delete('/orders/:id', admin, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted' });
});

module.exports = router;