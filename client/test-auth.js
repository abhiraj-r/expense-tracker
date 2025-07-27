// Simple test to verify authentication flow
console.log('🔍 Testing Authentication Flow...\n');

// Check if token exists in localStorage
const token = localStorage.getItem('token');
console.log('Current token:', token ? '✅ Exists' : '❌ Not found');

if (token) {
  console.log('Token preview:', token.substring(0, 20) + '...');
} else {
  console.log('No token found - user should be redirected to login');
}

// Test API call with token
if (token) {
  fetch('http://localhost:5000/api/expenses', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  })
  .then(data => {
    console.log('✅ API call successful');
    console.log('Expenses count:', data.length);
  })
  .catch(error => {
    console.log('❌ API call failed:', error.message);
    if (error.message.includes('401')) {
      console.log('💡 Token is invalid - clearing localStorage');
      localStorage.removeItem('token');
    }
  });
} else {
  console.log('💡 No token available for API test');
} 