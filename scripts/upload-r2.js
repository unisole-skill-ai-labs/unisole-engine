#!/usr/bin/env node

/**
 * ===== Cloudflare R2 Backup Uploader =====
 * Streams PostgreSQL backup archives (.sql.gz) to Cloudflare R2 Object Storage.
 * Uses native Node.js HTTPS (zero external npm dependencies required).
 * Usage: node scripts/upload-r2.js <path-to-backup-file>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Error: Missing backup file path.');
  console.error('Usage: node scripts/upload-r2.js <path-to-backup-file>');
  process.exit(1);
}

const resolvedFilePath = path.resolve(filePath);
if (!fs.existsSync(resolvedFilePath)) {
  console.error(`❌ Error: Backup file not found at ${resolvedFilePath}`);
  process.exit(1);
}

// Locate R2 credentials
let config = {};
const possibleConfigPaths = [
  process.env.R2_CONFIG_PATH,
  path.join(__dirname, '../config/r2-credentials.json'),
  '/opt/unisole/config/r2-credentials.json',
  path.join(__dirname, '../r2-credentials.json'),
  '/opt/unisole/r2-credentials.json'
].filter(Boolean);

for (const p of possibleConfigPaths) {
  if (fs.existsSync(p)) {
    try {
      config = JSON.parse(fs.readFileSync(p, 'utf8'));
      break;
    } catch (e) {
      // ignore
    }
  }
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || config.account_id || '8da6e38c4bc16ee68d7c0b8784af627e';
const bucketName = process.env.CLOUDFLARE_R2_BUCKET || config.bucket_name || 'unisole-db-backups';
const apiToken = process.env.CLOUDFLARE_R2_TOKEN || process.env.CLOUDFLARE_API_TOKEN || config.api_token;

if (!apiToken) {
  console.error('❌ Error: Cloudflare R2 API token not found.');
  console.error('Please configure CLOUDFLARE_R2_TOKEN or config/r2-credentials.json');
  process.exit(1);
}

const fileName = path.basename(resolvedFilePath);
const objectKey = `backups/${fileName}`;
const stats = fs.statSync(resolvedFilePath);
const fileSizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`📦 Preparing Cloudflare R2 upload: ${fileName} (${fileSizeMb} MB)`);
console.log(`☁️ Destination bucket: ${bucketName} -> ${objectKey}`);

const options = {
  hostname: 'api.cloudflare.com',
  path: `/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`,
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/gzip',
    'Content-Length': stats.size,
  },
};

const startTime = Date.now();
const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ [Cloudflare R2] Upload completed in ${duration}s!`);
      console.log(`📁 File stored: ${objectKey} (${fileSizeMb} MB)`);
      console.log(`🔗 Dashboard: https://dash.cloudflare.com/${accountId}/r2/default/buckets/${bucketName}`);
      process.exit(0);
    } else {
      console.error(`❌ Cloudflare R2 upload failed with HTTP ${res.statusCode}:`);
      console.error(responseData);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Network error during Cloudflare R2 upload:', err.message);
  process.exit(1);
});

// Stream the file directly
const readStream = fs.createReadStream(resolvedFilePath);
readStream.pipe(req);
