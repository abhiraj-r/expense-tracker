// Debug script to check authentication state
console.log('🔍 Debugging Authentication Issues...\n');

// Check localStorage
console.log('=== LocalStorage Check ===');
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
if (token) {
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 30) + '...');
} else {
  console.log('No token found in localStorage');
}

// Check current URL
console.log('\n=== Current URL ===');
console.log('URL:', window.location.href);
console.log('Pathname:', window.location.pathname);

// Test API endpoints
console.log('\n=== API Tests ===');

// Test registration endpoint
console.log('Testing registration endpoint...');
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Debug User',
    email: 'debug@example.com',
    password: 'password123'
  })
})
.then(response => {
  console.log('Registration response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Registration response:', data);
})
.catch(error => {
  console.log('Registration error:', error.message);
});

// Test expenses endpoint with token
if (token) {
  console.log('\nTesting expenses endpoint with token...');
  fetch('http://localhost:5000/api/expenses', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Expenses response status:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  })
  .then(data => {
    console.log('Expenses response:', data);
  })
  .catch(error => {
    console.log('Expenses error:', error.message);
  });
} else {
  console.log('\nNo token available for expenses test');
}

// Check if we're on dashboard page
if (window.location.pathname === '/dashboard') {
  console.log('\n=== Dashboard Page Check ===');
  console.log('On dashboard page without token - this should redirect to login');
} 