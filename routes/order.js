const express = require('express');
const router = express.Router();

let orders = []; // Dummy Database

// Place New Order
router.post('/', (req, res) => {
  const { service, link, quantity } = req.body;

  if (!service || !link || !quantity) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  const newOrder = {
    id: Date.now(),
    service,
    link,
    quantity,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  console.log('✅ New Order Received:', newOrder);

  res.status(201).json({ message: 'Order placed successfully', orderId: newOrder.id });
});

// Get All Orders (History)
router.get('/', (req, res) => {
  res.status(200).json(orders);
});

module.exports = router;