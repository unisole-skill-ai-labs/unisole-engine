#!/usr/bin/env bash
set -euo pipefail

# Pre-deploy environment check (prints SET/UNSET only; never prints secret values).
# Usage: bash scripts/predeploy-env-check.sh [staging|production] [env-file]

TARGET_ENV="${1:-staging}"
ENV_FILE="${2:-.env}"

if [[ "$TARGET_ENV" != "staging" && "$TARGET_ENV" != "production" ]]; then
  echo "Usage: $0 [staging|production] [env-file]" >&2
  exit 2
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: Env file '$ENV_FILE' not found." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

REQUIRED_VARS=(
  "JWT_SECRET"
  "JWT_REFRESH_SECRET"
  "GOOGLE_OAUTH_CLIENT_ID"
  "GOOGLE_OAUTH_CLIENT_SECRET"
  "GOOGLE_OAUTH_REFRESH_TOKEN"
  "GDRIVE_ROOT_FOLDER_ID"
)

if [[ "$TARGET_ENV" == "production" ]]; then
  REQUIRED_VARS+=("DB_PASSWORD")
fi

VIDEO_MODE="${VIDEO_STORAGE_MODE:-stub}"
if [[ "$VIDEO_MODE" == "azure" ]]; then
  REQUIRED_VARS+=(
    "AZURE_STORAGE_ACCOUNT"
    "AZURE_STORAGE_ACCOUNT_KEY"
    "AZURE_HLS_CONTAINER"
  )
fi

echo "=== Pre-deploy env check ($TARGET_ENV, file: $ENV_FILE) ==="
MISSING=0
for var_name in "${REQUIRED_VARS[@]}"; do
  val="${!var_name:-}"
  if [[ -n "$val" ]]; then
    echo "  $var_name: SET"
  else
    echo "  $var_name: UNSET"
    MISSING=1
  fi
done

echo "  VIDEO_STORAGE_MODE: ${VIDEO_MODE}"

if [[ "$MISSING" -ne 0 ]]; then
  echo "FAIL: One or more required environment variables are UNSET." >&2
  exit 1
fi

echo "PASS: All required environment variables for $TARGET_ENV are SET."
