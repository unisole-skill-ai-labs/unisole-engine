# Google Drive OAuth2 Storage Setup (Personal Gmail)

Unisole LMS stores assignment attachments and student submissions in a personal Google Drive using OAuth2 with a long-lived refresh token (`drive.file` scope only — no service account required).

Because `drive.file` only grants access to files and folders created by the app itself, the `gdrive:auth` script automatically creates (or reuses) the `Unisole-LMS` root folder via the Drive API and outputs its ID.

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Enable **Google Drive API** (`APIs & Services` → `Library` → search `Google Drive API` → `Enable`).
3. Configure **OAuth consent screen** (`APIs & Services` → `OAuth consent screen`):
   - Choose **External**.
   - Fill in App name, User support email, and Developer contact email.
   - Add scope: `https://www.googleapis.com/auth/drive.file`.
   - **Important:** Publish the app to **"In production"** (on the OAuth consent screen, click **Publish App**). Otherwise, Google expires refresh tokens after **7 days**.
4. Create **OAuth client ID** (`APIs & Services` → `Credentials` → `Create Credentials` → `OAuth client ID`):
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3333/oauth2callback`
   - Copy the **Client ID** and **Client Secret**.

## 2. Obtain Refresh Token & Create Root Folder (One-Time)

Add `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` to `unisole-engine/.env.local`, then run:

```bash
cd unisole-engine
npm run gdrive:auth
```

Open the printed URL, authorize the `drive.file` permission, and copy both `GOOGLE_OAUTH_REFRESH_TOKEN` and `GDRIVE_ROOT_FOLDER_ID` (the `Unisole-LMS` folder created by the app) into your environment.

## 3. Required Environment Variables

```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REFRESH_TOKEN=your-refresh-token
GDRIVE_ROOT_FOLDER_ID=your-app-created-unisole-lms-folder-id
```

## 4. Proxy / CDN Upload Limits

- Submission limits are capped at **50 MB per video**, **10 MB per document/code file**, **max 5 files**, and **100 MB total per submission** (with `multipart/form-data` overhead well within limits, or up to 100 MB).
- Because total submission payloads stay within **100 MB**, this fits under **Cloudflare's 100 MB** upload body limit and **nginx's existing `client_max_body_size 100M;`**, so **no proxy or Cloudflare config changes are required**.
