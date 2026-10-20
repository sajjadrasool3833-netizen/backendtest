const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS: Frontend URL ko allow karein
app.use(cors({
  origin: ['https://frontend-xi-khaki-dv8br60jha.vercel.app'], // <-- Yahan frontend URL daalein (deploy ke baad)
  credentials: true
}));
app.use(express.json());

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Error:', err.message));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.json({ message: '🍕 PAK SMM API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));