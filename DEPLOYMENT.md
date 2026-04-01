# MyKart E-Commerce Deployment Guide

This guide will help you deploy your project to production.

---

## GitHub Push - Before Deployment

### ✅ Files Already Safe (not pushed to GitHub):
- `.env` files - Contains all API keys (MongoDB, Cloudinary, Razorpay, etc.)
- `node_modules/` - Dependencies installed on server
- Log files - `*.log`, `server.log`, `backend.log`

### Push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/mykart.git
git push -u origin main
```

**Why safe?** Your secrets are in `.env` which is in `.gitignore` - they NEVER get pushed!

---

## Project Structure
- **Backend**: Express.js API (runs on port 8000)
- **Frontend**: React + Vite customer-facing store (runs on port 5173)
- **Admin**: React + Vite admin dashboard (runs on port 5174)

---

## Deployment Platform

- **Backend**: [Render.com](https://render.com)
- **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Admin**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

---

## Step 1: Prepare Backend for Production

### Update backend/.env file for production:

```env
# Node environment
NODE_ENV=production

# Server URL (your Render backend URL)
SERVER_URL=https://your-backend-app.onrender.com

# Frontend URL (your Vercel frontend URL)
FRONTEND_URL=https://your-frontend.vercel.app

# Admin URL (your Vercel admin URL)
ADMIN_URL=https://your-admin.vercel.app

# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mykart?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Cookie Password (generate another random string)
COOKIE_PASSWORD=your-cookie-password-min-32-chars

# Razorpay Key ID (from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Razorpay Key Secret (from Razorpay Dashboard)
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Cloudinary Credentials (from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=xxxxxx
CLOUDINARY_API_KEY=xxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Firebase Admin SDK (from Firebase Console)
FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxx
FIREBASE_APP_ID=1:xxxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx
FIREBASE_MEASUREMENT_ID=G-xxxxxxxxxx

# Gemini API Key (from Google AI Studio)
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

#.portal_id (optional - for blockchain)
# PORTAL_ID=your-cardano-portal-id
```

---

## Step 2: Deploy Backend to Render.com

### Create Render Web Service:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `mykart-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

5. Add Environment Variables:
   - Copy all variables from Step 1

6. Click "Create Web Service"

### Wait for deployment to complete...

---

## Step 3: Deploy Frontend to Vercel

### Create Vercel Project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_SERVER_URL=https://your-backend-app.onrender.com
   VITE_FRONTEND_URL=https://your-frontend.vercel.app
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   VITE_FIREBASE_APIKEY=your-firebase-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

6. Click "Deploy"

---

## Step 4: Deploy Admin to Vercel

### Create Another Vercel Project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select the same repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_SERVER_URL=https://your-backend-app.onrender.com
   ```

6. Click "Deploy"

---

## Step 5: Verify Deployment

After all deployments complete:

1. **Test Backend API**:
   - Visit `https://your-backend-app.onrender.com/api/product/get-products`
   
2. **Test Frontend**:
   - Visit `https://your-frontend.vercel.app`
   - Login and test all features
   
3. **Test Admin Dashboard**:
   - Visit `https://your-admin.vercel.app`
   - Login as admin and test all features

---

## Important Notes

### CORS Configuration
Update your backend/.env to include all production URLs:
- `FRONTEND_URL=` (your frontend Vercel URL)
- `ADMIN_URL=` (your admin Vercel URL)

### Cloudinary Setup
1. Go to [Cloudinary Dashboard](https://cloudinary.com)
2. Copy your cloud name, API key, and API secret
3. Add them to backend/.env

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to backend/.env

### Razorpay Setup
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get Key ID and Key Secret
3. Update both frontend/.env and backend/.env

---

## Quick Commands for Local Testing

```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install
cd admin && npm install

# Run locally
cd backend && npm run dev    # Server on port 8000
cd frontend && npm run dev  # Frontend on port 5173
cd admin && npm run dev     # Admin on port 5174
```

---

## Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure frontend/admin URLs are in backend/.env
2. **Database Connection Error**: Check MongoDB Atlas connection string
3. **Cloudinary Upload Error**: Verify API credentials
4. **Payment Error**: Check Razorpay keys

---

## Support

For issues, check:
- Backend logs on Render.com dashboard
- Frontend/Admin logs on Vercel dashboard
- Browser console for frontend errors