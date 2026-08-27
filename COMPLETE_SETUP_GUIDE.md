# Unisole Complete Setup: Local Docker + Production with Vercel

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOCAL DEVELOPMENT                            │
├─────────────────────────────────────────────────────────────────────┤
│  Docker Compose (Single Machine - Your Computer)                     │
│  ├─ PostgreSQL Database                                              │
│  ├─ Backend API                                                      │
│  ├─ Admin Dashboard                                                  │
│  ├─ LMS App                                                          │
│  └─ SEO Website                                                      │
│                                                                       │
│  Access:                                                             │
│  ├─ API: http://localhost:3000                                      │
│  ├─ Admin: http://localhost:5173                                    │
│  ├─ LMS: http://localhost:5174                                      │
│  └─ SEO: http://localhost:5175                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  EC2 Instance (Backend Only)                                        │
│  ├─ Docker Container: PostgreSQL                                    │
│  ├─ Docker Container: Backend API                                   │
│  └─ Docker Container: Nginx (Reverse Proxy)                         │
│      └─ External: api.yourdomain.com (HTTPS)                       │
│                                                                       │
│  Vercel (Frontend Only - Auto-deployed)                             │
│  ├─ admin.yourdomain.com → Vercel CDN                               │
│  ├─ lms.yourdomain.com → Vercel CDN                                 │
│  └─ yourdomain.com → Vercel CDN                                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Local Development (5 minutes)

```bash
cd /Users/girish/Desktop/Unisole-Codebase/unisole-engine

# Start all services
docker-compose up --build

# Access everything locally:
# - http://localhost:3000  (API)
# - http://localhost:5173  (Admin)
# - http://localhost:5174  (LMS)
# - http://localhost:5175  (SEO)
```

### Production Deployment (Follow SETUP_STEPS.md)

1. Setup EC2 (20 min)
2. Deploy backend (5 min)
3. Deploy frontends to Vercel (5 min each)

---

## File Explanation

| File | Purpose | Environment |
|------|---------|-------------|
| `docker-compose.yml` | All services (dev) | Local only |
| `docker-compose.prod.yml` | Backend only | EC2 production |
| `nginx-prod.conf` | Simple API proxy | EC2 production |
| `.github/workflows/deploy.yml` | Auto-deploy backend | Production |
| `.env.docker` | Dev secrets | Local |
| `.env.production` | Prod secrets | EC2 production |

---

## Local Development Workflow

### Start All Services

```bash
cd /Users/girish/Desktop/Unisole-Codebase/unisole-engine

# First time
docker-compose up --build

# Subsequently
docker-compose up
```

### Make Changes

Edit code in any service:
- Backend: `src/` files
- Admin: `unisole-admin/src/`
- LMS: `unisole-lms/src/`
- SEO: `unisole-seo/src/`

Hot reload works automatically!

### Database Operations

```bash
# Connect to local database
docker-compose exec db psql -U postgres -d unisole

# View logs
docker-compose logs -f api
docker-compose logs -f db

# Restart services
docker-compose restart api

# Stop everything
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### Test Everything

```bash
# API health
curl http://localhost:3000/api/health

# Admin
http://localhost:5173

# LMS
http://localhost:5174

# SEO
http://localhost:5175
```

---

## Production Workflow

### 1. Backend Changes → EC2

```bash
# Local machine
git add .
git commit -m "Feature: xyz"
git push origin production

