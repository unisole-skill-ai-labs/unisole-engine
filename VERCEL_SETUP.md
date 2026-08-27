# Vercel Setup Guide for Frontend Deployments

Deploy Admin Dashboard, LMS, and SEO Website to Vercel with auto-deployment.

---

## Why Vercel?

✅ **Free Tier** - Perfect for your needs  
✅ **Auto-Deploy** - Push to production → Auto-deployed  
✅ **Global CDN** - Super fast worldwide  
✅ **HTTPS/SSL** - Automatic and free  
✅ **Zero Config** - Works with Vite automatically  
✅ **Environment Variables** - Secure secrets management  
✅ **Rollback** - Go back to previous deployments instantly  

---

## Setup Once Per Frontend

Follow these steps for each:
- `unisole-admin`
- `unisole-lms`
- `unisole-seo`

---

## Step 1: Connect to Vercel

### 1.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Click "Continue with GitHub"
4. Authorize Vercel

### 1.2 Import Repository

1. Click **"New Project"** on Vercel dashboard
2. Select **GitHub** → Search for `unisole-admin`
3. Click **"Import"**

---

## Step 2: Configure Project

### 2.1 Basic Settings

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Root Directory** | `./` (leave default) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |

✅ Vercel auto-detects Vite - usually pre-filled!

### 2.2 Environment Variables

Add for each frontend:

**For Admin Dashboard** (`unisole-admin`):
```
VITE_API_BASE_URL = https://api.yourdomain.com
```

**For LMS App** (`unisole-lms`):
```
VITE_API_BASE_URL = https://api.yourdomain.com
```

**For SEO Website** (`unisole-seo`):
```
VITE_API_BASE_URL = https://api.yourdomain.com
```

**How to add:**
1. Click **"Environment Variables"**
2. Key: `VITE_API_BASE_URL`
3. Value: `https://api.yourdomain.com`
4. Select Production environment (or all)
5. Click "Add"

---

## Step 3: Domain Setup (Optional but Recommended)

### 3.1 Using Subdomains

For **Admin Dashboard** on `admin.yourdomain.com`:

1. In Vercel Project Settings → Domains
2. Click "Add"
3. Enter: `admin.yourdomain.com`
4. Follow instructions to add DNS records

**DNS Records to Add:**
```
Type: CNAME
Name: admin
Value: cname.vercel.com
TTL: 3600
```

**For LMS** (`lms.yourdomain.com`):
```
Type: CNAME
Name: lms
Value: cname.vercel.com
TTL: 3600
```

**For SEO Website** (`yourdomain.com`):
```
Type: A
Name: @ (or your domain)
Value: 76.76.19.165 (Vercel's IP)
TTL: 3600
```

### 3.2 Wait for DNS Propagation

DNS changes take 5-48 hours. You can check:
```bash
nslookup admin.yourdomain.com
```

Should show Vercel IP after propagation.

---

## Step 4: Auto-Deployment

### 4.1 How It Works

Once connected to Vercel:

```
You push to production branch
        ↓
GitHub webhook triggers Vercel
        ↓
Vercel pulls latest code
        ↓
Vercel runs: npm ci && npm run build
        ↓
Vercel deploys to admin.yourdomain.com
        ↓
Live! (Usually within 2-5 minutes)
```

### 4.2 Make Code Changes

```bash
# In unisole-admin directory
cd /Users/girish/Desktop/Unisole-Codebase/unisole-admin

# Make changes
nano src/components/Dashboard.jsx

# Commit and push
git add .
git commit -m "Feature: Update dashboard UI"
git push origin production

# Watch deployment
# Vercel sends commit status to GitHub
# Check: Your Repo → Commits → See ✅ or ❌
```

### 4.3 Monitor Deployments

**On Vercel Dashboard:**
1. Click your project
2. Deployments tab shows all deploys
3. Click a deployment to see logs
4. Click "View Production" to see live site

**On GitHub:**
1. Your Repo → Commits
2. Each commit shows deployment status
3. Green ✅ = Deployed
4. Red ❌ = Failed (click to see error)

---

## Step 5: Environment Variables Update

### When Backend URL Changes

If backend domain changes (e.g., `api.yourdomain.com` → different domain):

