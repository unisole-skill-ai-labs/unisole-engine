#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function parseArgs(argv) {
  const args = argv.slice(2);
  const cmd = args[0];
  let filePath = "";
  let lessonId = "";
  let token = "";
  let api = "https://api.unisole.org";
  let dryRun = false;

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === "--lesson") lessonId = args[++i] || "";
    else if (a === "--token") token = args[++i] || "";
    else if (a === "--api") api = args[++i] || api;
    else if (a === "--dry-run") dryRun = true;
    else if (!a.startsWith("-") && !filePath) filePath = a;
  }

  return { cmd, filePath, lessonId, token, api: api.replace(/\/+$/, ""), dryRun };
}

function usage() {
  console.log(
    `Usage: unisole-video upload <file.mp4|.mov> --lesson <lessonId> --token <cliToken> [--api <url>] [--dry-run]`
  );
}

function checkBinary(name) {
  const res = spawnSync(name, ["-version"], { stdio: "ignore" });
  return res.status === 0;
}

function hasVideoToolbox() {
  try {
    const out = execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" });
    return out.includes("h264_videotoolbox");
  } catch {
    return false;
  }
}

function getDurationMinutes(inputPath) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", inputPath],
    { encoding: "utf8" }
  ).trim();
  const sec = Number(out);
  return Number.isFinite(sec) && sec > 0 ? Math.max(1, Math.round(sec / 60)) : undefined;
}

function buildFfmpegArgs(inputPath, outDir, useHardware) {
  const codec = useHardware ? "h264_videotoolbox" : "libx264";
  const extraCodecArgs = useHardware ? [] : ["-preset", "veryfast"];

  return [
    "-y",
    "-i",
    inputPath,
    "-filter_complex",
    "[0:v]split=3[v1][v2][v3];[v1]scale=-2:360[v360];[v2]scale=-2:480[v480];[v3]scale=-2:720[v720]",
    "-map",
    "[v360]",
    "-map",
    "0:a?",
    "-map",
    "[v480]",
    "-map",
    "0:a?",
    "-map",
    "[v720]",
    "-map",
    "0:a?",
    "-c:v",
    codec,
    "-profile:v",
    "main",
    ...extraCodecArgs,
    "-g",
    "48",
    "-keyint_min",
    "48",
    "-sc_threshold",
    "0",
    "-b:v:0",
    "600k",
    "-b:v:1",
    "1000k",
    "-b:v:2",
    "2200k",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ac",
    "2",
    "-f",
    "hls",
    "-hls_time",
    "6",
    "-hls_playlist_type",
    "vod",
    "-hls_flags",
    "independent_segments",
    "-master_pl_name",
    "master.m3u8",
    "-var_stream_map",
    "v:0,a:0,name:360p v:1,a:1,name:480p v:2,a:2,name:720p",
    "-hls_segment_filename",
    path.join(outDir, "%v", "seg_%03d.ts"),
    path.join(outDir, "%v", "index.m3u8"),
  ];
}

function collectFiles(dir, baseDir = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectFiles(full, baseDir));
    else results.push(path.relative(baseDir, full).replace(/\\/g, "/"));
  }
  return results;
}

async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status} from ${url}`);
  }
  return data;
}

async function uploadFileWithRetry(sasUrl, filePath, contentType, retries = 3) {
  const body = fs.readFileSync(filePath);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(sasUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": contentType,
        },
        body,
      });
      if (!res.ok) throw new Error(`Azure PUT failed: HTTP ${res.status}`);
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

async function uploadPool(tasks, concurrency = 6) {
  let idx = 0;
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (idx < tasks.length) {
      const current = idx++;
      await tasks[current]();
    }
  });
  await Promise.all(workers);
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.cmd !== "upload" || !opts.filePath || !opts.lessonId || !opts.token) {
    usage();
    process.exit(1);
  }

  const ext = path.extname(opts.filePath).toLowerCase();
  if (ext !== ".mp4" && ext !== ".mov") {
    console.error(`Error: Unsupported file extension "${ext}". Only .mp4 and .mov are allowed.`);
    process.exit(1);
  }

  const absInput = path.resolve(opts.filePath);
  const uuid = crypto.randomUUID();
  const hlsPath = `${opts.lessonId}/${uuid}/master.m3u8`;

  if (opts.dryRun) {
    console.log("[DRY RUN] Plan:");
    console.log(`  Input:   ${absInput}`);
    console.log(`  Lesson:  ${opts.lessonId}`);
    console.log(`  API:     ${opts.api}`);
    console.log(`  HLSPath: ${hlsPath}`);
    console.log(`  Variants: 360p (600k), 480p (1000k), 720p (2200k), 6s segments, AAC 128k`);
    console.log(`  Steps:   ffprobe -> ffmpeg -> POST /upload-urls -> PUT blobs -> POST /complete`);
    return;
  }

  if (!fs.existsSync(absInput)) {
    console.error(`Error: Input file not found: ${absInput}`);
    process.exit(1);
  }
  if (!checkBinary("ffmpeg") || !checkBinary("ffprobe")) {
    console.error("Error: ffmpeg and ffprobe must be installed and available on PATH (e.g. brew install ffmpeg).");
    process.exit(1);
  }

  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), `unisole-hls-${opts.lessonId}-`));
  const baseApi = `${opts.api}/api/admin/lessons/${encodeURIComponent(opts.lessonId)}/video`;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${opts.token}`,
  };

  try {
    console.log("1/4 Probing duration...");
    const durationMinutes = getDurationMinutes(absInput);

    console.log("2/4 Encoding adaptive HLS (360p/480p/720p)...");
    const useHw = hasVideoToolbox();
    console.log(`    Encoder: ${useHw ? "h264_videotoolbox" : "libx264"}`);
    const ffArgs = buildFfmpegArgs(absInput, outDir, useHw);
    const ff = spawnSync("ffmpeg", ffArgs, { stdio: "inherit" });
    if (ff.status !== 0) {
      throw new Error(`ffmpeg exited with code ${ff.status}`);
    }

    const files = collectFiles(outDir);
    console.log(`3/4 Requesting upload URLs for ${files.length} HLS files...`);
    const { uploadUrls } = await fetchJson(`${baseApi}/upload-urls`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ uuid, files }),
    });

    console.log("    Uploading HLS files to Azure Blob...");
    let uploaded = 0;
    const tasks = files.map((rel) => async () => {
      const contentType = rel.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp2t";
      await uploadFileWithRetry(uploadUrls[rel], path.join(outDir, rel), contentType);
      uploaded++;
      if (uploaded % 20 === 0 || uploaded === files.length) {
        console.log(`    Uploaded ${uploaded}/${files.length}`);
      }
    });
    await uploadPool(tasks, 6);

    console.log("4/4 Finalizing lesson video...");
    await fetchJson(`${baseApi}/complete`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ hlsPath, durationMinutes }),
    });
    console.log(`✅ Done! Lesson ${opts.lessonId} is READY (${hlsPath}).`);
  } catch (err) {
    console.error("❌ Failed:", err?.message || err);
    try {
      await fetchJson(`${baseApi}/fail`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ error: String(err?.message || err).slice(0, 500) }),
      });
    } catch {
      // ignore fail-report error
    }
    process.exit(1);
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

main();
