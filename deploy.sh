#!/bin/bash

# 🚀 Expense Tracker Deployment Script
echo "🚀 Starting Expense Tracker Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the client
echo "📦 Building React client..."
cd client
npm install
npm run build
cd ..

# Check if build was successful
if [ ! -d "client/build" ]; then
    echo "❌ Error: Client build failed"
    exit 1
fi

echo "✅ Client build successful!"

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo "✅ Server dependencies installed!"

# Check environment variables
echo "🔍 Checking environment variables..."
if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: No .env file found in server directory"
    echo "📝 Please create server/.env with the following variables:"
    echo "   MONGODB_URI=your_mongodb_connection_string"
    echo "   JWT_SECRET=your_jwt_secret"
    echo "   NODE_ENV=production"
    echo "   PORT=5000"
else
    echo "✅ .env file found"
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Choose a hosting platform:"
echo "   - Railway (recommended): https://railway.app"
echo "   - Render: https://render.com"
echo "   - Vercel: https://vercel.com"
echo "3. Follow the deployment guide in DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Quick links:"
echo "- Railway: https://railway.app"
echo "- Render: https://render.com"
echo "- Vercel: https://vercel.com"
echo "- MongoDB Atlas: https://www.mongodb.com/atlas"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md" 