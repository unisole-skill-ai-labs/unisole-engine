#!/bin/bash

# ===== Unisole Database Backup & Deduplication Script =====
# Backs up PostgreSQL database and skips duplicate backups if data hasn't changed.
# Crontab entry: 0 2 * * * bash /opt/unisole/scripts/backup-db.sh >> /var/log/unisole-backup.log 2>&1

set -e

# Determine directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Load environment configuration if available (handling CRLF safely)
if [ -f .env.production ]; then
  # shellcheck disable=SC1090
  eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.production | tr -d '\r')" 2>/dev/null || true
elif [ -f .env.staging ]; then
  # shellcheck disable=SC1090
  eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.staging | tr -d '\r')" 2>/dev/null || true
elif [ -f .env ]; then
  # shellcheck disable=SC1090
  eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env | tr -d '\r')" 2>/dev/null || true
fi

# Detect docker compose file and database service
COMPOSE_FILE=""
DB_SERVICE=""

# 1. Check running docker containers first
if command -v docker >/dev/null 2>&1; then
  RUNNING_CONTAINERS=$(docker ps --format '{{.Names}}' 2>/dev/null || true)
  if echo "$RUNNING_CONTAINERS" | grep -q "db-staging"; then
    COMPOSE_FILE="docker-compose.staging.yml"
    DB_SERVICE="db-staging"
    DB_NAME="${DB_NAME:-unisole_staging}"
  elif echo "$RUNNING_CONTAINERS" | grep -E "(_db_1|-db-1|^db$)"; then
    COMPOSE_FILE="docker-compose.prod.yml"
    DB_SERVICE="db"
    DB_NAME="${DB_NAME:-unisole}"
  fi
fi

# 2. Check current directory name or environment
if [ -z "$COMPOSE_FILE" ]; then
  if [[ "$PWD" == *"staging"* ]] && [ -f "docker-compose.staging.yml" ]; then
    COMPOSE_FILE="docker-compose.staging.yml"
    DB_SERVICE="db-staging"
    DB_NAME="${DB_NAME:-unisole_staging}"
  elif [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    DB_SERVICE="db"
    DB_NAME="${DB_NAME:-unisole}"
  elif [ -f "docker-compose.staging.yml" ]; then
    COMPOSE_FILE="docker-compose.staging.yml"
    DB_SERVICE="db-staging"
    DB_NAME="${DB_NAME:-unisole_staging}"
  else
    COMPOSE_FILE="docker-compose.yml"
    DB_SERVICE="db"
    DB_NAME="${DB_NAME:-unisole}"
  fi
fi

# Fallback defaults if not set
DB_SERVICE="${DB_SERVICE:-db}"
DB_NAME="${DB_NAME:-unisole}"

# Configuration & Defaults
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/unisole_backup_$DATE.sql.gz"
HASH_FILE="$BACKUP_DIR/latest.sha256"
TEMP_DUMP="/tmp/unisole_dump_$$.sql"

mkdir -p "$BACKUP_DIR"

# Ensure cleanup of temp files on exit
trap 'rm -f "$TEMP_DUMP"' EXIT INT TERM

echo "📦 [$(date +"%Y-%m-%d %H:%M:%S")] Starting database backup process ($DB_NAME via $DB_SERVICE)..."

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

  ENV_FILE_FLAG=""
  if [ -f ".env" ]; then
    ENV_FILE_FLAG="--env-file .env"
  elif [ -f ".env.staging" ]; then
    ENV_FILE_FLAG="--env-file .env.staging"
  fi

  # Dump database excluding header comments so identical data produces identical byte stream
  $DOCKER_COMPOSE_CMD $ENV_FILE_FLAG -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" pg_dump \
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
cd "$PROJECT_ROOT"

# Detect node executable (supports Linux node and Windows node.exe)
NODE_CMD="node"
if ! command -v node >/dev/null 2>&1; then
  if command -v node.exe >/dev/null 2>&1; then
    NODE_CMD="node.exe"
  fi
fi

# Off-site Cloud Backup: Cloudflare R2 (10 GB Free Forever, zero egress fees)
if [ -f "$PROJECT_ROOT/config/r2-credentials.json" ] || [ -f "/opt/unisole/config/r2-credentials.json" ] || [ -n "$CLOUDFLARE_R2_TOKEN" ]; then
  if command -v "$NODE_CMD" >/dev/null 2>&1 && [ -f "scripts/upload-r2.js" ]; then
    echo "☁️ Triggering Cloudflare R2 off-site upload..."
    $NODE_CMD "scripts/upload-r2.js" "$BACKUP_FILE" || echo "⚠️ Warning: Cloudflare R2 upload failed, local backup is still safe."
  fi
fi

# Optional: Upload to Firebase Cloud Storage
if [ -f "$PROJECT_ROOT/config/firebase-service-account.json" ] || [ -f "/opt/unisole/config/firebase-service-account.json" ] || [ -n "$FIREBASE_SERVICE_ACCOUNT_KEY" ]; then
  if command -v "$NODE_CMD" >/dev/null 2>&1 && [ -f "scripts/upload-firebase.js" ]; then
    echo "☁️ Triggering Firebase Cloud Storage off-site upload..."
    $NODE_CMD "scripts/upload-firebase.js" "$BACKUP_FILE" || echo "⚠️ Warning: Firebase upload failed, local backup is still safe."
  fi
fi

# Optional: Upload to AWS S3 if bucket is configured and aws CLI exists
S3_BUCKET="${S3_BACKUP_BUCKET:-$AWS_BACKUP_S3_BUCKET}"
if [ -n "$S3_BUCKET" ] && command -v aws >/dev/null 2>&1; then
  echo "☁️ Uploading $BACKUP_FILE to s3://$S3_BUCKET/backups/..."
  aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/$(basename "$BACKUP_FILE")"
  echo "✅ S3 upload completed."
fi

echo "🎉 Backup workflow finished successfully."
