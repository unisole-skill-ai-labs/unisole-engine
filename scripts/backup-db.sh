#!/bin/bash

# ===== Unisole Database Backup & Deduplication Script =====
# Backs up PostgreSQL database and skips duplicate backups if data hasn't changed.
# Crontab entry: 0 2 * * * bash /opt/unisole/scripts/backup-db.sh >> /var/log/unisole-backup.log 2>&1

set -e

# Determine directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -d "/opt/unisole" ]; then
  cd /opt/unisole
else
  cd "$PROJECT_ROOT"
fi

# Load environment configuration if available (handling CRLF safely)
if [ -f .env.production ]; then
  # shellcheck disable=SC1090
  eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.production | tr -d '\r')" 2>/dev/null || true
elif [ -f .env ]; then
  # shellcheck disable=SC1090
  eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env | tr -d '\r')" 2>/dev/null || true
fi

# Configuration & Defaults
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-unisole}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/unisole_backup_$DATE.sql.gz"
HASH_FILE="$BACKUP_DIR/latest.sha256"
TEMP_DUMP="/tmp/unisole_dump_$$.sql"

mkdir -p "$BACKUP_DIR"

# Ensure cleanup of temp files on exit
trap 'rm -f "$TEMP_DUMP"' EXIT INT TERM

echo "📦 [$(date +"%Y-%m-%d %H:%M:%S")] Starting database backup process..."

# Support automated test / mock mode for verification
if [ -n "$MOCK_DUMP_DATA" ]; then
  echo "$MOCK_DUMP_DATA" > "$TEMP_DUMP"
else
  # Detect docker compose command
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
  else
    DOCKER_COMPOSE_CMD="docker-compose"
  fi

  # Detect docker compose file
  COMPOSE_FILE="docker-compose.prod.yml"
  if [ ! -f "$COMPOSE_FILE" ]; then
    if [ -f "docker-compose.staging.yml" ]; then
      COMPOSE_FILE="docker-compose.staging.yml"
    elif [ -f "docker-compose.yml" ]; then
      COMPOSE_FILE="docker-compose.yml"
    fi
  fi

  # Dump database excluding header comments so identical data produces identical byte stream
  $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" exec -T db pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-comments > "$TEMP_DUMP"
fi

# Check if dump is non-empty
if [ ! -s "$TEMP_DUMP" ]; then
  echo "❌ Error: pg_dump produced an empty file. Backup aborted."
  exit 1
fi

# Compute SHA256 checksum of the current database dump
CURRENT_HASH=$(sha256sum "$TEMP_DUMP" | awk '{print $1}')
LAST_HASH=""
if [ -f "$HASH_FILE" ]; then
  LAST_HASH=$(cat "$HASH_FILE" | tr -d '[:space:]')
fi

echo "🔍 Current database checksum: ${CURRENT_HASH:0:12}..."
if [ -n "$LAST_HASH" ]; then
  echo "🔍 Previous backup checksum:  ${LAST_HASH:0:12}..."
fi

# Deduplication check: compare checksums
if [ -n "$LAST_HASH" ] && [ "$CURRENT_HASH" = "$LAST_HASH" ]; then
  echo "⏭️  [DEDUPLICATION] No database changes detected since last backup. Skipping backup creation & upload."
  exit 0
fi

# New or modified data detected -> Create compressed backup
echo "🔄 Changes detected. Creating compressed backup archive..."
gzip -c "$TEMP_DUMP" > "$BACKUP_FILE"
echo "$CURRENT_HASH" > "$HASH_FILE"

FILE_SIZE=$(du -h "$BACKUP_FILE" 2>/dev/null | cut -f1 || ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "✅ Backup created successfully: $BACKUP_FILE ($FILE_SIZE)"

# Retain last 7 backups, purge older ones
echo "🧹 Cleaning old backups (retaining last 7 snapshots)..."
cd "$BACKUP_DIR"
# shellcheck disable=SC2012
ls -t unisole_backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null || true

echo "📋 Recent backups:"
# shellcheck disable=SC2012
ls -lh unisole_backup_*.sql.gz 2>/dev/null | tail -5

# Optional: Upload to AWS S3 if bucket is configured and aws CLI exists
S3_BUCKET="${S3_BACKUP_BUCKET:-$AWS_BACKUP_S3_BUCKET}"
if [ -n "$S3_BUCKET" ] && command -v aws >/dev/null 2>&1; then
  echo "☁️ Uploading $BACKUP_FILE to s3://$S3_BUCKET/backups/..."
  aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/$(basename "$BACKUP_FILE")"
  echo "✅ S3 upload completed."
fi

echo "🎉 Backup workflow finished successfully."
