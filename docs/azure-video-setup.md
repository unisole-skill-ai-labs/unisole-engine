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

## 8. Cost & Key Rotation Notes

- **Cost estimate (Central India, Standard LRS)**: Storage is roughly \$0.018–\$0.021 per GB/month; outbound bandwidth is billed per GB transferred. A 100 GB course library costs ~\$2/month for storage.
- **Zero-downtime Key Rotation**:
  1. In Azure Portal -> **Access keys**, note **key2**.
  2. Update `AZURE_STORAGE_ACCOUNT_KEY` on `unisole-engine` to **key2** and restart/redeploy the backend.
  3. Wait for any active 20-minute upload SAS tokens and 6-hour playback SAS tokens to expire.
  4. Click **Rotate key** on **key1** in the Azure Portal.
