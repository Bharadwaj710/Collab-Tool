const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const { username, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // ✅ Username editable
    if (username !== undefined) {
      const trimmed = username.trim();
      if (trimmed.length < 3) {
        return res.status(400).json({ msg: 'Username too short' });
      }
      user.username = trimmed;
    }

    if (bio !== undefined) {
      user.profile.bio = bio.trim();
    }

    user.profile.updatedAt = new Date();
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
