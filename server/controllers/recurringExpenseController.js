const RecurringExpense = require('../models/RecurringExpense');

// Get all recurring expenses for logged-in user
exports.getRecurringExpenses = async (req, res) => {
  try {
    const recurringExpenses = await RecurringExpense.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(recurringExpenses);
  } catch (err) {
    console.error('Get recurring expenses error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add new recurring expense
exports.addRecurringExpense = async (req, res) => {
  try {
    console.log('Add recurring expense - Request body:', req.body);
    console.log('Add recurring expense - User ID:', req.user);
    
    const { description, amount, category, frequency, startDate, endDate, currency } = req.body;

    const newRecurringExpense = new RecurringExpense({
      user: req.user,
      description,
      amount: parseFloat(amount),
      currency: currency || 'INR',
      category,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null
    });

    console.log('Add recurring expense - New recurring expense object:', newRecurringExpense);
    await newRecurringExpense.save();
    console.log('Add recurring expense - Recurring expense saved successfully');
    res.status(201).json(newRecurringExpense);
  } catch (err) {
    console.error('Add recurring expense error:', err.message);
    console.error('Add recurring expense error stack:', err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update recurring expense
exports.updateRecurringExpense = async (req, res) => {
  try {
    console.log('Update recurring expense request:', {
      id: req.params.id,
      user: req.user,
      body: req.body
    });

    const recurringExpense = await RecurringExpense.findById(req.params.id);
    
    if (!recurringExpense) {
      return res.status(404).json({ msg: 'Recurring expense not found' });
    }

    if (recurringExpense.user.toString() !== req.user) {
      return res.status(404).json({ msg: 'Recurring expense not found or unauthorized' });
    }

    const { description, amount, category, frequency, startDate, endDate, isActive } = req.body;
    
    if (description !== undefined) recurringExpense.description = description;
    if (amount !== undefined) recurringExpense.amount = parseFloat(amount);
    if (category !== undefined) recurringExpense.category = category;
    if (frequency !== undefined) recurringExpense.frequency = frequency;
    if (startDate !== undefined) recurringExpense.startDate = new Date(startDate);
    if (endDate !== undefined) recurringExpense.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) recurringExpense.isActive = isActive;

    await recurringExpense.save();
    console.log('Recurring expense updated successfully');
    res.json(recurringExpense);
  } catch (err) {
    console.error('Update recurring expense error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete recurring expense
exports.deleteRecurringExpense = async (req, res) => {
  try {
    console.log('Delete recurring expense request:', {
      id: req.params.id,
      user: req.user
    });

    const recurringExpense = await RecurringExpense.findById(req.params.id);
    
    if (!recurringExpense) {
      return res.status(404).json({ msg: 'Recurring expense not found' });
    }

    if (recurringExpense.user.toString() !== req.user) {
      return res.status(404).json({ msg: 'Recurring expense not found or unauthorized' });
    }

    await RecurringExpense.findByIdAndDelete(req.params.id);
    console.log('Recurring expense deleted successfully');
    res.json({ msg: 'Recurring expense deleted' });
  } catch (err) {
    console.error('Delete recurring expense error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Toggle recurring expense status
exports.toggleRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findById(req.params.id);
    
    if (!recurringExpense) {
      return res.status(404).json({ msg: 'Recurring expense not found' });
    }

    if (recurringExpense.user.toString() !== req.user) {
      return res.status(404).json({ msg: 'Recurring expense not found or unauthorized' });
    }

    recurringExpense.isActive = !recurringExpense.isActive;
    await recurringExpense.save();
    
    res.json(recurringExpense);
  } catch (err) {
    console.error('Toggle recurring expense error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
}; 