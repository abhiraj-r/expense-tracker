const express = require('express');
const router = express.Router();
const { 
  getRecurringExpenses, 
  addRecurringExpense, 
  updateRecurringExpense, 
  deleteRecurringExpense,
  toggleRecurringExpense 
} = require('../controllers/recurringExpenseController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all recurring expenses
router.get('/', getRecurringExpenses);

// Add new recurring expense
router.post('/', addRecurringExpense);

// Update recurring expense
router.put('/:id', updateRecurringExpense);

// Delete recurring expense
router.delete('/:id', deleteRecurringExpense);

// Toggle recurring expense status
router.patch('/:id/toggle', toggleRecurringExpense);

module.exports = router; 