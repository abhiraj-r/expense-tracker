// Quick debug script - run this in browser console
console.log('🔍 Current Authentication State:');

// Check localStorage
const token = localStorage.getItem('token');
console.log('Token in localStorage:', token ? '✅ Present' : '❌ Missing');

if (token) {
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 30) + '...');
} else {
  console.log('No token found - user needs to login/register');
}

// Check current URL
console.log('Current URL:', window.location.href);
console.log('Current path:', window.location.pathname);

// Check if we're on dashboard without token
if (window.location.pathname === '/dashboard' && !token) {
  console.log('⚠️  WARNING: On dashboard page without token!');
  console.log('This will cause 401 errors. Should redirect to login.');
}

// Test if token is valid
if (token) {
  console.log('\n🧪 Testing token validity...');
  fetch('http://localhost:5000/api/expenses', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Token test response:', response.status, response.statusText);
    if (response.ok) {
      console.log('✅ Token is valid!');
    } else {
      console.log('❌ Token is invalid or expired');
      localStorage.removeItem('token');
    }
  })
  .catch(error => {
    console.log('❌ Token test failed:', error.message);
  });
} else {
  console.log('\n💡 No token to test - please login or register first');
}

console.log('\n📋 Next steps:');
if (!token) {
  console.log('1. Go to login page: http://localhost:3000');
  console.log('2. Register a new account or login');
  console.log('3. Check that token is saved after login');
} else {
  console.log('1. Token exists - check if it\'s valid above');
  console.log('2. If invalid, clear token and login again');
} 