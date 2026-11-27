#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FFPROBE_BIN = process.env.FFPROBE_PATH || "ffprobe";
const RENDITIONS = ["360p", "480p", "720p", "1080p"];

function runFfprobeJson(args) {
  const out = execFileSync(FFPROBE_BIN, ["-v", "error", "-print_format", "json", ...args], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(out || "{}");
}

function parseMasterPlaylist(text) {
  const lines = text.split(/\r?\n/);
  const streams = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXT-X-STREAM-INF:")) {
      const attrs = line.slice("#EXT-X-STREAM-INF:".length);
      const bwMatch = attrs.match(/BANDWIDTH=(\d+)/);
      const resMatch = attrs.match(/RESOLUTION=(\d+x\d+)/);
      const codecsMatch = attrs.match(/CODECS="([^"]+)"/);
      let uri = "";
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (next && !next.startsWith("#")) {
          uri = next.replace(/\\/g, "/");
          i = j;
          break;
        }
      }
      streams.push({
        bandwidth: bwMatch ? Number(bwMatch[1]) : null,
        resolution: resMatch ? resMatch[1] : null,
        codecs: codecsMatch ? codecsMatch[1] : null,
        uri,
      });
    }
  }
  return streams;
}

function parseVariantPlaylist(text) {
  const lines = text.split(/\r?\n/);
  let targetDuration = null;
  let playlistType = null;
  let version = null;
  let mediaSequence = null;
  let hasEndlist = false;
  let discontinuities = 0;
  const segments = [];
  let pendingDuration = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXT-X-TARGETDURATION:")) {
      targetDuration = Number(line.split(":")[1]);
    } else if (line.startsWith("#EXT-X-PLAYLIST-TYPE:")) {
      playlistType = line.split(":")[1].trim();
    } else if (line.startsWith("#EXT-X-VERSION:")) {
      version = Number(line.split(":")[1]);
    } else if (line.startsWith("#EXT-X-MEDIA-SEQUENCE:")) {
      mediaSequence = Number(line.split(":")[1]);
    } else if (line === "#EXT-X-DISCONTINUITY") {
      discontinuities++;
    } else if (line === "#EXT-X-ENDLIST") {
      hasEndlist = true;
    } else if (line.startsWith("#EXTINF:")) {
      const durStr = line.slice("#EXTINF:".length).split(",")[0];
      pendingDuration = Number(durStr);
    } else if (!line.startsWith("#")) {
      segments.push({
        uri: line.replace(/\\/g, "/"),
        extinf: pendingDuration,
      });
      pendingDuration = null;
    }
  }
  return { targetDuration, playlistType, version, mediaSequence, hasEndlist, discontinuities, segments };
}

function probeSegment(segPath) {
  const info = runFfprobeJson([
    "-show_format",
    "-show_streams",
    "-show_packets",
    "-read_intervals",
    "%+#5",
    segPath,
  ]);
  const format = info.format || {};
  const streams = info.streams || [];
  const packets = info.packets || [];
  const vStream = streams.find((s) => s.codec_type === "video");
  const aStream = streams.find((s) => s.codec_type === "audio");

  const vPackets = packets.filter((p) => p.codec_type === "video");
  const aPackets = packets.filter((p) => p.codec_type === "audio");
  const firstVideoPacket = vPackets[0];
  const startsWithKeyframe = firstVideoPacket ? String(firstVideoPacket.flags || "").includes("K") : false;

  // Full duration & frame count via lightweight stream probe
  const full = runFfprobeJson(["-show_format", "-show_streams", segPath]);
  const fv = (full.streams || []).find((s) => s.codec_type === "video") || vStream;
  const fa = (full.streams || []).find((s) => s.codec_type === "audio") || aStream;
  const duration = Number(full.format?.duration || format.duration || 0);
  const sizeBytes = fs.statSync(segPath).size;
  const bitrateKbps = duration > 0 ? Math.round((sizeBytes * 8) / duration / 1000) : 0;

  return {
    sizeBytes,
    duration,
    bitrateKbps,
    hasVideo: Boolean(fv),
    hasAudio: Boolean(fa),
    vCodec: fv?.codec_name || null,
    vProfile: fv?.profile || null,
    vLevel: fv?.level || null,
    pixFmt: fv?.pix_fmt || null,
    rFrameRate: fv?.r_frame_rate || null,
    avgFrameRate: fv?.avg_frame_rate || null,
    aCodec: fa?.codec_name || null,
    aSampleRate: fa?.sample_rate ? Number(fa.sample_rate) : null,
    vStartTime: fv?.start_time !== undefined ? Number(fv.start_time) : null,
    aStartTime: fa?.start_time !== undefined ? Number(fa.start_time) : null,
    startsWithKeyframe,
    encoderTag: full.format?.tags?.encoder || full.format?.tags?.compatible_brands || null,
  };
}

