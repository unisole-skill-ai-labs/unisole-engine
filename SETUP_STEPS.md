# Complete CI/CD Setup Steps for Unisole on AWS EC2

Follow these steps in order. Each section should take 5-15 minutes.

---

## **PHASE 1: Prepare GitHub (15 minutes)**

### Step 1: Generate SSH Key for EC2

On your **local machine**:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ec2-unisole-key -N ""

# View your private key (you'll need this)
cat ~/.ssh/ec2-unisole-key

# View your public key
cat ~/.ssh/ec2-unisole-key.pub
```

**Keep the private key safe** - you'll need it for GitHub/EC2 access.

---

### Step 2: Add GitHub Secrets

1. Go to GitHub: **Your Repo → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Add these secrets one by one:

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `DOCKER_USERNAME` | Your Docker Hub username | [docker.com](https://docker.com) login |
| `DOCKER_PASSWORD` | Your Docker Hub password/token | Settings → Security → New token |
| `AWS_EC2_HOST` | Your EC2 IP address | AWS Console (after launching EC2) |
| `AWS_EC2_USER` | `ec2-user` or `ubuntu` | Depends on AMI (use `ubuntu` for Ubuntu 24.04) |
| `AWS_EC2_KEY` | **Your entire private SSH key** | From Step 1 above (`~/.ssh/ec2-unisole-key` contents) |

**How to add a secret:**
- Secret name: `DOCKER_USERNAME`
- Secret value: `your-docker-hub-username`
- Click "Add secret"

Repeat for all 5 secrets.

---

### Step 3: Prepare Docker Hub Token

1. Go to [Docker Hub](https://hub.docker.com)
2. Login to your account
3. Account settings → Security → New Access Token
4. Name: `Unisole CI/CD`
5. Permissions: Read & Write
6. Copy the token
7. Use this as `DOCKER_PASSWORD` in GitHub secrets

---

## **PHASE 2: Launch AWS EC2 Instance (20 minutes)**

### Step 4: Create EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **EC2 Dashboard**
3. Click **"Launch Instances"**

| Setting | Value |
|---------|-------|
| **Name** | `unisole-production` or `unisole-app` |
| **AMI** | Ubuntu Server 24.04 LTS (free tier eligible) |
| **Instance Type** | `t3.small` (or `t2.small` free tier) |
| **Key pair** | Create new or use existing |
| **VPC** | Default |
| **Subnet** | Default |
| **Auto-assign public IP** | Enable |
| **Storage** | 20 GB (gp3) |
| **Security Group** | Create new |

---

### Step 5: Configure Security Group

In security group settings, add **Inbound Rules**:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | 0.0.0.0/0 (or your IP) |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 (API) |
| Custom TCP | TCP | 5173 | 0.0.0.0/0 (Admin) |
| Custom TCP | TCP | 5174 | 0.0.0.0/0 (LMS) |
| Custom TCP | TCP | 5175 | 0.0.0.0/0 (SEO) |
| Custom TCP | TCP | 5433 | 0.0.0.0/0 (Database) |

---

### Step 6: Launch & Get IP

1. Click **"Launch Instance"**
2. Wait for instance to start (2-3 minutes)
3. Go to EC2 Dashboard → Instances
4. Copy your **Public IPv4 address** (e.g., `52.123.45.67`)
5. Update GitHub secret `AWS_EC2_HOST` with this IP

---

### Step 7: Add Your SSH Key to EC2

Download your key pair `.pem` file from AWS and set permissions:

```bash
# On your local machine
chmod 600 ~/Downloads/unisole-key.pem

# Test SSH connection
ssh -i ~/Downloads/unisole-key.pem ubuntu@YOUR_EC2_IP

# You should see: ubuntu@ip-xxx:/home/ubuntu$
# If yes, SSH works! Type 'exit' to quit
```

---

## **PHASE 3: Setup EC2 Machine (15 minutes)**

### Step 8: SSH into EC2

```bash
ssh -i ~/Downloads/unisole-key.pem ubuntu@YOUR_EC2_IP
```

---

### Step 9: Clone Repository & Run Setup

```bash
# Create app directory
sudo mkdir -p /opt/unisole
sudo chown -R ubuntu:ubuntu /opt/unisole

