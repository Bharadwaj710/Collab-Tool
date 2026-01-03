const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists (by email OR username)
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.trim() }
      ]
    });

    if (user) {
      const field = user.email === email.toLowerCase().trim() ? 'Email' : 'Username';
      return res.status(400).json({ msg: `${field} is already registered` });
    }
    
    // Create new user
    user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });
    
    await user.save();
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'collabtoolsecret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username
    
    // Check if user exists (by email or username) - Case Insensitive
    const loginIdentifier = identifier.trim();
    console.log(`Login attempt for: ${loginIdentifier}`);
    
    const user = await User.findOne({ 
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { username: { $regex: new RegExp(`^${loginIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
      ]
    });

    if (!user) {
      console.log(`User not found for identifier: ${loginIdentifier}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    console.log(`User found: ${user.username} (${user.email})`);
    
    // Check password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'collabtoolsecret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get authenticated user
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;