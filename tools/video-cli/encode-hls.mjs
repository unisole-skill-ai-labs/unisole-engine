#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const inputArg = process.argv[2];
const outputArg = process.argv[3];

if (!inputArg || inputArg === "--help" || inputArg === "-h") {
  console.log("Usage: node tools/video-cli/encode-hls.mjs <input-video.mp4> [output-dir]");
  process.exit(inputArg ? 0 : 1);
}

const inputPath = path.resolve(inputArg);
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg";
const probe = spawnSync(ffmpegBin, ["-version"], { stdio: "ignore" });
if (probe.status !== 0) {
  console.error("ffmpeg is not installed or not on PATH. Install ffmpeg (or set FFMPEG_PATH) and try again.");
  process.exit(1);
}

const baseName = path.basename(inputPath, path.extname(inputPath));
const outDir = path.resolve(outputArg || path.join(path.dirname(inputPath), `${baseName}-hls`));
fs.mkdirSync(outDir, { recursive: true });

let useHardware = false;
if (process.env.FORCE_SW_ENCODE !== "1") {
  try {
    const encoders = execFileSync(ffmpegBin, ["-hide_banner", "-encoders"], { encoding: "utf8" });
    useHardware = encoders.includes("h264_videotoolbox");
  } catch {
    useHardware = false;
  }
}

const codec = useHardware ? "h264_videotoolbox" : "libx264";
const extraCodecArgs = useHardware
  ? ["-allow_sw", "1"]
  : ["-preset", "veryfast", "-x264-params", "scenecut=0:open_gop=0"];

const TARGET_FPS = 30;
const GOP_FRAMES = TARGET_FPS * 6;

const args = [
  "-y",
  "-i",
  inputPath,
  "-filter_complex",
  `[0:v]fps=${TARGET_FPS},format=yuv420p,split=3[v1][v2][v3];[v1]scale=-2:360[v360];[v2]scale=-2:480[v480];[v3]scale=-2:720[v720]`,
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
  "-level:v",
  "4.0",
  "-pix_fmt",
  "yuv420p",
  ...extraCodecArgs,
  "-g",
  String(GOP_FRAMES),
  "-keyint_min",
  String(GOP_FRAMES),
  "-sc_threshold",
  "0",
  "-force_key_frames",
  "expr:gte(t,n_forced*6)",
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
  "-ar",
  "48000",
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
  path.join(outDir, "%v", "seg_%05d.ts").replace(/\\/g, "/"),
  path.join(outDir, "%v", "index.m3u8").replace(/\\/g, "/"),
];

console.log(`Encoding "${inputPath}" -> "${outDir}" (CFR ${TARGET_FPS}fps, 6s forced keyframes, H.264+AAC)...`);
execFileSync(ffmpegBin, args, { stdio: "inherit" });
console.log(`Done! Upload the folder "${outDir}" in the Unisole Admin editor.`);
