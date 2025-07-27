# 🚀 Railway Deployment Guide

## Step 1: Set Up MongoDB Atlas

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create a free account** or sign in
3. **Create a new cluster** (free tier)
4. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

## Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub** (recommended)
3. **Click "New Project"**
4. **Choose "Deploy from GitHub repo"**
5. **Select your expense tracker repository**
6. **Railway will automatically detect it's a Node.js app**

## Step 3: Configure Environment Variables

In your Railway project dashboard:

1. **Go to "Variables" tab**
2. **Add these environment variables**:

```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/expense_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=production
```

3. **Replace the MongoDB URI** with your actual connection string
4. **Generate a strong JWT secret** (you can use a password generator)

## Step 4: Deploy

1. **Railway will automatically deploy** your application
2. **Wait for the build to complete**
3. **Your app will be available at** the provided URL

## Step 5: Test Your App

1. **Visit your Railway URL**
2. **Register a new account**
3. **Test all features**:
   - Add expenses
   - View analytics
   - Test recurring expenses
   - Export data

## Troubleshooting

### If you get CORS errors:
- Railway automatically handles CORS for production

### If MongoDB connection fails:
- Check your connection string
- Make sure your IP is whitelisted in MongoDB Atlas
- For Railway, you can whitelist all IPs (0.0.0.0/0)

### If the app doesn't load:
- Check Railway logs in the dashboard
- Make sure all environment variables are set

## Success! 🎉

Your Expense Tracker is now live and accessible worldwide! 