#!/bin/bash
set -e

TEST_DIR=$(mktemp -d /tmp/test_unisole_backup.XXXXXX)
trap 'rm -rf "$TEST_DIR"' EXIT

echo "Testing backup deduplication in $TEST_DIR..."
export BACKUP_DIR="$TEST_DIR/backups"

echo "=== Test 1: First Run with Data A ==="
export MOCK_DUMP_DATA="CREATE TABLE test_table (id INT, name TEXT); INSERT INTO test_table VALUES (1, 'alpha');"
bash scripts/backup-db.sh

if [ ! -f "$BACKUP_DIR/latest.sha256" ]; then
  echo "FAIL: latest.sha256 was not created"
  exit 1
fi
COUNT1=$(find "$BACKUP_DIR" -name "unisole_backup_*.sql.gz" | wc -l)
if [ "$COUNT1" -ne 1 ]; then
  echo "FAIL: Expected 1 backup file, got $COUNT1"
  exit 1
fi
echo "✅ PASS Test 1: Backup created successfully."

echo ""
echo "=== Test 2: Second Run with IDENTICAL Data A (Should Skip) ==="
bash scripts/backup-db.sh

COUNT2=$(find "$BACKUP_DIR" -name "unisole_backup_*.sql.gz" | wc -l)
if [ "$COUNT2" -ne 1 ]; then
  echo "FAIL: Duplicate backup was created! Expected 1, got $COUNT2"
  exit 1
fi
echo "✅ PASS Test 2: Deduplication correctly prevented duplicate backup!"

echo ""
echo "=== Test 3: Third Run with CHANGED Data B (Should Create New Backup) ==="
sleep 1
export MOCK_DUMP_DATA="CREATE TABLE test_table (id INT, name TEXT); INSERT INTO test_table VALUES (1, 'alpha'), (2, 'beta');"
bash scripts/backup-db.sh

COUNT3=$(find "$BACKUP_DIR" -name "unisole_backup_*.sql.gz" | wc -l)
if [ "$COUNT3" -ne 2 ]; then
  echo "FAIL: New backup was not created on data change! Expected 2, got $COUNT3"
  exit 1
fi
echo "✅ PASS Test 3: Data change correctly detected and new backup archive created."

echo ""
echo "=== Test 4: Rotation Test (Create 8 backups, verify only 7 kept) ==="
for i in 3 4 5 6 7 8 9; do
  sleep 1
  export MOCK_DUMP_DATA="DATA_$i"
  bash scripts/backup-db.sh >/dev/null 2>&1
done

TOTAL_KEPT=$(find "$BACKUP_DIR" -name "unisole_backup_*.sql.gz" | wc -l)
if [ "$TOTAL_KEPT" -ne 7 ]; then
  echo "FAIL: Expected 7 backups retained, found $TOTAL_KEPT"
  exit 1
fi
echo "✅ PASS Test 4: Rotation correctly kept exactly 7 latest backups!"

echo ""
echo "🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY!"
