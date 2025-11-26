# Zara AI Deployment Guide

## Deploying to Render (Backend) and Vercel (Frontend)

### Backend Deployment on Render

1. **Prepare your Render account**
   - Sign up at https://render.com if you don't have an account
   - Connect your GitHub repository

2. **Create a new Web Service**
   - Go to your Render Dashboard
   - Click "New" → "Web Service"
   - Connect to your GitHub repository
   - Set the following configuration:
     - Name: `zara-ai-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Choose your preferred plan (Free tier available)

3. **Set Environment Variables**
   In the "Environment Variables" section, add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   SMTP_FROM=your_from_email
   CLIENT_URL=https://your-vercel-frontend-url.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete
   - Note your Render URL (e.g., `https://zara-ai-backend.onrender.com`)

### Frontend Deployment on Vercel

1. **Prepare your Vercel account**
   - Sign up at https://vercel.com if you don't have an account
   - Install Vercel CLI: `npm install -g vercel`

2. **Update Configuration**
   - Update `frontend/vercel.json` with your Render backend URL:
     ```json
     {
       "routes": [
         {
           "src": "/api/(.*)",
           "dest": "https://your-render-backend-url.onrender.com/api/$1"
         }
       ]
     }
     ```

3. **Deploy via Vercel Dashboard**
   - Go to your Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Set the following configuration:
     - Framework Preset: `Vite`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. **Set Environment Variables**
   In the "Environment Variables" section, add:
   ```
   NODE_ENV=production
   REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete

### Post-Deployment Configuration

1. **Update Backend CORS Settings**
   - In your Render dashboard, update the `CLIENT_URL` environment variable
   - Set it to your Vercel frontend URL

2. **Update Frontend API Configuration**
   - In your Vercel dashboard, ensure `REACT_APP_API_URL` points to your Render backend

3. **Test the Deployment**
   - Visit your frontend URL
   - Try registering/logging in
   - Test sending messages

### Troubleshooting

**Frontend Styling Issues:**
- Ensure TailwindCSS is properly configured
- Check that `index.css` includes Tailwind directives
- Verify that all CSS classes are correctly applied

**API Connection Issues:**
- Check that CORS is properly configured on the backend
- Verify that environment variables are set correctly
- Ensure the backend URL is accessible

**Build Issues:**
- Check Node.js version compatibility
- Ensure all dependencies are properly installed
- Verify that the build commands are correct

### Useful Commands

**Local Production Build:**
```bash
# Frontend
cd frontend
npm run build:prod

# Serve locally
npm run preview
```

**Testing API Endpoints:**
```bash
# Health check
curl https://your-render-backend-url.onrender.com/health

# API test
curl https://your-render-backend-url.onrender.com/api/auth
```

### Support

If you encounter any issues during deployment, check:
1. Environment variables are correctly set
2. CORS configuration allows your frontend domain
3. Database connection string is correct
4. Port configurations match Render/Vercel requirements