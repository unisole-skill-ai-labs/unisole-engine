#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { encodeHls } from "./encode-hls.mjs";

const RENDITION_PRIORITY = ["1080p", "720p", "480p", "360p"];

function parseArgs(argv) {
  let inPath = "";
  let outPath = "";
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--in") inPath = argv[++i] || "";
    else if (argv[i].startsWith("--in=")) inPath = argv[i].split("=")[1] || "";
    else if (argv[i] === "--out") outPath = argv[++i] || "";
    else if (argv[i].startsWith("--out=")) outPath = argv[i].split("=")[1] || "";
  }
  return { inPath, outPath };
}

const { inPath, outPath } = parseArgs(process.argv);
if (!inPath || !outPath) {
  console.error("Usage: npm run video:reencode -- --in <original-file | downloaded-hls-folder> --out <output-folder>");
  process.exit(1);
}

const absIn = path.resolve(inPath);
if (!fs.existsSync(absIn)) {
  console.error(`Input not found: ${absIn}`);
  process.exit(1);
}

let ffmpegInput = absIn;
if (fs.statSync(absIn).isDirectory()) {
  const best = RENDITION_PRIORITY.find((r) => fs.existsSync(path.join(absIn, r, "index.m3u8")));
  if (!best) {
    console.error(`No rendition index.m3u8 found inside HLS folder: ${absIn}`);
    process.exit(1);
  }
  console.warn(
    `[WARN] Re-encoding from HLS folder (${best}/index.m3u8). Output quality can only be as good as the ${best} rendition; use the original recording if available.`
  );
  ffmpegInput = path.join(absIn, best, "index.m3u8");
}

await encodeHls({ inputPath: ffmpegInput, outDir: outPath });
console.log("\nNext steps:");
console.log("  1. Open the lesson in the Unisole Admin Course Editor.");
console.log("  2. Click 'Replace video' (this deletes the old broken blobs and keeps student progress).");
console.log(`  3. Upload the folder "${path.resolve(outPath)}" and click Verify & Publish.`);
