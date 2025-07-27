const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# MongoDB Connection String
# For local MongoDB: mongodb://localhost:27017/expense-tracker
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
MONGO_URI=mongodb://localhost:27017/expense-tracker

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
  console.log('📝 Please update the MONGO_URI in .env file with your MongoDB connection string');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🚀 To start the server:');
console.log('1. Make sure MongoDB is running');
console.log('2. Update the MONGO_URI in .env file if needed');
console.log('3. Run: npm start'); 