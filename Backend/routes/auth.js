const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Sign Up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user);
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/home');
  }
);

module.exports = router;