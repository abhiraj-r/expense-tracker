// Comprehensive Authentication Flow Test
// Run this in the browser console to test the entire flow

console.log('🧪 Starting Authentication Flow Test...\n');

// Step 1: Clear any existing token
console.log('1. Clearing existing token...');
localStorage.removeItem('token');
console.log('✅ Token cleared\n');

// Step 2: Test registration
console.log('2. Testing registration...');
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(response => {
  console.log('Registration status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Registration response:', data);
  
  if (data.token) {
    console.log('✅ Registration successful, token received');
    
    // Step 3: Save token and test API
    console.log('\n3. Testing with saved token...');
    localStorage.setItem('token', data.token);
    
    // Step 4: Test expenses API
    console.log('4. Testing expenses API...');
    return fetch('http://localhost:5000/api/expenses', {
      headers: {
        'Authorization': `Bearer ${data.token}`,
        'Content-Type': 'application/json'
      }
    });
  } else {
    throw new Error('No token in registration response');
  }
})
.then(response => {
  console.log('Expenses API status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Expenses response:', data);
  console.log('✅ Authentication flow working correctly!');
})
.catch(error => {
  console.error('❌ Test failed:', error.message);
});

// Step 5: Test login
console.log('\n5. Testing login...');
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(response => {
  console.log('Login status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Login response:', data);
  if (data.token) {
    console.log('✅ Login successful');
  } else {
    console.log('❌ Login failed - no token received');
  }
})
.catch(error => {
  console.error('❌ Login test failed:', error.message);
}); 