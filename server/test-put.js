const axios = require('axios');

async function testPutRoute() {
  try {
    console.log('Testing PUT route...');
    
    // Test the basic PUT route
    const testResponse = await axios.put('http://localhost:5000/api/test', {
      test: 'data'
    });
    console.log('Basic PUT test:', testResponse.data);
    
    // Test with a valid expense ID (you'll need to replace this with a real ID)
    const expenseId = '6884eca8d6329a571c94f9e9';
    console.log('Testing expense update with ID:', expenseId);
    
    const response = await axios.put(`http://localhost:5000/api/expenses/${expenseId}`, {
      description: 'Test Update',
      amount: 50.00,
      category: 'test',
      date: '2024-01-01'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to add a real token
      }
    });
    
    console.log('Expense update response:', response.data);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testPutRoute(); 