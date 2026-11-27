# Azure Video Storage & Direct Upload Setup Guide

This guide explains how to configure Azure Blob Storage for Unisole LMS video hosting (both **Simple MP4 direct upload** and **HLS adaptive streaming**), in plain language.

---

## 1. Create the Azure Storage Account (Azure Portal)

1. Sign in to the [Azure Portal](https://portal.azure.com).
2. Search for **Storage accounts** and click **+ Create**.
3. Fill in the **Basics** tab:
   - **Resource group**: Choose your production resource group (or create one, e.g. `unisole-prod-rg`).
   - **Storage account name**: A globally unique lowercase name (e.g. `unisolemediaprod`).
   - **Region**: **Central India** (lowest latency for learners in India).
   - **Performance**: **Standard**.
   - **Redundancy**: **Locally-redundant storage (LRS)**.
4. Leave the remaining defaults (ensure **Allow enabling anonymous access on individual containers** is **unchecked / disabled**), then click **Review + create** -> **Create**.

---

## 2. Create the Private Blob Container

1. Open your newly created Storage Account.
2. In the left menu, go to **Data storage -> Containers**.
3. Click **+ Container**:
   - **Name**: `hls` (matches `AZURE_HLS_CONTAINER=hls`).
   - **Anonymous access level**: **Private (no anonymous access)**.
4. Click **Create**.

---

## 3. Configure CORS on the Blob Service

Browsers upload MP4 files directly to Azure (`PUT`) and stream video (`GET`/`HEAD`/`OPTIONS`) using short-lived SAS URLs. You must allow the LMS origin in Azure Blob CORS:

1. In your Storage Account left menu, go to **Settings -> Resource sharing (CORS)**.
2. Select the **Blob service** tab and add a rule with these exact values:
   - **Allowed origins**: `https://lms.unisole.org` (add comma-separated staging URL if applicable, e.g. `https://lms.unisole.org,https://staging-lms.unisole.org`)
   - **Allowed methods**: `GET`, `PUT`, `HEAD`, `OPTIONS`
   - **Allowed headers**: `*`
   - **Exposed headers**: `*`
   - **Max age**: `3600`
3. Click **Save**.

---

## 4. Copy Your Storage Account Key

1. In your Storage Account left menu, go to **Security + networking -> Access keys**.
2. Copy:
   - **Storage account name** (e.g. `unisolemediaprod`)
   - **key1 -> Key** (keep this secret; never commit it to git).

---

## 5. Backend Environment Variables (`unisole-engine`)

Set these environment variables on your production/staging backend server:

```env
VIDEO_STORAGE_MODE=azure
VIDEO_UPLOAD_MODE=simple
VIDEO_MAX_SIZE_MB=500
VIDEO_PLAY_TTL_SECONDS=21600
AZURE_STORAGE_ACCOUNT=unisolemediaprod
AZURE_STORAGE_ACCOUNT_KEY=<your-key1-value>
AZURE_HLS_CONTAINER=hls
```

- `VIDEO_UPLOAD_MODE`:
  - `hls` (default): only CLI HLS upload is enabled; Simple MP4 upload is dormant.
  - `simple`: only browser direct MP4 upload is enabled.
  - `both`: both Simple MP4 upload and CLI HLS upload are available in the admin editor.
- In `NODE_ENV=production`, if `VIDEO_STORAGE_MODE` is not `azure` or any Azure variable is missing, all video endpoints safely return `503 Service Unavailable`.

---

## 6. Frontend Environment Variables (`unisole-lms` on Vercel)

In your Vercel project settings (**Settings -> Environment Variables**), add:

```env
VITE_ENABLE_VIDEO_UPLOAD=true
```

Trigger a redeploy on Vercel so Vite bakes the flag into the production build. When `VITE_ENABLE_VIDEO_UPLOAD` is unset or `false`, the upload panel stays hidden and only YouTube/Vimeo links are shown.

---

## 7. Verify Setup from the Admin Portal

1. Log in to the Admin Portal (`https://lms.unisole.org/admin`).
2. Open any course editor -> select a lesson -> click **Check Video Setup** (or call `POST /api/admin/videos/setup-check`).
3. Confirm:
   - **Storage Mode**: `azure`
   - **Env Vars**: all required variables show `Present`
   - **Connectivity Probe**: writes, reads, and deletes a tiny test blob and reports **OK**
   - **CORS Check**: confirms `GET`, `PUT`, `HEAD` and your LMS origin are configured.

---

## 8. Encoding HLS Video Locally (Optional Adaptive Streaming)

If you want multi-bitrate adaptive HLS streaming (`360p`, `480p`, `720p`), encode your `.mp4` locally using the helper script or `ffmpeg` directly, then upload the generated folder using **Upload encoded HLS folder** in the admin editor:

### Option A: One-command helper script
```bash
node tools/video-cli/encode-hls.mjs path/to/lecture.mp4 path/to/output-hls
```

### Option B: Direct `ffmpeg` command
```bash
ffmpeg -y -i lecture.mp4 \
  -filter_complex "[0:v]fps=30,format=yuv420p,split=3[v1][v2][v3];[v1]scale=-2:360[v360];[v2]scale=-2:480[v480];[v3]scale=-2:720[v720]" \
  -map "[v360]" -map 0:a? -map "[v480]" -map 0:a? -map "[v720]" -map 0:a? \
  -c:v libx264 -profile:v main -level:v 4.0 -pix_fmt yuv420p -preset veryfast \
  -x264-params "scenecut=0:open_gop=0" -g 180 -keyint_min 180 -sc_threshold 0 \
  -force_key_frames "expr:gte(t,n_forced*6)" \
  -b:v:0 600k -b:v:1 1000k -b:v:2 2200k \
  -c:a aac -b:a 128k -ar 48000 -ac 2 \
  -f hls -hls_time 6 -hls_playlist_type vod -hls_flags independent_segments \
  -master_pl_name master.m3u8 \
  -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:480p v:2,a:2,name:720p" \
  -hls_segment_filename "output-hls/%v/seg_%05d.ts" \
  "output-hls/%v/index.m3u8"
```

This creates `master.m3u8` plus `360p/`, `480p/`, and `720p/` subfolders, each containing `index.m3u8` and `seg_000.ts`, `seg_001.ts`, ...

---

## 9. Cost & Key Rotation Notes

- **Cost estimate (Central India, Standard LRS)**: Storage is roughly \$0.018–\$0.021 per GB/month; outbound bandwidth is billed per GB transferred. A 100 GB course library costs ~\$2/month for storage.
- **Zero-downtime Key Rotation**:
  1. In Azure Portal -> **Access keys**, note **key2**.
  2. Update `AZURE_STORAGE_ACCOUNT_KEY` on `unisole-engine` to **key2** and restart/redeploy the backend.
  3. Wait for any active 20-minute upload SAS tokens and 6-hour playback SAS tokens to expire.
  4. Click **Rotate key** on **key1** in the Azure Portal.
