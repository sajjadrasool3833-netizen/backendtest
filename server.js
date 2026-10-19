const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== MongoDB connect =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Error:', err.message));

// ===== Routes =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/admin', require('./routes/admin'));

// Test route
app.get('/', (req, res) => res.json({ message: '🍕 Cheezious API running' }));

app.listen(5000, () => console.log('🚀 Server running on 5000'));