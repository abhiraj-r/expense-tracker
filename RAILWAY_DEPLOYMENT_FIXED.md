# 🚀 Railway Deployment - FIXED VERSION

## The Problem
Railway was trying to build the client from the root directory, but our project has a monorepo structure with `client/` and `server/` folders.

## Solution: Deploy Backend Only to Railway

### Step 1: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Create new project**
3. **Choose "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will detect it's a Node.js app**

### Step 2: Configure Railway Settings

In your Railway project dashboard:

1. **Go to "Settings" tab**
2. **Set the following:**
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

Add these variables in Railway:

```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/expense_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=production
```

### Step 4: Deploy Frontend Separately

Since Railway had issues with the monorepo, deploy the frontend to a different platform:

#### Option A: Vercel (Recommended)
1. **Go to [Vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure:**
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. **Add Environment Variable:**
   - `REACT_APP_API_URL`: Your Railway backend URL

#### Option B: Netlify
1. **Go to [Netlify.com](https://netlify.com)**
2. **Deploy from Git**
3. **Configure:**
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
4. **Add Environment Variable:**
   - `REACT_APP_API_URL`: Your Railway backend URL

### Step 5: Update Frontend API Configuration

Update `client/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### Step 6: Test Your Deployment

1. **Backend**: Test your Railway URL + `/api/health`
2. **Frontend**: Test your Vercel/Netlify URL
3. **Full App**: Register and test all features

## Alternative: Render (Full Stack)

If you prefer to deploy everything together:

1. **Go to [Render.com](https://render.com)**
2. **Create Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
5. **Add environment variables**
6. **Deploy**

## Success! 🎉

Your Expense Tracker will be live with:
- **Backend**: Railway (API)
- **Frontend**: Vercel/Netlify (React App)
- **Database**: MongoDB Atlas 