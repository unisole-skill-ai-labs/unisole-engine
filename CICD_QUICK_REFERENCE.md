# CI/CD Quick Reference: EC2 (Backend) + Vercel (Frontends)

## 🔄 Architecture & Flow

```
┌────────────────────────────────────────────────────────┐
│                   VERCEL (Frontends)                   │
│  unisole-app | unisole-admin | unisole-seo-website     │
│  Trigger: git push origin main                         │
│  Deploy: Automated Edge CDN Deployment via Vercel      │
└─────────────────────────┬──────────────────────────────┘
                          │ API Calls: VITE_API_BASE_URL
                          ▼
┌────────────────────────────────────────────────────────┐
│                 AWS EC2 (Backend Stack)                │
│  Trigger: git push origin production in unisole-engine │
│  Deploy: GitHub Actions (.github/workflows/deploy.yml) │
│                                                        │
│  Containers:                                           │
│   • nginx:1.27-alpine    (Reverse proxy: 80/443)       │
│   • unisole-engine:latest (Express REST API: 3000)     │
│   • postgres:16-alpine    (Database: 5433:5432)        │
└────────────────────────────────────────────────────────┘
```

---

## 🔑 GitHub Secrets Checklist (`unisole-engine`)

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `DOCKER_USERNAME` | `divyank380` | Docker Hub username |
| `DOCKER_PASSWORD` | Access Token | Docker Hub PAT with read/write access |
| `AWS_EC2_HOST` | Public IPv4 / Elastic IP | Public address of your EC2 instance |
| `AWS_EC2_USER` | `ubuntu` | SSH user |
| `AWS_EC2_KEY` | Private SSH Key (`~/.ssh/ec2-unisole-key`) | Key for GitHub Actions runner to SSH into EC2 |

---

## 🚀 Deployment Commands Quick Reference

### Deploying Backend on EC2:
```bash
# On your local machine:
git add .
git commit -m "feat: backend update"
git push origin production
# GitHub Actions will automatically build, push image, and deploy to EC2!
```

### Manual Deploy on EC2 (SSH):
```bash
ssh -i key.pem ubuntu@YOUR_EC2_IP
cd /opt/unisole
git pull origin main
bash scripts/deploy.sh
```

### Deploying Frontends on Vercel:
```bash
# In unisole-app / unisole-admin / unisole-seo-website:
git add .
git commit -m "feat: frontend update"
git push origin main
# Vercel deploys immediately!
```

---

## 🛠️ Essential EC2 Maintenance Commands

```bash
# View running containers
docker compose -f docker-compose.prod.yml ps

# View backend logs in real-time
docker compose -f docker-compose.prod.yml logs -f api

# View database logs
docker compose -f docker-compose.prod.yml logs -f db

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Full clean restart with fresh database volume (CAUTION: wipes DB)
docker compose -f docker-compose.prod.yml down -v
bash scripts/deploy.sh

# Run database manual backup
bash scripts/backup-db.sh
```
