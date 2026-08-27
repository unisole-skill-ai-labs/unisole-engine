# CI/CD Quick Reference

## Flow Diagram

```
Local Development (Your Machine)
    ↓ git push origin production
    ↓
GitHub Repository
    ↓ Triggers GitHub Actions
    ↓
GitHub Actions Workflow (.github/workflows/deploy.yml)
    ├─ Step 1: Build Docker images for all services
    ├─ Step 2: Push to Docker Hub
    └─ Step 3: SSH to EC2 and deploy
    ↓
AWS EC2 Instance
    ├─ Pull latest code
    ├─ Pull latest Docker images
    ├─ Stop old containers
    ├─ Start new containers
    └─ Database persists (volumes)
    ↓
Live Services
    ├─ API: yourdomain.com/api
    ├─ Admin: yourdomain.com/admin
    ├─ LMS: yourdomain.com/lms
    └─ SEO: yourdomain.com
```

---

## Setup Timeline

### Day 1: Initial Setup

1. **GitHub Secrets** (5 min)
   ```
   Settings → Secrets and variables → Actions
   Add: DOCKER_USERNAME, DOCKER_PASSWORD, AWS_EC2_*, etc.
   ```

2. **Launch EC2** (5 min)
   ```
   AWS Console → EC2 → Launch Instance
   Ubuntu 24.04 LTS, t3.small, 20GB storage
   Security group: Allow ports 22, 80, 443, 3000, 5173+
   ```

3. **Run Setup Script** (10 min)
   ```bash
   ssh -i key.pem ec2-user@ip
   bash scripts/setup-ec2.sh
   nano .env  # Fill in values
   ```

4. **Initial Deploy** (5 min)
   ```bash
   bash scripts/deploy.sh
   ```

5. **Test Services** (5 min)
   ```
   http://your-ec2-ip:3000
   http://your-ec2-ip:5173
   http://your-ec2-ip:5174
   http://your-ec2-ip:5175
   ```

### Total Setup Time: ~30 minutes

---

## Files Created for CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow (auto build & deploy) |
| `docker-compose.prod.yml` | Production Docker Compose (with logging, health checks) |
| `.env.production` | Environment template (secrets) |
| `scripts/setup-ec2.sh` | EC2 initial setup (Docker, Docker Compose, etc.) |
| `scripts/deploy.sh` | Deploy script (run on EC2 to update services) |
| `scripts/backup-db.sh` | Database backup script (run daily via cron) |
| `nginx-prod.conf` | Production Nginx config (reverse proxy, SSL) |
| `CI_CD_GUIDE.md` | Complete setup guide |

---

## Workflow Steps

### 1️⃣ Code Push
```bash
git add .
git commit -m "Feature: new feature"
git push origin production
```

### 2️⃣ GitHub Actions (Automatic)
- ✅ Builds Docker images
- ✅ Pushes to Docker Hub
- ✅ Runs deploy script on EC2

### 3️⃣ EC2 Update (Automatic)
- ✅ Pulls latest code
- ✅ Pulls latest images
- ✅ Restarts containers
- ✅ Services live

### 4️⃣ Monitor Deployment
```bash
# Check GitHub Actions
GitHub → Your Repo → Actions → Latest workflow

# SSH to EC2 and check logs
ssh -i key.pem ec2-user@ip
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Essential Commands

### On Your Local Machine

```bash
# View deployment status
git log --oneline production -5

# Force push if needed (avoid in production)
git push origin production --force-with-lease
```

### On EC2 via SSH

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to app
cd /opt/unisole

# Pull latest and deploy
bash scripts/deploy.sh

# View service status
docker-compose -f docker-compose.prod.yml ps

# View logs (all services)
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Database operations
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d unisole

# Backup database
bash scripts/backup-db.sh

# View backups
ls -lh backups/
```

---

## Troubleshooting

### Deployment failed in GitHub Actions
```
1. GitHub → Actions → Failed workflow
2. Click job to see error logs
3. Fix issue and push again
```

### Services not starting on EC2
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h

# Restart Docker
sudo systemctl restart docker
```

### Database connection failed
```bash
# Connect to database
docker exec -it unisole-engine-db-1 psql -U postgres -d unisole

# Reset database (WARNING: Deletes data!)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Images not updating after push
```bash
# Clear old images
docker system prune -a

# Redeploy
cd /opt/unisole
bash scripts/deploy.sh
```

---

## Monitoring Setup (Optional)

### View logs from local machine
```bash
# Watch EC2 logs in real-time
ssh -i key.pem ec2-user@ip "cd /opt/unisole && docker-compose -f docker-compose.prod.yml logs -f"
```

### Set up daily backups (on EC2)
```bash
crontab -e

# Add line (runs at 2 AM daily):
0 2 * * * bash /opt/unisole/scripts/backup-db.sh

# Verify cron is set
crontab -l
```

---

## Security Checklist

- ✅ GitHub secrets configured
- ✅ SSH key secured (private key never committed)
- ✅ .env file in .gitignore
- ✅ Database password strong (32+ chars random)
- ✅ JWT secrets strong (use `openssl rand -base64 32`)
- ✅ EC2 security group restricts ports
- ✅ SSL/HTTPS configured
- ✅ Regular database backups
- ✅ Monitor logs for errors
- ✅ Update Docker regularly

---

## Cost Breakdown (AWS)

| Service | Cost/Month |
|---------|-----------|
| EC2 t3.small | ~$7 |
| Data transfer | ~$1-5 |
| Storage (20GB) | ~$1 |
| **Total** | **~$10-15** |

---

## Next Steps

1. ✅ Follow CI_CD_GUIDE.md step by step
2. ✅ Set up GitHub secrets
3. ✅ Launch EC2 instance
4. ✅ Run setup-ec2.sh
5. ✅ Verify services running
6. ✅ Set up SSL certificates
7. ✅ Configure domain DNS
8. ✅ Set up monitoring/backups
9. ✅ Update GitHub Actions secrets when needed
10. ✅ Monitor and optimize

---

**You now have a production-ready CI/CD pipeline!** 🚀
