const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (for testing purposes)
const users = [];
const expenses = [];

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    users.push(newUser);

    // Create token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      message: 'User registered successfully'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Expense Routes
app.post('/api/expenses', authMiddleware, (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    const newExpense = {
      _id: Date.now().toString(),
      user: req.user,
      description,
      amount: parseFloat(amount),
      category,
      date,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/expenses', authMiddleware, (req, res) => {
  try {
    const userExpenses = expenses.filter(expense => expense.user === req.user);
    res.json(userExpenses);
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/expenses/:id', authMiddleware, (req, res) => {
  try {
    const expenseIndex = expenses.findIndex(
      expense => expense._id === req.params.id && expense.user === req.user
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    expenses.splice(expenseIndex, 1);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Expense Tracker API is running 🚀 (Simple Mode)');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📝 This is a simple in-memory server for testing');
  console.log('💾 Data will be lost when server restarts');
}); 