# Clone repository
cd /opt/unisole
git clone https://github.com/unisole-skill-ai-labs/unisole-engine.git .

# Run setup script (this will take 5-10 minutes)
bash scripts/setup-ec2.sh
```

This installs:
- Docker & Docker Compose
- PostgreSQL Database (`db` container with migrations)
- Unisole Backend Engine (`api` container)
- Nginx Reverse Proxy (`nginx` container on port 80/443)
- Frontends (`unisole-app`, `unisole-admin`, `unisole-seo-website`) deployed directly via Git pushes on **Vercel**

---

### Step 10: Configure Environment

```bash
# Edit the .env file
nano .env
```

Update these values:

```env
NODE_ENV=production
API_PORT=3000
API_BASE_URL=https://yourdomain.com  # Use EC2 IP if no domain yet

DB_USER=postgres
DB_PASSWORD=______  # Already generated (random 32 chars)
DB_NAME=unisole

JWT_SECRET=______  # Already generated
JWT_REFRESH_SECRET=______  # Already generated

RAZORPAY_KEY_SECRET=YOUR_ACTUAL_RAZORPAY_KEY
RAZORPAY_WEBHOOK_SECRET=YOUR_ACTUAL_WEBHOOK_SECRET

DOCKER_USERNAME=your-docker-username
```

> To generate a secure secret if needed:
> ```bash
> openssl rand -base64 32
> ```

**Save file:** Press `Ctrl+X` → `Y` → `Enter`

---

### Step 11: Initial Deployment

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy all services
bash scripts/deploy.sh
```

This will:
- Login to Docker Hub
- Pull Docker images (may take 5-10 min first time)
- Start all containers
- Initialize database

**Wait for it to complete** - you should see:
```
✅ Deployment completed successfully!
```

---

### Step 12: Verify Services Running

```bash
# Check all containers
docker-compose -f docker-compose.prod.yml ps

# Should show: (all containers with status "Up")
# - unisole-engine-db-1 (PostgreSQL)
# - unisole-engine-api-1 (Backend API)
# - unisole-engine-admin-1 (Admin Dashboard)
# - unisole-engine-lms-1 (LMS App)
# - unisole-engine-seo-1 (SEO Website)
# - unisole-engine-nginx-1 (Reverse Proxy)
```

---

### Step 13: Test Services

```bash
# Test API health
curl http://localhost:3000/api/health

# Should return: successful response

# Test other services
curl http://localhost/health  # Nginx health check
```

---

### Step 14: Access Services from Browser

Open your browser and go to:

| Service | URL |
|---------|-----|
| **API** | `http://YOUR_EC2_IP:3000` |
| **Admin** | `http://YOUR_EC2_IP:5173` |
| **LMS** | `http://YOUR_EC2_IP:5174` |
| **SEO** | `http://YOUR_EC2_IP:5175` |

All should load successfully! ✅

---

### Step 15: Exit SSH

```bash
exit
```

---

## **PHASE 4: First Automated Deployment (5 minutes)**

### Step 16: Push to Production Branch

On your **local machine**:

```bash
# Navigate to repo
cd /Users/girish/Desktop/Unisole-Codebase/unisole-engine

# Make a small change (e.g., update README or add comment)
echo "# Updated $(date)" >> README.md

# Commit and push to production
git add .
git commit -m "ci: trigger first automated deployment"
git push origin production
```

---

### Step 17: Monitor GitHub Actions

1. Go to GitHub → Your Repo
2. Click **"Actions"** tab
3. Watch the workflow run in real-time
4. You should see:
   - ✅ Build-and-push job running
   - ✅ Deploy-to-ec2 job running
   - ✅ Both jobs completing successfully

