const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Club = require('../models/Club');
const Discussion = require('../models/Discussion');
const { auth, admin } = require('../middleware/auth');

// Get all users
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update user role/status
router.put('/users/:id', [auth, admin], async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all clubs
router.get('/clubs', [auth, admin], async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get reported content (this is a simplified example)
router.get('/reports', [auth, admin], async (req, res) => {
  try {
    // In a real app, you'd have a dedicated 'Reports' collection.
    // Here, we'll simulate by finding posts with a 'reports' array.
    const reportedPosts = await Discussion.find({ 'reports.0': { $exists: true } }).populate('author', 'username');
    res.json(reportedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;