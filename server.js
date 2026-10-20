const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://frontend-xi-khaki-dv8br60jha.vercel.app'
  ], 
  credentials: true
}));
app.use(express.json());

// ==========================================
// 2. SESSION & PASSPORT SETUP
// ==========================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_random_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Production mein true karein agar HTTPS ho
}));

app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// 3. GOOGLE STRATEGY
// ==========================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://backendtest-weld.vercel.app/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // Yahan aap database mein user check ya create karenge
    // Abhi ke liye hum seedha profile return kar rahe hain
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ==========================================
// 4. MONGODB CONNECT
// ==========================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Error:', err.message));

// ==========================================
// 5. ROUTES (Yeh Passport setup ke BAAD aane chahiye)
// ==========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/admin', require('./routes/admin'));

// Test Route
app.get('/', (req, res) => res.json({ message: '🍕 PAK SMM API running' }));

// ==========================================
// 6. SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));