1. Vercel Project → Settings → Environment Variables
2. Edit `VITE_API_BASE_URL`
3. Change value
4. Redeploy: Click deploy button or push new commit

---

## Troubleshooting Vercel

### Deployment Failed

1. **Check logs:**
   - Vercel Dashboard → Deployments → Failed → Click → See error
   - Usually: missing dependencies, build error, etc.

2. **Common fixes:**
   ```bash
   # Fix missing dependencies
   npm install
   git add package-lock.json
   git commit -m "fix: update dependencies"
   git push origin production
   ```

### Site shows 404 after deploying

1. Check environment variables are set
2. Check API_BASE_URL is correct
3. Check backend is running and accessible
4. Redeploy: Push new commit or manual redeploy on Vercel

### DNS not working

```bash
# Check DNS propagation
nslookup admin.yourdomain.com

# If not showing Vercel IP, wait or check records are correct
dig admin.yourdomain.com
```

### CORS errors from API

The issue is usually backend CORS settings, not Vercel.

Fix on EC2:
```bash
# Check nginx-api.conf has proper CORS headers
# OR update backend API CORS settings

# Example in Express:
app.use(cors({
  origin: ['https://admin.yourdomain.com', 'https://lms.yourdomain.com'],
  credentials: true
}));
```

---

## Vercel vs Local

| Aspect | Local | Vercel |
|--------|-------|--------|
| **URL** | http://localhost:5173 | https://admin.yourdomain.com |
| **Deploy Time** | Instant (HMR) | 2-5 minutes |
| **Rollback** | git revert | Click button |
| **Performance** | Good | Excellent (CDN) |
| **Cost** | Free | Free |

---

## Set Up All Three

Repeat above steps for:

1. **unisole-admin** → `admin.yourdomain.com`
2. **unisole-lms** → `lms.yourdomain.com`  
3. **unisole-seo** → `yourdomain.com`

---

## GitHub Integration Benefits

### Automatic Preview Deployments

Every pull request gets its own URL:
```
Example: https://pr-123-unisole-admin.vercel.app
↓
Click to test before merging
```

### Status Checks

Each commit shows:
- ✅ Deployment successful
- ❌ Deployment failed
- 🔄 Building

---

## Production Deployment Sequence

When everything is ready:

1. **Backend ready on EC2:**
   ```
   ✅ EC2 running
   ✅ Docker containers up
   ✅ api.yourdomain.com accessible
   ```

2. **Deploy Admin:**
   ```bash
   cd unisole-admin
   git push origin production
   # Wait for Vercel → Live on admin.yourdomain.com
   ```

3. **Deploy LMS:**
   ```bash
   cd ../unisole-lms
   git push origin production
   # Wait for Vercel → Live on lms.yourdomain.com
   ```

4. **Deploy SEO:**
   ```bash
   cd ../unisole-seo
   git push origin production
   # Wait for Vercel → Live on yourdomain.com
   ```

5. **Update Environment Variables (if needed):**
   - Ensure all frontends have correct `VITE_API_BASE_URL`
   - Deploy if changed

6. **Test Everything:**
   - Visit admin.yourdomain.com → Check functionality
   - Visit lms.yourdomain.com → Check functionality
   - Visit yourdomain.com → Check functionality

---

## Monitoring Deployments

### See Recent Deployments

```bash
# On each frontend repo
# Vercel Dashboard → Deployments
# Shows last 50 deployments with logs and status
```

### Get Notifications

In Vercel Settings:
- Email alerts on deployment success/failure
- Slack integration (optional)
- GitHub integration (automatic)

---

## Cost & Limits (Free Plan)

✅ **Included:**
- Unlimited deployments
- Unlimited project versions
- HTTPS/SSL
- Global CDN
- Environment variables
- Preview deployments
- 100 GB bandwidth/month (plenty!)

❌ **Not included:**
- Custom domains (you use DNS yourself)
- Advanced build cache (usually not needed)

🚀 **You're completely free for these use cases!**

---

## Next Steps

1. ✅ Create Vercel account
2. ✅ Import `unisole-admin` repository
3. ✅ Set environment variables
4. ✅ Configure domain (optional)
5. ✅ Verify deployment works
6. ✅ Repeat for `unisole-lms` and `unisole-seo`
7. ✅ Test all services together

**All three frontends will auto-deploy** when you push to production! 🚀
