const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, deleteExpense, updateExpense, exportExpensesCSV } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, addExpense);
router.get('/', authMiddleware, getExpenses);
// Export expenses as CSV (must be before /:id)
router.get('/export/csv', authMiddleware, exportExpensesCSV);
router.delete('/:id', authMiddleware, deleteExpense);
router.put('/:id', authMiddleware, updateExpense);

module.exports = router;