export function analyzeHlsFolder(folderPath) {
  const root = path.resolve(folderPath);
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { folder: root, ok: false, errors: [`Folder not found: ${root}`], warnings, renditions: {} };
  }

  const masterPath = path.join(root, "master.m3u8");
  if (!fs.existsSync(masterPath)) {
    errors.push("Missing master.m3u8");
    return { folder: root, ok: false, errors, warnings, renditions: {} };
  }
  const masterText = fs.readFileSync(masterPath, "utf8");
  const masterStreams = parseMasterPlaylist(masterText);
  if (masterStreams.length === 0) {
    errors.push("master.m3u8 has no #EXT-X-STREAM-INF variants");
  }
  for (const ms of masterStreams) {
    if (!ms.bandwidth) warnings.push(`master.m3u8 variant ${ms.uri} missing BANDWIDTH`);
    if (!ms.resolution) warnings.push(`master.m3u8 variant ${ms.uri} missing RESOLUTION`);
    if (!ms.codecs) warnings.push(`master.m3u8 variant ${ms.uri} missing CODECS`);
  }

  const presentRenditions = RENDITIONS.filter((r) => fs.existsSync(path.join(root, r)));
  if (presentRenditions.length === 0) {
    errors.push("No rendition folders (360p/480p/720p/1080p) found");
  }

  const renditions = {};
  for (const r of presentRenditions) {
    const rDir = path.join(root, r);
    const idxPath = path.join(rDir, "index.m3u8");
    if (!fs.existsSync(idxPath)) {
      errors.push(`${r}: missing index.m3u8`);
      continue;
    }
    const parsed = parseVariantPlaylist(fs.readFileSync(idxPath, "utf8"));
    if (!parsed.hasEndlist) errors.push(`${r}: missing #EXT-X-ENDLIST`);
    if (parsed.playlistType !== "VOD") warnings.push(`${r}: playlistType is "${parsed.playlistType}", expected VOD`);
    if (parsed.segments.length === 0) {
      errors.push(`${r}: 0 segments listed in index.m3u8`);
      continue;
    }

    const diskFiles = new Set(fs.readdirSync(rDir).filter((f) => f !== "index.m3u8"));
    const referencedFiles = new Set(parsed.segments.map((s) => s.uri));
    const unreferenced = [...diskFiles].filter((f) => !referencedFiles.has(f));
    if (unreferenced.length > 0) {
      warnings.push(`${r}: ${unreferenced.length} unreferenced file(s) on disk (e.g. ${unreferenced.slice(0, 3).join(", ")})`);
    }

    const missingSegments = [];
    const emptySegments = [];
    const nonKeyframeSegments = [];
    const extinfMismatches = [];
    const timestampGaps = [];
    let totalDuration = 0;
    let totalBytes = 0;
    let maxSegDuration = 0;
    let minBitrate = Infinity;
    let maxBitrate = 0;
    let vCodec = null;
    let vProfile = null;
    let pixFmt = null;
    let aCodec = null;
    let isVfr = false;
    let prevEndPts = null;
    let encoderTag = null;

    for (let i = 0; i < parsed.segments.length; i++) {
      const seg = parsed.segments[i];
      const segPath = path.join(rDir, seg.uri);
      if (!fs.existsSync(segPath)) {
        missingSegments.push(seg.uri);
        continue;
      }
      const stat = fs.statSync(segPath);
      if (stat.size <= 0) {
        emptySegments.push(seg.uri);
        continue;
      }
      totalBytes += stat.size;
      const p = probeSegment(segPath);
      totalDuration += p.duration;
      if (p.duration > maxSegDuration) maxSegDuration = p.duration;
      if (p.bitrateKbps > 0) {
        minBitrate = Math.min(minBitrate, p.bitrateKbps);
        maxBitrate = Math.max(maxBitrate, p.bitrateKbps);
      }
      vCodec = vCodec || p.vCodec;
      vProfile = vProfile || p.vProfile;
      pixFmt = pixFmt || p.pixFmt;
      aCodec = aCodec || p.aCodec;
      encoderTag = encoderTag || p.encoderTag;

      if (p.pixFmt && p.pixFmt !== "yuv420p") {
        errors.push(`${r}/${seg.uri}: unsupported pixel format ${p.pixFmt} (expected yuv420p)`);
      }
      if (p.rFrameRate && p.avgFrameRate && p.rFrameRate !== p.avgFrameRate) {
        isVfr = true;
      }
      if (p.hasVideo && !p.startsWithKeyframe) {
        nonKeyframeSegments.push(seg.uri);
      }
      if (seg.extinf !== null && Math.abs(seg.extinf - p.duration) > 0.5) {
        extinfMismatches.push(`${seg.uri} (EXTINF=${seg.extinf}s vs actual=${p.duration.toFixed(2)}s)`);
      }
      if (p.vStartTime !== null) {
        if (p.vStartTime < 0) timestampGaps.push(`${seg.uri} negative PTS ${p.vStartTime}`);
        if (prevEndPts !== null && Math.abs(p.vStartTime - prevEndPts) > 0.25) {
          timestampGaps.push(`${seg.uri} PTS jump ${prevEndPts.toFixed(2)} -> ${p.vStartTime.toFixed(2)}`);
        }
        prevEndPts = p.vStartTime + p.duration;
      }
    }

    if (missingSegments.length > 0) errors.push(`${r}: missing ${missingSegments.length} segment(s): ${missingSegments.slice(0, 5).join(", ")}`);
    if (emptySegments.length > 0) errors.push(`${r}: ${emptySegments.length} empty (0-byte) segment(s)`);
    if (nonKeyframeSegments.length > 0) errors.push(`${r}: ${nonKeyframeSegments.length} segment(s) do NOT start with a keyframe: ${nonKeyframeSegments.slice(0, 5).join(", ")}`);
    if (extinfMismatches.length > 0) errors.push(`${r}: #EXTINF duration mismatch > 0.5s: ${extinfMismatches.slice(0, 3).join("; ")}`);
    if (timestampGaps.length > 0) warnings.push(`${r}: timestamp gaps/resets: ${timestampGaps.slice(0, 3).join("; ")}`);
    if (isVfr) warnings.push(`${r}: variable frame rate detected (r_frame_rate != avg_frame_rate)`);
    if (parsed.targetDuration && maxSegDuration > parsed.targetDuration + 0.5) {
      warnings.push(`${r}: longest segment ${maxSegDuration.toFixed(2)}s exceeds #EXT-X-TARGETDURATION:${parsed.targetDuration}`);
    }

    const avgBitrateKbps = totalDuration > 0 ? Math.round((totalBytes * 8) / totalDuration / 1000) : 0;
    renditions[r] = {
      segmentCount: parsed.segments.length,
      missingCount: missingSegments.length,
      nonKeyframeCount: nonKeyframeSegments.length,
      extinfMismatchCount: extinfMismatches.length,
      totalDurationSec: Number(totalDuration.toFixed(2)),
      maxSegDurationSec: Number(maxSegDuration.toFixed(2)),
      targetDuration: parsed.targetDuration,
      hasEndlist: parsed.hasEndlist,
      totalSizeMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      bitrateKbps: {
        min: minBitrate === Infinity ? 0 : minBitrate,
        avg: avgBitrateKbps,
        max: maxBitrate,
      },
      vCodec,
      vProfile,
      pixFmt,
      aCodec,
      isVfr,
      encoderTag,
    };
  }

  // Cross-rendition duration check
  const durations = Object.values(renditions).map((r) => r.totalDurationSec);
  if (durations.length > 1) {
    const diff = Math.max(...durations) - Math.min(...durations);
    if (diff > 0.25) {
      warnings.push(`Rendition total durations differ by ${diff.toFixed(2)}s`);
    }
  }

  return {
    folder: root,
    ok: errors.length === 0,
    errors,
    warnings,
    masterStreams,
    renditions,
  };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("hls-doctor.mjs")) {
  const dirs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const jsonMode = process.argv.includes("--json");
  if (dirs.length === 0) {
    console.log("Usage: node tools/video-cli/hls-doctor.mjs <hls-folder-1> [hls-folder-2] [--json]");
    process.exit(1);
  }
  const results = dirs.map(analyzeHlsFolder);
  if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const r of results) {
      console.log(`\n=== HLS DOCTOR: ${r.folder} ===`);
      console.log(`VERDICT: ${r.ok ? "PASS" : "FAIL"} (${r.errors.length} error(s), ${r.warnings.length} warning(s))`);
      for (const e of r.errors) console.log(`  [ERROR] ${e}`);
      for (const w of r.warnings) console.log(`  [WARN]  ${w}`);
      console.table(
        Object.entries(r.renditions).map(([name, info]) => ({
          rendition: name,
          segments: info.segmentCount,
          missing: info.missingCount,
          noKeyframe: info.nonKeyframeCount,
          extinfBad: info.extinfMismatchCount,
          durSec: info.totalDurationSec,
          maxSegSec: info.maxSegDurationSec,
          avgKbps: info.bitrateKbps.avg,
          vfr: info.isVfr,
          pixFmt: info.pixFmt,
          endlist: info.hasEndlist,
        }))
      );
    }
  }
  if (results.some((r) => !r.ok)) process.exit(1);
}
