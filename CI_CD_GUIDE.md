# EC2 CI/CD Pipeline Setup Guide

## Architecture Overview

```
┌─────────────────┐
│  Code Push      │
│  to GitHub      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  GitHub Actions         │
│  • Build Dockerfile     │
│  • Push to Docker Hub   │
└────────┬────────────────┘
         │
         ▼
┌──────────────────┐
│  Docker Hub      │
│  (Image Registry)│
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│  AWS EC2 Instance            │
│  • Pull Docker Images        │
│  • Run docker-compose up     │
│  • Services Live             │
│  • Database Persistent       │
└──────────────────────────────┘
```

---

## Step 1: GitHub Setup

### 1.1 Create GitHub Secrets (Settings → Secrets and variables)

Add these secrets:

```
DOCKER_USERNAME          = your-docker-hub-username
DOCKER_PASSWORD          = your-docker-hub-password
AWS_EC2_HOST            = your-ec2-ip-address
AWS_EC2_USER            = ec2-user (or ubuntu)
AWS_EC2_KEY             = your-private-key (paste entire key)
```

**To generate SSH key pair:**
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ec2-key
# Copy contents of ~/.ssh/ec2-key and paste in AWS_EC2_KEY secret
```

### 1.2 Upload Public Key to EC2

On your EC2 machine:
```bash
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 1.3 GitHub Actions Workflow

The workflow file is ready at `.github/workflows/deploy.yml` and will:
- Trigger on push to `production` branch
- Build Docker images
- Push to Docker Hub
- SSH into EC2
- Pull latest code & images
- Restart containers

---

## Step 2: EC2 Instance Setup

### 2.1 Launch EC2 Instance

**AWS Console:**
1. EC2 → Launch Instance
2. AMI: Ubuntu Server 24.04 LTS (Free tier eligible)
3. Instance Type: t3.small or t3.medium (minimum 2GB RAM)
4. Storage: 20GB (gp3)
5. Security Group: Allow ports 22, 80, 443, 3000, 5173, 5174, 5175

### 2.2 Run Setup Script

SSH into EC2:
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# Clone repository
git clone https://github.com/unisole-skill-ai-labs/unisole-engine.git /opt/unisole
cd /opt/unisole

# Run setup (installs Docker, Docker Compose, Nginx, etc.)
bash scripts/setup-ec2.sh
```

### 2.3 Configure Environment

Edit the `.env` file created during setup:
```bash
nano .env
```

Set these values:
```env
DB_PASSWORD=your-strong-password-here
JWT_SECRET=generate-random-string-here
JWT_REFRESH_SECRET=another-random-string
RAZORPAY_KEY_SECRET=your-razorpay-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
API_BASE_URL=https://yourdomain.com
DOCKER_USERNAME=your-docker-username
```

Generate strong secrets:
```bash
openssl rand -base64 32
```

---

## Step 3: First Deployment

### 3.1 Build & Push Docker Images Locally

From your machine (one time):
```bash
cd unisole-engine

# Login to Docker Hub
docker login

# Build all service images
docker build -t your-username/unisole-engine:latest .
docker push your-username/unisole-engine:latest

# Do same for other services:
cd ../unisole-admin
docker build -t your-username/unisole-admin:latest .
docker push your-username/unisole-admin:latest

# Repeat for unisole-lms and unisole-seo
```

### 3.2 Deploy on EC2

SSH into EC2:
```bash
cd /opt/unisole

# Make script executable
chmod +x scripts/deploy.sh

# Deploy
bash scripts/deploy.sh
```

### 3.3 Verify Services

```bash
# Check running containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test API health
curl http://localhost:3000/api/health

# Access services
# Admin: http://your-ec2-ip:5173
# LMS: http://your-ec2-ip:5174
# API: http://your-ec2-ip:3000
```

---

## Step 4: Automatic CI/CD

Now every time you push to `production` branch:

```bash
git add .
git commit -m "Fix: something"
git push origin production
```

**Automatically:**
1. ✅ GitHub Actions builds Docker images
2. ✅ Images pushed to Docker Hub
3. ✅ GitHub Actions SSH into EC2
4. ✅ Pulls latest code & Docker images
5. ✅ Restarts all containers
6. ✅ Services updated with zero downtime

Check deployment status: GitHub → Your Repo → Actions

---

## Step 5: Database Management

### Backup Database Daily

Add to crontab on EC2:
```bash
crontab -e

# Add this line (backup at 2 AM daily)
0 2 * * * bash /opt/unisole/scripts/backup-db.sh
```

### Manual Backup

```bash
bash /opt/unisole/scripts/backup-db.sh
```

Backups stored in `/opt/unisole/backups/`

### Restore Database

```bash
# List backups
ls -la /opt/unisole/backups/

# Restore from backup (replace filename)
gunzip -c /opt/unisole/backups/unisole_backup_2026-08-27_02-00-00.sql.gz | \
  docker exec -i unisole-engine-db-1 psql -U postgres -d unisole
```

---

## Step 6: SSL/HTTPS Setup (Optional but Recommended)

### Using Let's Encrypt (Free)

On EC2:
```bash
sudo apt-get install certbot python3-certbot-nginx -y

sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates saved to /etc/letsencrypt/live/yourdomain.com/
# Copy to application:
sudo cp -r /etc/letsencrypt/live/yourdomain.com /opt/unisole/ssl/
sudo chown -R $(whoami):$(whoami) /opt/unisole/ssl/
```

Update `docker-compose.prod.yml` Nginx config with SSL certificates.

---

## Step 7: Monitoring & Logs

### View Live Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Monitor Server Health

```bash
# Check disk space
df -h

# Check memory/CPU
docker stats

# Check container health
docker-compose -f docker-compose.prod.yml ps
```

---

## Step 8: Scaling & Performance

### Increase API Replicas

Edit `docker-compose.prod.yml`:
```yaml
api:
  # ... existing config ...
  deploy:
    replicas: 3
```

With Nginx load balancing across replicas.

---

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.prod.yml logs api
```

### Database connection failed
```bash
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d unisole
```

### Out of disk space
```bash
# Clean Docker
docker system prune -a
```

### GitHub Actions deployment failed
Check: GitHub → Repo → Actions → Last workflow run → Logs

---

## Production Checklist

- ✅ GitHub secrets configured
- ✅ EC2 instance running
- ✅ SSH key added to authorized_keys
- ✅ .env configured with secure values
- ✅ Docker images pushed to Docker Hub
- ✅ First deployment successful
- ✅ Services accessible at ports
- ✅ Database backups scheduled
- ✅ SSL certificates installed
- ✅ Monitoring/logging setup
- ✅ DNS pointing to EC2 IP

---

## Quick Start Commands

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Check services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Backup database
bash scripts/backup-db.sh

# Deploy latest
bash scripts/deploy.sh
```

---

## Cost Estimation (AWS)

- **EC2 t3.small**: ~$7/month
- **Data transfer**: ~$1-5/month
- **Total**: ~$10-15/month

---

**Need help?** Check GitHub Actions logs or EC2 service logs for errors.
