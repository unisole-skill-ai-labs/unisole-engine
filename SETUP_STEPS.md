# Complete CI/CD & Deployment Setup: AWS EC2 (Backend) + Vercel (Frontends)

This guide documents the setup for Unisole's production architecture:
* **AWS EC2:** Hosts PostgreSQL Database, Backend Engine API, and Nginx Reverse Proxy via Docker.
* **Vercel:** Hosts all 3 client-side Frontends (`unisole-app`, `unisole-admin`, `unisole-seo-website`) with automated CI/CD on Git push.

---

## 🏛️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                        VERCEL                          │
│  • unisole-app         (LMS Frontend)                  │
│  • unisole-admin       (Admin Dashboard)               │
│  • unisole-seo-website (Landing & SEO Site)            │
│  Auto-deployed on git push to GitHub                   │
└─────────────────────────┬──────────────────────────────┘
                          │ (API Requests: VITE_API_BASE_URL)
                          ▼
┌────────────────────────────────────────────────────────┐
│                    AWS EC2 SERVER                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Nginx Container (Ports 80 / 443)                 │  │
│  │   └── Reverse proxies requests to API Backend    │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Backend API: unisole-engine (Port 3000)          │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Database: PostgreSQL 16 (Port 5433:5432)         │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## **PHASE 1: Prepare GitHub Secrets for Backend (10 minutes)**

### Step 1: Generate SSH Key for EC2

On your **local machine**:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ec2-unisole-key -N ""

# View your private key (you'll paste this into GitHub Secrets)
cat ~/.ssh/ec2-unisole-key

# View your public key (you'll add this to EC2 ~/.ssh/authorized_keys)
cat ~/.ssh/ec2-unisole-key.pub
```

---

### Step 2: Add GitHub Secrets to `unisole-engine`

1. Go to GitHub: **unisole-engine → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Add these 5 secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKER_USERNAME` | `divyank380` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub Access Token | Generated in Docker Hub → Account Settings → Security → New Access Token |
| `AWS_EC2_HOST` | `54.xx.xx.xx` | **Public IPv4 address** (or Elastic IP) of your EC2 instance |
| `AWS_EC2_USER` | `ubuntu` | SSH user for Ubuntu EC2 |
| `AWS_EC2_KEY` | `-----BEGIN OPENSSH PRIVATE KEY...` | Full private key generated in Step 1 (`~/.ssh/ec2-unisole-key`) |

---

## **PHASE 2: Launch AWS EC2 Instance (15 minutes)**

### Step 3: Create EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com) → **EC2 Dashboard** → **Launch Instances**.

| Setting | Recommended Value |
|---------|-------------------|
| **Name** | `unisole-backend-prod` |
| **AMI** | Ubuntu Server 24.04 LTS (or 22.04 LTS) |
| **Instance Type** | `t3.small` (2 vCPU, 2GB RAM) or `t2.small` |
| **Key Pair** | Select existing or create new `.pem` |
| **Storage** | 20 GB (gp3) |
| **Auto-assign Public IP** | **Enable** (or allocate an Elastic IP) |

---

### Step 4: Configure Security Group Inbound Rules

Add the following **Inbound Rules**:

| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| **SSH** | TCP | `22` | `0.0.0.0/0` | SSH Access & GitHub Actions deploy |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Nginx Public Traffic |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | SSL Encrypted Traffic |
| **Custom TCP** | TCP | `3000` | `0.0.0.0/0` | Direct API Testing |
| **Custom TCP** | TCP | `5433` | Your IP only | Remote DB Access (Optional) |

---

### Step 5: Add GitHub Actions Public Key to EC2

1. Download your AWS `.pem` key pair and connect to EC2 from your local terminal:
```bash
chmod 600 ~/Downloads/your-key.pem
ssh -i ~/Downloads/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

2. On the **EC2 instance**, append your GitHub Actions public key to `~/.ssh/authorized_keys`:
```bash
# Replace with the output from cat ~/.ssh/ec2-unisole-key.pub on your local PC
echo "ssh-rsa AAAAB3NzaC1yc2EAAA... ec2-unisole-key" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## **PHASE 3: Setup EC2 Machine (10 minutes)**

### Step 6: Clone Repository & Run Initial Setup

While SSH'd into EC2:

```bash
# 1. Create app directory with proper ownership
sudo mkdir -p /opt/unisole
sudo chown -R ubuntu:ubuntu /opt/unisole

# 2. Clone the backend repository
cd /opt/unisole
git clone https://github.com/unisole-skill-ai-labs/unisole-engine.git .

# 3. Run setup script (Installs Docker, Docker Compose, Git, sets up .env)
bash scripts/setup-ec2.sh
```

---

### Step 7: Configure Production Environment Variables

Edit the generated `.env` file:

```bash
nano /opt/unisole/.env
```

Ensure the following variables are configured:

```env
NODE_ENV=production
API_PORT=3000
API_BASE_URL=https://api.unisole.org  # Or http://YOUR_EC2_PUBLIC_IP

DB_USER=postgres
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_NAME=unisole

JWT_SECRET=YOUR_RANDOM_32_CHAR_SECRET
JWT_REFRESH_SECRET=YOUR_RANDOM_32_CHAR_REFRESH_SECRET

RAZORPAY_KEY_SECRET=YOUR_ACTUAL_RAZORPAY_KEY
RAZORPAY_WEBHOOK_SECRET=YOUR_ACTUAL_WEBHOOK_SECRET

DOCKER_USERNAME=divyank380
```

*(Press `Ctrl+O` → `Enter` to save, `Ctrl+X` to exit)*

---

### Step 8: Deploy Backend on EC2

```bash
cd /opt/unisole
bash scripts/deploy.sh
```

This pulls `postgres:16-alpine`, `divyank380/unisole-engine:latest`, and `nginx:1.27-alpine`, automatically runs database schema migrations (`edtech_schema_and_seed.sql`), and starts the backend!

---

### Step 9: Verify Running Backend Services

```bash
docker compose -f docker-compose.prod.yml ps
```

You should see 3 running containers:
* `unisole-db-1` (healthy)
* `unisole-api-1` (healthy)
* `unisole-nginx-1` (Up)

**Test from browser or curl:**
```bash
curl http://localhost/health
# Returns: healthy

curl http://localhost:3000/
# Returns: {"status":"ok","service":"Unisole Engine API","version":"2.0.0","health":"/health"}
```

---

## **PHASE 4: Deploy Frontends to Vercel (10 minutes)**

All 3 frontends run independently on Vercel with automatic deployments on git pushes.

### Step 10: Deploy `unisole-app` (LMS Frontend)
1. Go to [Vercel Dashboard](https://vercel.com) → **Add New** → **Project**.
2. Select your `unisole-app` repository.
3. In **Environment Variables**:
   * Key: `VITE_API_BASE_URL`
   * Value: `http://YOUR_EC2_PUBLIC_IP` (or `https://api.unisole.org`)
4. Click **Deploy**.

---

### Step 11: Deploy `unisole-admin` (Admin Dashboard)
1. In Vercel, import the `unisole-admin` repository.
2. In **Environment Variables**:
   * Key: `VITE_API_BASE_URL`
   * Value: `http://YOUR_EC2_PUBLIC_IP` (or `https://api.unisole.org`)
3. Click **Deploy**.

---

### Step 12: Deploy `unisole-seo-website` (Landing Page & SEO)
1. In Vercel, import the `unisole-seo-website` repository.
2. In **Environment Variables**:
   * Key: `VITE_API_BASE_URL`
   * Value: `http://YOUR_EC2_PUBLIC_IP` (or `https://api.unisole.org`)
3. Click **Deploy**.

---

## **PHASE 5: Automated GitHub Actions CI/CD Workflow**

### How Auto-Deployment Works:

1. Whenever you push code to the `production` branch of `unisole-engine`:
```bash
cd unisole-engine
git add .
git commit -m "feat: updated api endpoint"
git push origin production
```

2. **GitHub Actions automatically:**
   * Builds the `unisole-engine` Docker image
   * Pushes the image to Docker Hub (`divyank380/unisole-engine:latest`)
   * Connects via SSH to your EC2 instance
   * Executes zero-downtime rolling restart of the backend container

3. For Frontends (`unisole-app`, `unisole-admin`, `unisole-seo-website`):
   * Simply push to `main`/`master` in GitHub. Vercel detects the push and instantly builds & deploys to its global edge network.

---

## **PHASE 6: Setup Daily Database Backups (5 minutes)**

On your **EC2 instance**:

```bash
cd /opt/unisole

# Setup cron job for daily backups at 2:00 AM UTC
crontab -e

# Paste at the bottom:
0 2 * * * bash /opt/unisole/scripts/backup-db.sh >> /var/log/unisole-backup.log 2>&1
```

**Test backup manually:**
```bash
bash scripts/backup-db.sh
ls -lh /opt/unisole/backups/
```

---

## 🛠️ Quick Troubleshooting Guide

| Issue | Solution |
|---|---|
| **Port 80/443 already in use** | Run `sudo systemctl stop nginx && sudo systemctl disable nginx` on host so Docker Nginx can bind to port 80. |
| **Postgres container unhealthy** | Run `docker compose -f docker-compose.prod.yml down -v` to reset corrupted volume, then rerun `bash scripts/deploy.sh`. |
| **CORS errors in frontend console** | Backend Express API has `cors()` enabled in `src/index.ts`. Verify your frontend's `VITE_API_BASE_URL` matches the EC2 IP/domain. |
| **GitHub Actions SSH Timeout** | Check that EC2 Security Group allows Port 22 from `0.0.0.0/0`, and `AWS_EC2_HOST` secret uses the **Public IPv4 address** (not private IP). |