# Automatically:
# ✅ GitHub Actions builds backend Docker image
# ✅ Pushes to Docker Hub
# ✅ SSH into EC2
# ✅ Pulls image and restarts containers
# ✅ Backend live in 10-15 minutes
```

### 2. Frontend Changes → Vercel

**Admin Dashboard** (unisole-admin repo):
```bash
git add .
git commit -m "Feature: xyz"
git push origin production
# ✅ Vercel auto-deploys to admin.yourdomain.com
```

**LMS App** (unisole-lms repo):
```bash
git add .
git commit -m "Feature: xyz"
git push origin production
# ✅ Vercel auto-deploys to lms.yourdomain.com
```

**SEO Website** (unisole-seo repo):
```bash
git add .
git commit -m "Feature: xyz"
git push origin production
# ✅ Vercel auto-deploys to yourdomain.com
```

---

## Production Files Only on EC2

You **only need** these files on EC2 (`/opt/unisole/`):

```
Docker files:
  ├─ Dockerfile          (Backend)
  ├─ package.json
  ├─ src/                (Backend code)
  ├─ docker-compose.prod.yml
  ├─ nginx-prod.conf     → Rename to nginx-api.conf on EC2
  ├─ .env                (Production secrets)
  ├─ .github/workflows/deploy.yml

Database:
  └─ edtech_schema_and_seed.sql

Scripts:
  ├─ scripts/deploy.sh
  ├─ scripts/backup-db.sh
  └─ scripts/setup-ec2.sh

NO unisole-admin, unisole-lms, unisole-seo folders needed!
(They're on Vercel)
```

---

## Environment Variables

### Local (.env.docker)

```env
NODE_ENV=development
JWT_SECRET=dev-secret-key
RAZORPAY_KEY_SECRET=rzp_test_key
VITE_API_BASE_URL=http://localhost:3000
```

### Production (.env on EC2)

```env
NODE_ENV=production
JWT_SECRET=STRONG-RANDOM-32-CHARS
RAZORPAY_KEY_SECRET=YOUR-ACTUAL-KEY
API_BASE_URL=https://api.yourdomain.com
DOCKER_USERNAME=your-docker-username
DB_PASSWORD=STRONG-RANDOM-PASSWORD
```

---

## Docker Images

You need to build and push these **once** to Docker Hub:

```bash
# Backend (only one needed for production)
cd /Users/girish/Desktop/Unisole-Codebase/unisole-engine
docker build -t your-username/unisole-engine:latest .
docker push your-username/unisole-engine:latest

# Optional: Pre-build frontends for local testing
# (Not needed for production - Vercel builds them)
cd ../unisole-admin
docker build -t your-username/unisole-admin:latest .
docker push your-username/unisole-admin:latest
# (Repeat for lms/seo if desired)
```

---

## Verification Checklist

### Local Setup
- [ ] `docker-compose up` starts all services
- [ ] Can access http://localhost:3000 (API)
- [ ] Can access http://localhost:5173 (Admin)
- [ ] Can access http://localhost:5174 (LMS)
- [ ] Can access http://localhost:5175 (SEO)
- [ ] Database works: `docker-compose exec db psql -U postgres -d unisole`

### Production Setup
- [ ] EC2 instance running
- [ ] Backend Docker image built and pushed
- [ ] GitHub secrets configured
- [ ] `docker-compose -f docker-compose.prod.yml ps` shows 3 containers (db, api, nginx)
- [ ] Can access api.yourdomain.com (HTTPS)
- [ ] Admin/LMS/SEO deployed on Vercel

---

## Troubleshooting

### Local Issues

| Problem | Solution |
|---------|----------|
| Port already in use | `lsof -ti:PORT \| xargs kill -9` |
| Database won't start | `docker-compose down -v` then `docker-compose up` |
| Changes not reflecting | Check if service is running: `docker-compose ps` |
| Out of memory | `docker system prune -a` |

### Production Issues

See: SETUP_STEPS.md → Troubleshooting section

---

## Cost Breakdown

| Component | Local | Production |
|-----------|-------|------------|
| Your Computer | ✅ | N/A |
| EC2 Instance | N/A | $5-7/month |
| Vercel (Free) | N/A | FREE |
| Docker Hub | FREE | FREE |
| **Total** | FREE | $5-7/month |

---

## What's Next?

1. ✅ Read SETUP_STEPS.md for production deployment
2. ✅ Read VERCEL_SETUP.md for frontend deployment
3. ✅ Start local development: `docker-compose up`
4. ✅ Push code to production when ready

**You now have a professional, scalable architecture!** 🚀
