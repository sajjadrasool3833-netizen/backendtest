const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const passport = require('passport'); // <-- Import passport

// ==========================================
// 1. SIGNUP ROUTE (/api/auth/register)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    console.log('✅ New User Registered:', newUser.email);

    res.status(201).json({ 
      message: 'User registered successfully', 
      token: 'demo_token_' + newUser._id, 
      user: { 
        id: newUser._id, 
        firstName: newUser.firstName, 
        lastName: newUser.lastName, 
        email: newUser.email 
      } 
    });

  } catch (error) {
    console.error('❌ Signup Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ==========================================
// 2. LOGIN ROUTE (/api/auth/login)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('➡️ Login Attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Login Successful:', user.email);

    res.status(200).json({ 
      message: 'Login Successful', 
      token: 'demo_token_' + user._id, 
      user: { 
        id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error('❌ Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ==========================================
// 3. CHANGE PASSWORD ROUTE (/api/auth/change-password)
// ==========================================
router.put('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password Changed for:', user.email);
    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('❌ Password Change Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// 4. GOOGLE OAUTH ROUTES (Optional - Abhi disabled hai)
// ==========================================
// Jab aapke paas Google Client ID aur Secret aa jayein, 
// tab aap in routes ko uncomment kar sakti hain.

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'https://frontend-xi-khaki-dv8br60jha.vercel.app/' }),
  (req, res) => {
    const user = req.user;
    res.redirect(`https://frontend-xi-khaki-dv8br60jha.vercel.app/dashboard?name=${user.displayName}&email=${user.emails[0].value}`);
  }
);

module.exports = router;