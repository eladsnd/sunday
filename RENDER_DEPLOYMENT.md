# 🚀 Render.com Deployment Guide

## Quick Deploy to Render (Free Forever!)

### Prerequisites
- GitHub account
- Render account (free): https://render.com

---

## 📋 Step-by-Step Deployment

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/sunday.git
git branch -M main
git push -u origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub
4. Authorize Render to access your repositories

### Step 3: Deploy PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `sunday-postgres`
   - **Database**: `sunday_db`
   - **User**: `sunday`
   - **Region**: Choose closest to you
   - **Plan**: **Free**
3. Click **"Create Database"**
4. **Save the connection details** (you'll need them)

### Step 4: Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `sunday-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Docker`
   - **Plan**: **Free**

4. **Environment Variables** (click "Advanced"):
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=<from postgres connection - Internal Database URL host>
   DB_PORT=5432
   DB_USERNAME=sunday
   DB_PASSWORD=<from postgres connection>
   DB_DATABASE=sunday_db
   CORS_ORIGIN=*
   ```

5. Click **"Create Web Service"**

### Step 5: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `sunday-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://sunday-backend.onrender.com/api
   ```

5. Click **"Create Static Site"**

### Step 6: Update CORS

After frontend is deployed, update backend environment variable:
1. Go to backend service
2. Environment → Edit `CORS_ORIGIN`
3. Change to: `https://your-frontend-url.onrender.com`
4. Save (service will auto-redeploy)

---

## 🎯 Your URLs

After deployment, you'll have:
- **Frontend**: `https://sunday-frontend.onrender.com`
- **Backend**: `https://sunday-backend.onrender.com`
- **Database**: Internal connection only

---

## ⚙️ Configuration Files Created

I've created these files for you:
- ✅ `render.yaml` - Infrastructure as code (optional, for Blueprint)
- ✅ `.gitignore` - Ignore sensitive files
- ✅ `README.md` - Project documentation

---

## 🔧 Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify database connection details
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS_ORIGIN in backend matches frontend URL
- Ensure backend is running (check Render dashboard)

### Database connection failed
- Verify DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
- Check database is in same region as backend
- Use Internal Database URL for DB_HOST (not external)

---

## 💡 Important Notes

### Free Tier Limitations
- ✅ **Truly free forever**
- ⚠️ Services **sleep after 15 minutes** of inactivity
- ⚠️ **Cold start**: ~30 seconds to wake up
- ✅ **750 hours/month** of runtime (enough for one service 24/7)
- ✅ **PostgreSQL**: 90 days of data retention

### Keep Services Awake (Optional)
Use a free service like UptimeRobot to ping your app every 14 minutes:
1. Go to https://uptimerobot.com
2. Add monitor for your frontend URL
3. Set interval to 5 minutes

---

## 🚀 Alternative: One-Click Deploy

### Using Render Blueprint

1. Add `render.yaml` to your repo (already created!)
2. Push to GitHub
3. Go to Render Dashboard
4. Click "New +" → "Blueprint"
5. Connect your repo
6. Render auto-creates all services!

---

## 📊 Monitoring

### View Logs
- Go to your service in Render
- Click "Logs" tab
- Real-time logs appear here

### Metrics
- Click "Metrics" tab
- See CPU, Memory, Request count
- Free tier includes basic metrics

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Render auto-deploys! 🎉
```

---

## 🎨 Custom Domain (Optional)

1. Buy domain (Namecheap, Google Domains)
2. In Render, go to your service
3. Click "Settings" → "Custom Domain"
4. Add your domain
5. Update DNS records as shown
6. Free SSL certificate included!

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| PostgreSQL | Free | $0/month |
| Backend | Free | $0/month |
| Frontend | Free | $0/month |
| **Total** | | **$0/month** ✨ |

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL database created
- [ ] Backend service deployed
- [ ] Frontend service deployed
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Test the application
- [ ] (Optional) Set up custom domain
- [ ] (Optional) Set up UptimeRobot

---

## 🆘 Need Help?

Common issues and solutions:

**"Cannot connect to database"**
- Use Internal Database URL for DB_HOST
- Check all DB credentials match

**"CORS error"**
- Update CORS_ORIGIN in backend to match frontend URL
- Include https:// in the URL

**"Service won't start"**
- Check build logs in Render dashboard
- Verify all environment variables are set
- Check Dockerfile is correct

---

## 🎉 You're Live!

Your app is now accessible to anyone on the internet!

Share your URL:
`https://your-app.onrender.com`

---

**Next Steps:**
1. Test all features
2. Share with friends
3. Add to your portfolio
4. Keep building! 🚀
