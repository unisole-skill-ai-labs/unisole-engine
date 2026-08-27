#!/bin/bash

# ===== Database Backup Script =====
# Backs up PostgreSQL database daily
# Add to crontab: 0 2 * * * /opt/unisole/scripts/backup-db.sh

cd /opt/unisole

BACKUP_DIR="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/unisole_backup_$DATE.sql.gz"

echo "📦 Starting database backup at $DATE..."

# Get database credentials from .env
source .env

# Create backup
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_FILE"

echo "✅ Backup completed: $BACKUP_FILE"

# Keep only last 7 backups
echo "🧹 Cleaning old backups..."
cd $BACKUP_DIR
ls -t unisole_backup_*.sql.gz | tail -n +8 | xargs rm -f 2>/dev/null || true

echo "✅ Backup rotation completed. Current backups:"
ls -lh unisole_backup_*.sql.gz | tail -5

# Optional: Upload to S3
# aws s3 cp "$BACKUP_FILE" s3://your-bucket/backups/
