#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { validateHlsFolder } from "./validate-hls.mjs";

const RENDITION_LADDER = [
  { name: "360p", height: 360, crf: "24", maxrate: "700k", bufsize: "1400k" },
  { name: "480p", height: 480, crf: "23", maxrate: "1200k", bufsize: "2400k" },
  { name: "720p", height: 720, crf: "22", maxrate: "2500k", bufsize: "5000k" },
];

export function probeSourceMedia(inputPath, ffprobeBin = process.env.FFPROBE_PATH || "ffprobe") {
  const args = [];
  if (inputPath.toLowerCase().endsWith(".m3u8")) {
    args.push("-allowed_extensions", "ALL");
  }
  args.push("-v", "error", "-print_format", "json", "-show_streams", "-show_format", inputPath);
  const out = execFileSync(ffprobeBin, args, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  const parsed = JSON.parse(out || "{}");
  const streams = parsed.streams || [];
  const vStream = streams.find((s) => s.codec_type === "video");
  const aStream = streams.find((s) => s.codec_type === "audio");

  let width = Number(vStream?.width || 1280);
  let height = Number(vStream?.height || 720);
  const rotateTag = Number(vStream?.tags?.rotate || 0);
  const sideRotation = (vStream?.side_data_list || []).find((d) => d.rotation !== undefined)?.rotation;
  const rot = Math.abs(Number(sideRotation ?? rotateTag ?? 0));
  if (rot === 90 || rot === 270) {
    [width, height] = [height, width];
  }

  const durationSec = Number(parsed.format?.duration || 0);
  return {
    width,
    height,
    hasAudio: Boolean(aStream),
    durationMinutes: Number.isFinite(durationSec) && durationSec > 0 ? Math.max(1, Math.round(durationSec / 60)) : undefined,
  };
}

export async function encodeHls({ inputPath, outDir, ffmpegBin = process.env.FFMPEG_PATH || "ffmpeg", ffprobeBin = process.env.FFPROBE_PATH || "ffprobe" }) {
  const absInput = path.resolve(inputPath);
  const absOut = path.resolve(outDir);
  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }
  const probeCheck = spawnSync(ffmpegBin, ["-version"], { stdio: "ignore" });
  if (probeCheck.status !== 0) {
    throw new Error("ffmpeg is not installed or not on PATH. Install ffmpeg and try again.");
  }

  fs.mkdirSync(absOut, { recursive: true });
  const media = probeSourceMedia(absInput, ffprobeBin);

  let renditions = RENDITION_LADDER.filter((r) => r.height <= media.height);
  if (renditions.length === 0) {
    const evenH = Math.max(2, Math.floor(media.height / 2) * 2);
    renditions = [{ name: "360p", height: evenH, crf: "23", maxrate: "700k", bufsize: "1400k" }];
  }

  const targetFps = 30;
  const gopFrames = targetFps * 6;
  const splitLabels = renditions.map((_, i) => `[v${i}]`).join("");
  const scaleFilters = renditions.map((r, i) => `[v${i}]scale=-2:${r.height}[out${i}]`).join(";");
  const audioSplitLabels = renditions.map((_, i) => `[aout${i}]`).join("");
  const audioInputLabel = media.hasAudio ? "[0:a]" : "[1:a]";
  const audioFilter = media.hasAudio
    ? `;${audioInputLabel}aresample=async=1:first_pts=0,asplit=${renditions.length}${audioSplitLabels}`
    : `;${audioInputLabel}asplit=${renditions.length}${audioSplitLabels}`;
  const filterComplex = `[0:v]fps=${targetFps},setpts=PTS-STARTPTS,format=yuv420p,split=${renditions.length}${splitLabels};${scaleFilters}${audioFilter}`;

  const inputArgs = [];
  if (absInput.toLowerCase().endsWith(".m3u8")) {
    inputArgs.push("-allowed_extensions", "ALL");
  }
  inputArgs.push("-i", absInput);
  if (!media.hasAudio) {
    inputArgs.push("-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000");
  }

  const mapArgs = [];
  const rateArgs = [];
  const varMap = [];
  renditions.forEach((r, i) => {
    mapArgs.push("-map", `[out${i}]`, "-map", `[aout${i}]`);
    rateArgs.push(`-crf:v:${i}`, r.crf, `-maxrate:v:${i}`, r.maxrate, `-bufsize:v:${i}`, r.bufsize);
    varMap.push(`v:${i},a:${i},name:${r.name}`);
  });

  const audioArgs = media.hasAudio
    ? ["-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "128k"]
    : ["-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "128k", "-shortest"];

  const args = [
    "-y",
    "-avoid_negative_ts",
    "make_zero",
    ...inputArgs,
    "-filter_complex",
    filterComplex,
    ...mapArgs,
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-level:v",
    "4.0",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-x264-params",
    "scenecut=0:open_gop=0",
    "-sc_threshold",
    "0",
    "-g",
    String(gopFrames),
    "-keyint_min",
    String(gopFrames),
    "-force_key_frames",
    "expr:gte(t,n_forced*6)",
    "-fps_mode",
    "cfr",
    ...rateArgs,
    ...audioArgs,
    "-max_muxing_queue_size",
    "1024",
    "-max_interleave_delta",
    "0",
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
    varMap.join(" "),
    "-hls_segment_filename",
    path.join(absOut, "%v", "seg_%05d.ts").replace(/\\/g, "/"),
    path.join(absOut, "%v", "index.m3u8").replace(/\\/g, "/"),
  ];

  console.log(`Encoding "${absInput}" -> "${absOut}" (renditions: ${renditions.map((r) => r.name).join(", ")}, CFR ${targetFps}fps, 6s keyframes)...`);
  const res = spawnSync(ffmpegBin, args, { stdio: "inherit" });
  if (res.status !== 0) {
    throw new Error(`ffmpeg exited with code ${res.status}`);
  }

  console.log("Validating encoded HLS output...");
  const validation = await validateHlsFolder(absOut);
  console.table(validation.perRendition);
  if (!validation.ok) {
    throw new Error(`Encoded HLS failed validation: BROKEN (${validation.reasons.join(", ")})`);
  }
  console.log("OK: Encoded HLS passed all validation checks.");
  return { outDir: absOut, renditions: renditions.map((r) => r.name), durationMinutes: media.durationMinutes };
}

const isCli =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

if (isCli) {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3];
  if (!inputArg || inputArg === "--help" || inputArg === "-h") {
    console.log("Usage: node tools/video-cli/encode-hls.mjs <input-video.mp4> [output-dir]");
    process.exit(inputArg ? 0 : 1);
  }
  const baseName = path.basename(inputArg, path.extname(inputArg));
  const outDir = outputArg || path.join(path.dirname(path.resolve(inputArg)), `${baseName}-hls`);
  await encodeHls({ inputPath: inputArg, outDir });
}
