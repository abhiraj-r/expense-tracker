const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Signup
exports.register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Create token
    console.log('Login - JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Login - Token created for user:', newUser._id);

    res.status(201).json({ 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      msg: 'User registered successfully' 
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Create token
    console.log('Login - JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Login - Token created for user:', user._id);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, defaultCurrency } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (defaultCurrency) user.defaultCurrency = defaultCurrency;
    await user.save();
    res.json({ 
      msg: 'Profile updated', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        defaultCurrency: user.defaultCurrency 
      } 
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
