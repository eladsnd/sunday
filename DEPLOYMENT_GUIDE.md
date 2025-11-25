# 🚀 Free Deployment Guide for Sunday

## Best Free Deployment Options

### Option 1: Railway.app (Recommended) ⭐
**Best for**: Full-stack apps with Docker
**Free Tier**: $5 credit/month (enough for small apps)

#### Steps:
1. **Sign up**: https://railway.app (use GitHub)
2. **Deploy from GitHub**:
   ```bash
   # Push your code to GitHub first
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```
3. **In Railway**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect docker-compose.yml
   - Add environment variables (see below)
4. **Done!** Railway provides a public URL

**Pros**: 
- ✅ Supports Docker Compose
- ✅ PostgreSQL included
- ✅ Auto-deploys on git push
- ✅ Free SSL certificate
- ✅ Easy to use

**Cons**:
- ⚠️ $5/month credit (may run out if heavily used)

---

### Option 2: Render.com (Also Great) ⭐
**Best for**: Separate frontend/backend deployment
**Free Tier**: Truly free (with limitations)

#### Steps:
1. **Sign up**: https://render.com
2. **Deploy Backend**:
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `/`
   - Build Command: `cd src && npm install`
   - Start Command: `npm run start:prod`
   - Add PostgreSQL database (free tier)
3. **Deploy Frontend**:
   - New → Static Site
   - Root Directory: `/client`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

**Pros**:
- ✅ Truly free tier
- ✅ Auto-deploys on git push
- ✅ Free SSL
- ✅ Free PostgreSQL (limited)

**Cons**:
- ⚠️ Services sleep after 15 min inactivity
- ⚠️ Slower cold starts

---

### Option 3: Fly.io (Advanced)
**Best for**: Docker apps with global deployment
**Free Tier**: 3 VMs, 3GB storage

#### Steps:
1. **Install flyctl**: 
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```
2. **Login & Deploy**:
   ```bash
   fly auth login
   fly launch
   ```

**Pros**:
- ✅ Great Docker support
- ✅ Global edge deployment
- ✅ Free PostgreSQL

**Cons**:
- ⚠️ Requires credit card
- ⚠️ More complex setup

---

## 📋 Pre-Deployment Checklist

### 1. Prepare Your Code

Create `.env.production` file:
```env
# Database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=sunday_db

# App
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-url.com
```

### 2. Update docker-compose.yml for Production

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 3. Add GitHub Repository

```bash
# Initialize git if not already done
git init

# Create .gitignore
echo "node_modules
dist
.env
.env.local
coverage
*.log" > .gitignore

# Commit and push
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sunday.git
git push -u origin main
```

---

## 🎯 Recommended: Railway Deployment (Step-by-Step)

### Step 1: Prepare Repository
```bash
# Make sure everything is committed
git add .
git commit -m "Production ready"
git push
```

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `sunday` repository
5. Railway will detect docker-compose.yml

### Step 3: Configure Services

Railway will create 3 services:
- **postgres**: Database (auto-configured)
- **backend**: NestJS API
- **frontend**: React app

### Step 4: Set Environment Variables

For **backend** service:
```
NODE_ENV=production
DB_HOST=${{Postgres.RAILWAY_PRIVATE_DOMAIN}}
DB_PORT=5432
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_DATABASE=${{Postgres.PGDATABASE}}
CORS_ORIGIN=${{frontend.RAILWAY_PUBLIC_DOMAIN}}
```

### Step 5: Get Your URL

Railway will provide URLs like:
- Frontend: `https://sunday-production.up.railway.app`
- Backend: `https://sunday-backend-production.up.railway.app`

### Step 6: Update Frontend API URL

Update `client/src/api/boardsApi.ts`:
```typescript
const api = axios.create({
    baseURL: import.meta.env.PROD 
        ? 'https://your-backend-url.railway.app/api'
        : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
```

---

## 🆓 100% Free Alternative: Vercel + Supabase

### Frontend: Vercel (Free)
1. Go to https://vercel.com
2. Import your GitHub repo
3. Set root directory to `client`
4. Deploy!

### Backend: Railway or Render (Free tier)
Deploy backend separately

### Database: Supabase (Free)
1. Go to https://supabase.com
2. Create new project
3. Get PostgreSQL connection string
4. Use in backend env vars

---

## 📊 Comparison Table

| Platform | Free Tier | Docker Support | Database | Auto-Deploy | Best For |
|----------|-----------|----------------|----------|-------------|----------|
| **Railway** | $5/mo credit | ✅ Excellent | ✅ PostgreSQL | ✅ Yes | Full-stack Docker apps |
| **Render** | ✅ Forever free | ⚠️ Limited | ✅ PostgreSQL | ✅ Yes | Separate services |
| **Fly.io** | 3 VMs free | ✅ Excellent | ✅ PostgreSQL | ✅ Yes | Advanced users |
| **Vercel + Supabase** | ✅ Forever free | ❌ No | ✅ PostgreSQL | ✅ Yes | Serverless apps |

---

## 🚀 Quick Start: Railway (5 minutes)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Link to your repo
railway link

# 5. Deploy!
railway up

# 6. Get your URL
railway domain
```

---

## 🔒 Security Checklist Before Going Live

- [ ] Change all default passwords
- [ ] Set strong DB_PASSWORD
- [ ] Enable CORS only for your domain
- [ ] Add rate limiting (optional)
- [ ] Set up monitoring (Railway/Render provide this)
- [ ] Review environment variables
- [ ] Test all features in production

---

## 📝 Post-Deployment

### Monitor Your App
- Railway: Built-in metrics dashboard
- Render: Logs and metrics in dashboard
- Set up error tracking (optional): Sentry.io (free tier)

### Custom Domain (Optional)
Most platforms support custom domains for free:
1. Buy domain (Namecheap, Google Domains)
2. Add domain in platform settings
3. Update DNS records

---

## 💡 My Recommendation

**For your Sunday app, I recommend Railway because:**
1. ✅ Works perfectly with Docker Compose
2. ✅ One-click deployment
3. ✅ Auto-scaling
4. ✅ Free SSL
5. ✅ $5/month credit is enough for moderate use
6. ✅ Easiest setup

**Alternative**: If you want 100% free forever, use **Render** (just note the sleep time).

---

## 🆘 Need Help?

I can help you:
1. Set up any of these platforms
2. Configure environment variables
3. Debug deployment issues
4. Set up custom domain
5. Add CI/CD pipeline

Just let me know which platform you want to use! 🚀
