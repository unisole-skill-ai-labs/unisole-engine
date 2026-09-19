#!/usr/bin/env node

/**
 * ===== Firebase / Google Cloud Storage Uploader for Unisole Backups =====
 * Uploads compressed database backups to Firebase Storage.
 * Usage: node scripts/upload-firebase.js <path-to-backup-file>
 */

const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Error: Missing backup file path.');
  console.error('Usage: node scripts/upload-firebase.js <path-to-backup-file>');
  process.exit(1);
}

const resolvedFilePath = path.resolve(filePath);
if (!fs.existsSync(resolvedFilePath)) {
  console.error(`❌ Error: File not found at ${resolvedFilePath}`);
  process.exit(1);
}

// Locate service account credentials
const possibleKeyPaths = [
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  path.join(__dirname, '../config/firebase-service-account.json'),
  '/opt/unisole/config/firebase-service-account.json',
  path.join(__dirname, '../firebase-service-account.json'),
  '/opt/unisole/firebase-service-account.json',
].filter(Boolean);

let keyPath = possibleKeyPaths.find((p) => fs.existsSync(p));

if (!keyPath) {
  console.error('❌ Error: Firebase service account JSON key not found.');
  console.error('Looked in:');
  possibleKeyPaths.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

async function uploadBackup() {
  const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const projectId = keyData.project_id || 'unisole-db-backups';

  const storage = new Storage({ keyFilename: keyPath });

  // Determine bucket name
  let bucketName = process.env.FIREBASE_STORAGE_BUCKET;

  if (!bucketName) {
    try {
      const [buckets] = await storage.getBuckets();
      if (buckets.length > 0) {
        bucketName = buckets[0].name;
      }
    } catch (e) {
      // Fallback to default naming conventions
    }
  }

  if (!bucketName) {
    bucketName = `${projectId}.firebasestorage.app`;
  }

  const fileName = path.basename(resolvedFilePath);
  const destination = `backups/${fileName}`;
  const fileSizeMb = (fs.statSync(resolvedFilePath).size / (1024 * 1024)).toFixed(2);

  console.log(`📦 Preparing upload: ${fileName} (${fileSizeMb} MB)`);
  console.log(`☁️ Destination: gs://${bucketName}/${destination}`);

  const bucket = storage.bucket(bucketName);

  await bucket.upload(resolvedFilePath, {
    destination,
    metadata: {
      contentType: 'application/gzip',
      metadata: {
        uploadedAt: new Date().toISOString(),
        project: 'unisole',
      },
    },
  });

  console.log(`✅ [Firebase Storage] Backup uploaded successfully to gs://${bucketName}/${destination}`);
  console.log(`🔗 Console view: https://console.firebase.google.com/project/${projectId}/storage/${bucketName}/files`);
}

uploadBackup().catch((err) => {
  console.error('❌ Firebase upload failed:', err.message);
  process.exit(1);
});
