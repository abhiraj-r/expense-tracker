require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/recurring-expenses', require('./routes/recurringExpenseRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('Expense Tracker API is running 🚀');
});

// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Expense Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Test PUT route for debugging
app.put('/api/test', (req, res) => {
  res.json({ message: 'PUT route is working', body: req.body });
});

// Catch-all route logger
app.use((req, res, next) => {
  console.log('No route matched for:', req.method, req.originalUrl);
  next();
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

// Log all registered routes for debugging
function printRoutes(app) {
  console.log('Registered routes:');
  try {
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          // routes registered directly on the app
          console.log(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
          // router middleware
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              console.log(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
            }
          });
        }
      });
    } else {
      console.log('Router not yet initialized');
    }
  } catch (error) {
    console.log('Error printing routes:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  setTimeout(() => printRoutes(app), 2000);
});
