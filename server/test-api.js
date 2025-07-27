const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Expense Tracker API...\n');

    // Test registration
    console.log('1. Testing registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    const token = registerResponse.data.token;
    console.log('🔑 Token received:', token.substring(0, 20) + '...\n');

    // Test login
    console.log('2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data.user.name);
    console.log('🔑 New token received:', loginResponse.data.token.substring(0, 20) + '...\n');

    // Test adding expense
    console.log('3. Testing add expense...');
    const expenseResponse = await axios.post(`${API_BASE}/expenses`, {
      description: 'Test Expense',
      amount: 25.50,
      category: 'food',
      date: '2024-01-15'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Expense added:', expenseResponse.data.description);
    console.log('💰 Amount:', expenseResponse.data.amount);
    console.log('📅 Date:', expenseResponse.data.date, '\n');

    // Test getting expenses
    console.log('4. Testing get expenses...');
    const expensesResponse = await axios.get(`${API_BASE}/expenses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Expenses retrieved:', expensesResponse.data.length, 'expense(s)');
    expensesResponse.data.forEach(expense => {
      console.log(`   - ${expense.description}: $${expense.amount} (${expense.category})`);
    });
    console.log('\n');

    // Test deleting expense
    console.log('5. Testing delete expense...');
    const expenseId = expenseResponse.data._id;
    await axios.delete(`${API_BASE}/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Expense deleted successfully\n');

    console.log('🎉 All API tests passed! The server is working correctly.');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI(); 