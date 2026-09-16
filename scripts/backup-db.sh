#!/usr/bin/env bash
set -eo pipefail

# ===== Automated Conditional Database Backup Script =====
# Industry Standard: Daily at 22:00 UTC (03:30 AM IST)
# Crontab: 0 22 * * * /opt/unisole/scripts/backup-db.sh >> /var/log/unisole_backup.log 2>&1

cd /opt/unisole

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
TEMP_DUMP="/tmp/unisole_dump_temp.sql"
HASH_FILE="$BACKUP_DIR/latest_db.sha256"

echo "=========================================="
echo "📦 [$(date)] Starting Database Backup Check..."

# 1. Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "❌ .env file not found in $(pwd)"
  exit 1
fi

DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-unisole}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

# 2. Extract clean snapshot to temporary location
echo "🔍 Extracting database snapshot..."
docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "$DB_USER" -d "$DB_NAME" > "$TEMP_DUMP"

# 3. Calculate SHA-256 Checksum
NEW_HASH=$(sha256sum "$TEMP_DUMP" | awk '{print $1}')
OLD_HASH=""
if [ -f "$HASH_FILE" ]; then
  OLD_HASH=$(cat "$HASH_FILE")
fi

echo "🔑 Current Dump Hash: $NEW_HASH"
echo "🔑 Previous Dump Hash: ${OLD_HASH:-None (First run)}"

# 4. Check for changes (Deduplication)
if [ "$NEW_HASH" = "$OLD_HASH" ]; then
  echo "⏩ [$(date)] SKIPPED: Database identical to previous backup. Zero changes detected."
  echo "💡 No duplicate file created. 0 bytes wasted."
  rm -f "$TEMP_DUMP"
  exit 0
fi

# 5. New data detected -> Compress and store
BACKUP_FILE="$BACKUP_DIR/unisole_backup_$DATE.sql.gz"
echo "💾 New changes detected! Compressing and storing..."
gzip -c "$TEMP_DUMP" > "$BACKUP_FILE"
rm -f "$TEMP_DUMP"

# Record the new fingerprint
echo "$NEW_HASH" > "$HASH_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Backup successfully created: $BACKUP_FILE ($FILE_SIZE)"

# 6. Local Rotation: Keep only the rolling last 7 backups
echo "🧹 Pruning backups older than 7 versions..."
cd "$BACKUP_DIR"
ls -t unisole_backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null || true

echo "📋 Current saved backups on server:"
ls -lh unisole_backup_*.sql.gz 2>/dev/null | tail -5
echo "=========================================="
