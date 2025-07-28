const Expense = require('../models/Expense');
const RecurringExpense = require('../models/RecurringExpense');
const { Parser } = require('json2csv');

// Lock to prevent multiple simultaneous recurring expense generation
let isGeneratingRecurring = false;
let lastGenerationTime = 0;
const GENERATION_COOLDOWN = 600000; // 10 minutes cooldown

// Add new expense
exports.addExpense = async (req, res) => {
  try {
    console.log('Add expense - Request body:', req.body);
    console.log('Add expense - User ID:', req.user);
    
    const { description, amount, category, date, currency } = req.body;

    const newExpense = new Expense({
      user: req.user,
      description,
      amount: parseFloat(amount),
      currency: currency || 'INR',
      category,
      date: date ? new Date(date) : new Date()
    });

    console.log('Add expense - New expense object:', newExpense);
    await newExpense.save();
    console.log('Add expense - Expense saved successfully');
    res.status(201).json(newExpense);
  } catch (err) {
    console.error('Add expense error:', err.message);
    console.error('Add expense error stack:', err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Helper: Generate due recurring expenses for user
async function generateDueRecurringExpenses(userId) {
  console.log(`[Recurring] Starting generation for user ${userId}`);
  const today = new Date();
  const recurringTemplates = await RecurringExpense.find({ user: userId, isActive: true });

  console.log(`[Recurring] Found ${recurringTemplates.length} active templates for user ${userId}`);

  for (const template of recurringTemplates) {
    const startDate = new Date(template.startDate);
    const endDate = template.endDate ? new Date(template.endDate) : null;
    
    // Check if template is still valid
    if (endDate && today > endDate) {
      console.log(`[Recurring] Template ${template._id} has ended`);
      continue;
    }
    if (startDate > today) {
      console.log(`[Recurring] Template ${template._id} hasn't started yet`);
      continue;
    }

    // Find the last generated expense for this template
    const lastExpense = await Expense.findOne({
      user: userId,
      recurringId: template._id,
      isRecurring: true
    }).sort({ date: -1 });

    let shouldGenerate = false;
    let expenseDate = new Date(today);
    let periodKey = '';

    // Determine if we should generate a new expense based on frequency
    switch (template.frequency) {
      case 'daily': {
        const lastDate = lastExpense ? new Date(lastExpense.date) : new Date(startDate);
        const daysSinceLast = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        shouldGenerate = daysSinceLast >= 1;
        periodKey = today.toISOString().split('T')[0];
        break;
      }
      case 'weekly': {
        const lastDate = lastExpense ? new Date(lastExpense.date) : new Date(startDate);
        const daysSinceLast = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        shouldGenerate = daysSinceLast >= 7;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        expenseDate = weekStart;
        break;
      }
      case 'monthly': {
        const lastDate = lastExpense ? new Date(lastExpense.date) : new Date(startDate);
        
        // More accurate monthly calculation
        let monthsSinceLast = (today.getFullYear() - lastDate.getFullYear()) * 12 + 
                             (today.getMonth() - lastDate.getMonth());
        
        // Adjust for day of month
        if (today.getDate() < lastDate.getDate()) {
          monthsSinceLast--;
        }
        
        shouldGenerate = monthsSinceLast >= 1;
        
        // Calculate the target month for the next expense
        let targetYear = lastDate.getFullYear();
        let targetMonth = lastDate.getMonth() + 1; // Next month after last expense
        
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear++;
        }
        
        periodKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
        
        // Set the expense date to the same day of month as start date
        const targetDate = new Date(targetYear, targetMonth, startDate.getDate());
        expenseDate = targetDate;
        break;
      }
      case 'yearly': {
        const lastDate = lastExpense ? new Date(lastExpense.date) : new Date(startDate);
        const yearsSinceLast = today.getFullYear() - lastDate.getFullYear();
        shouldGenerate = yearsSinceLast >= 1;
        periodKey = `${today.getFullYear()}`;
        expenseDate.setMonth(startDate.getMonth());
        expenseDate.setDate(startDate.getDate());
        break;
      }
      default:
        continue;
    }

    if (!shouldGenerate) {
      const lastDate = lastExpense ? new Date(lastExpense.date) : new Date(startDate);
      console.log(`[Recurring] Template ${template._id} not due yet (frequency: ${template.frequency})`);
      console.log(`[Recurring] Last expense date: ${lastDate.toISOString()}, Today: ${today.toISOString()}`);
      continue;
    }

    // Check if an expense for this period already exists
    const existing = await Expense.findOne({
      user: userId,
      recurringId: template._id,
      periodKey
    });
    if (existing) {
      console.log(`[Recurring] Already exists for periodKey ${periodKey} (template ${template._id})`);
      continue;
    }

    // Additional check: prevent generating multiple expenses on the same day for this template
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const todayExpense = await Expense.findOne({
      user: userId,
      recurringId: template._id,
      date: { $gte: todayStart, $lt: todayEnd }
    });
    if (todayExpense) {
      console.log(`[Recurring] Already generated today for template ${template._id}`);
      continue;
    }

    // Final check: prevent race conditions by checking again right before creation
    const finalCheck = await Expense.findOne({
      user: userId,
      recurringId: template._id,
      periodKey
    });
    if (finalCheck) {
      console.log(`[Recurring] Race condition detected - expense already created for periodKey ${periodKey}`);
      continue;
    }

    // Create the expense with duplicate prevention
    try {
      const newExpense = new Expense({
        user: userId,
        description: template.description,
        amount: template.amount,
        currency: template.currency,
        category: template.category,
        date: expenseDate,
        isRecurring: true,
        recurringId: template._id,
        periodKey
      });
      await newExpense.save();
      console.log(`[Recurring] Created expense for periodKey ${periodKey} (template ${template._id})`);
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - expense already exists
        console.log(`[Recurring] Duplicate expense detected for periodKey ${periodKey} (template ${template._id})`);
      } else {
        console.error(`[Recurring] Error creating expense for periodKey ${periodKey}:`, error);
      }
    }
  }
  console.log(`[Recurring] Completed generation for user ${userId}`);
}

// Get all expenses for logged-in user
exports.getExpenses = async (req, res) => {
  try {
    // Generate due recurring expenses before returning (with lock and cooldown)
    const now = Date.now();
    if (!isGeneratingRecurring && (now - lastGenerationTime) > GENERATION_COOLDOWN) {
      isGeneratingRecurring = true;
      lastGenerationTime = now;
      try {
        await generateDueRecurringExpenses(req.user);
      } catch (error) {
        console.error('[Recurring] Error generating expenses:', error);
      } finally {
        isGeneratingRecurring = false;
      }
    }
    const expenses = await Expense.find({ user: req.user }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    isGeneratingRecurring = false; // Ensure lock is released on error
    console.error('[Expenses] Error fetching expenses:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    console.log('Delete expense request:', {
      id: req.params.id,
      user: req.user,
      idType: typeof req.params.id,
      idLength: req.params.id.length
    });

    // Check if the ID is valid
    if (!req.params.id || req.params.id.length !== 24) {
      console.log('Invalid expense ID format');
      return res.status(400).json({ msg: 'Invalid expense ID' });
    }

    const expense = await Expense.findById(req.params.id);
    console.log('Found expense:', expense ? 'Yes' : 'No');
    if (expense) {
      console.log('Expense details:', {
        id: expense._id,
        user: expense.user,
        description: expense.description
      });
    }

    if (!expense) {
      console.log('Expense not found in database');
      return res.status(404).json({ msg: 'Expense not found' });
    }

    console.log('Comparing users:', {
      expenseUser: expense.user.toString(),
      requestUser: req.user,
      match: expense.user.toString() === req.user
    });

    if (expense.user.toString() !== req.user) {
      console.log('Unauthorized: expense user:', expense.user.toString(), 'request user:', req.user);
      return res.status(404).json({ msg: 'Expense not found or unauthorized' });
    }

    // Use findByIdAndDelete instead of the deprecated remove() method
    await Expense.findByIdAndDelete(req.params.id);
    console.log('Expense deleted successfully');
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    console.log('Update expense request:', { 
      id: req.params.id, 
      user: req.user, 
      body: req.body,
      idType: typeof req.params.id,
      idLength: req.params.id.length
    });
    
    // Check if the ID is valid
    if (!req.params.id || req.params.id.length !== 24) {
      console.log('Invalid expense ID format');
      return res.status(400).json({ msg: 'Invalid expense ID' });
    }
    
    const expense = await Expense.findById(req.params.id);
    console.log('Found expense:', expense ? 'Yes' : 'No');
    if (expense) {
      console.log('Expense details:', {
        id: expense._id,
        user: expense.user,
        description: expense.description
      });
    }
    
    if (!expense) {
      console.log('Expense not found in database');
      return res.status(404).json({ msg: 'Expense not found' });
    }
    
    console.log('Comparing users:', {
      expenseUser: expense.user.toString(),
      requestUser: req.user,
      match: expense.user.toString() === req.user
    });
    
    if (expense.user.toString() !== req.user) {
      console.log('Unauthorized: expense user:', expense.user.toString(), 'request user:', req.user);
      return res.status(404).json({ msg: 'Expense not found or unauthorized' });
    }
    
    const { description, amount, category, date } = req.body;
    if (description !== undefined) expense.description = description;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;
    
    await expense.save();
    console.log('Expense updated successfully');
    res.json(expense);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Export expenses as CSV
exports.exportExpensesCSV = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user }).sort({ date: -1 });
    const fields = [
      'description',
      'amount',
      'category',
      'date',
      'isRecurring',
      'recurringId'
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(expenses.map(e => ({
      description: e.description,
      amount: e.amount,
      category: e.category,
      date: e.date ? e.date.toISOString().split('T')[0] : '',
      isRecurring: e.isRecurring || false,
      recurringId: e.recurringId || ''
    })));
    res.header('Content-Type', 'text/csv');
    res.attachment('expenses.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export expenses CSV error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
