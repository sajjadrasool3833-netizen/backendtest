const express = require('express');
const router = express.Router();

// Admin Route (Demo)
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Admin Panel API' });
});

module.exports = router;