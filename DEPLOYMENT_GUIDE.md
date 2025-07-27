# 🚀 Deployment Guide - Expense Tracker

This guide will help you deploy your Expense Tracker application to various hosting platforms.

## 📋 Prerequisites

1. **GitHub Account**: For version control
2. **MongoDB Atlas Account**: For database hosting
3. **Environment Variables**: Set up your production environment

## 🔧 Environment Setup

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Add your IP to the whitelist

### 2. Environment Variables
Create a `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
PORT=5000
```

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Full Stack)

**Railway** is perfect for full-stack applications and offers a generous free tier.

#### Steps:
1. **Sign up** at [Railway.app](https://railway.app)
2. **Connect GitHub** repository
3. **Create new project** from GitHub repo
4. **Add environment variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. **Deploy** - Railway will automatically detect and deploy your app

#### Railway Configuration:
- Uses `railway.json` for configuration
- Automatically builds and deploys
- Provides HTTPS and custom domains

### Option 2: Render (Full Stack)

**Render** offers free hosting for both frontend and backend.

#### Steps:
1. **Sign up** at [Render.com](https://render.com)
2. **Create new Web Service** for backend
3. **Create new Static Site** for frontend
4. **Configure environment variables**
5. **Deploy**

#### Backend Service:
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Environment Variables**: Add all required variables

#### Frontend Service:
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/build`

### Option 3: Vercel (Frontend) + Railway (Backend)

**Vercel** for frontend, **Railway** for backend.

#### Frontend (Vercel):
1. **Sign up** at [Vercel.com](https://vercel.com)
2. **Import** your GitHub repository
3. **Configure**:
   - Framework Preset: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Add environment variable**:
   - `REACT_APP_API_URL`: Your backend URL

#### Backend (Railway):
Follow the Railway steps above.

### Option 4: Netlify (Frontend) + Render (Backend)

**Netlify** for frontend, **Render** for backend.

#### Frontend (Netlify):
1. **Sign up** at [Netlify.com](https://netlify.com)
2. **Deploy from Git**
3. **Configure**:
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`
4. **Add environment variable**:
   - `REACT_APP_API_URL`: Your backend URL

## 🔄 Update API Configuration

After deploying your backend, update the frontend API configuration:

### For Vercel/Netlify Frontend:
Update `client/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### For Full-Stack Deployments:
The API calls will automatically work if both frontend and backend are on the same domain.

## 🌍 Custom Domain (Optional)

### Railway:
1. Go to your project settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records

### Render:
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records

### Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records

## 🔍 Post-Deployment Checklist

- [ ] **Test all features**:
  - [ ] User registration/login
  - [ ] Add/edit/delete expenses
  - [ ] Recurring expenses
  - [ ] Analytics and charts
  - [ ] Export functionality
  - [ ] Dark mode toggle
  - [ ] Mobile responsiveness

- [ ] **Check environment variables**
- [ ] **Verify database connection**
- [ ] **Test API endpoints**
- [ ] **Check console for errors**

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure backend CORS is configured for your frontend domain
   - Check environment variables

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas

3. **Build Failures**:
   - Check package.json dependencies
   - Verify Node.js version compatibility

4. **API 404 Errors**:
   - Ensure API routes are properly configured
   - Check deployment platform routing

### Debug Commands:
```bash
# Check if backend is running
curl https://your-backend-url.com/api/health

# Check frontend build
cd client && npm run build

# Check server logs
# Use your deployment platform's log viewer
```

## 📞 Support

If you encounter issues:
1. Check the deployment platform's documentation
2. Review the troubleshooting section above
3. Check browser console and server logs
4. Verify all environment variables are set correctly

## 🎉 Success!

Once deployed, your Expense Tracker will be accessible worldwide! Share your app URL with friends and family.

---

**Happy Deploying! 🚀** 