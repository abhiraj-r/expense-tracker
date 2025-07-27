const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Travel', 'Other']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'BRL']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringExpense',
    default: null
  },
  periodKey: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Add unique compound index to prevent duplicate recurring expenses
expenseSchema.index({ user: 1, recurringId: 1, periodKey: 1 }, {
  unique: true,
  sparse: true, // Allows documents that do not have recurringId or periodKey to be indexed
  partialFilterExpression: {
    recurringId: { $exists: true },
    periodKey: { $exists: true, $ne: '' }
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