**Total time:** 10-15 minutes

---

### Step 18: Verify Deployment

```bash
# SSH back into EC2
ssh -i ~/Downloads/unisole-key.pem ubuntu@YOUR_EC2_IP

# Check containers restarted
docker-compose -f docker-compose.prod.yml ps

# View recent logs
docker-compose -f docker-compose.prod.yml logs --tail=20
```

Should see containers with recent restart times. ✅

---

## **PHASE 5: Setup Database Backups (5 minutes)**

### Step 19: Enable Daily Backups

```bash
# SSH into EC2
ssh -i ~/Downloads/unisole-key.pem ubuntu@YOUR_EC2_IP

# Connect to EC2
cd /opt/unisole

# Setup cron job for daily backups at 2 AM
crontab -e

# Add this line at the bottom:
0 2 * * * bash /opt/unisole/scripts/backup-db.sh

# Save: Ctrl+X → Y → Enter
```

---

### Step 20: Test Backup

```bash
# Run backup manually
bash scripts/backup-db.sh

# Should output:
# ✅ Backup completed: /opt/unisole/backups/unisole_backup_YYYY-MM-DD_HH-MM-SS.sql.gz

# List backups
ls -lh backups/
```

---

## **PHASE 6: Optional - Setup SSL/HTTPS (15 minutes)**

### Step 21: Get Domain Name

If you have a domain:
1. Update DNS A record to point to EC2 IP
2. Update `API_BASE_URL` in `.env` to your domain

---

### Step 22: Install SSL Certificate

```bash
# SSH into EC2
ssh -i ~/Downloads/unisole-key.pem ubuntu@YOUR_EC2_IP

# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to app directory
sudo cp -r /etc/letsencrypt/live/yourdomain.com /opt/unisole/ssl/
sudo chown -R ubuntu:ubuntu /opt/unisole/ssl/
```

---

### Step 23: Update Nginx Config

```bash
cd /opt/unisole

# Edit nginx config
nano nginx-prod.conf

# Update these lines:
# server_name yourdomain.com www.yourdomain.com;
# ssl_certificate /etc/nginx/ssl/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/nginx/ssl/yourdomain.com/privkey.pem;

# Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## **SUMMARY: Done! ✅**

You now have:

✅ **Automated CI/CD** - Push code → Auto deploy  
✅ **Multiple Services** - API, Admin, LMS, SEO running  
✅ **Production Database** - PostgreSQL on EC2  
✅ **Daily Backups** - Automatic database backups  
✅ **Health Checks** - Services auto-restart if down  
✅ **Logging** - All logs preserved  
✅ **Cost Efficient** - ~$10-15/month  

---

## **After This: Regular Workflow**

```bash
# Work normally on your machine
nano file.js          # Make changes
git add .
git commit -m "Feature: xyz"
git push origin production

# 🚀 Everything auto-deploys!
# Monitor: GitHub → Actions tab
# Check services: http://YOUR_EC2_IP
```

---

## **Troubleshooting Reference**

| Problem | Solution |
|---------|----------|
| Can't SSH to EC2 | Check key permissions: `chmod 600 key.pem` |
| GitHub Actions fails | Check: Actions tab → Failed job → See error logs |
| Services not starting | SSH to EC2: `docker-compose -f docker-compose.prod.yml logs` |
| Database won't connect | Check `.env` DB credentials match |
| Port already in use | Change port in `docker-compose.prod.yml` |

---

## **Time Breakdown**

| Phase | Time | Status |
|-------|------|--------|
| 1. GitHub Setup | 15 min | ⏳ |
| 2. Launch EC2 | 20 min | ⏳ |
| 3. EC2 Setup | 15 min | ⏳ |
| 4. First Deploy | 5 min | ⏳ |
| 5. Backups | 5 min | ⏳ |
| 6. SSL (Optional) | 15 min | ⏳ |
| **TOTAL** | **~75 min** | 🎯 |

---

**You're ready to deploy! Start with Phase 1.** 🚀
