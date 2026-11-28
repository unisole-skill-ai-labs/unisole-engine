#!/usr/bin/env node
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const FFPROBE_BIN = process.env.FFPROBE_PATH || "ffprobe";
const RENDITIONS = ["360p", "480p", "720p", "1080p"];

async function runFfprobeJson(args) {
  const { stdout } = await execFileAsync(
    FFPROBE_BIN,
    ["-v", "error", "-print_format", "json", ...args],
    { maxBuffer: 20 * 1024 * 1024 }
  );
  return JSON.parse(stdout || "{}");
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
  let hasEndlist = false;
  const segments = [];
  let pendingDuration = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXT-X-TARGETDURATION:")) {
      targetDuration = Number(line.split(":")[1]);
    } else if (line === "#EXT-X-ENDLIST") {
      hasEndlist = true;
    } else if (line.startsWith("#EXTINF:")) {
      pendingDuration = Number(line.slice("#EXTINF:".length).split(",")[0]);
    } else if (!line.startsWith("#")) {
      segments.push({ uri: line.replace(/\\/g, "/"), extinf: pendingDuration });
      pendingDuration = null;
    }
  }
  return { targetDuration, hasEndlist, segments };
}

async function probeSegment(segPath) {
  const [pktInfo, streamInfo] = await Promise.all([
    runFfprobeJson(["-show_packets", "-read_intervals", "%+#8", segPath]),
    runFfprobeJson(["-show_format", "-show_streams", segPath]),
  ]);
  const packets = pktInfo.packets || [];
  const streams = streamInfo.streams || [];
  const format = streamInfo.format || {};
  const vStream = streams.find((s) => s.codec_type === "video");
  const aStream = streams.find((s) => s.codec_type === "audio");
  const firstVideoPkt = packets.find((p) => p.codec_type === "video");

  const vStart = vStream?.start_time !== undefined ? Number(vStream.start_time) : null;
  const aStart = aStream?.start_time !== undefined ? Number(aStream.start_time) : null;
  const vDur = vStream?.duration !== undefined ? Number(vStream.duration) : Number(format.duration || 0);
  const duration = Number(format.duration || vDur || 0);

  return {
    duration,
    vDur,
    hasVideo: Boolean(vStream),
    hasAudio: Boolean(aStream),
    startsWithKeyframe: firstVideoPkt ? String(firstVideoPkt.flags || "").includes("K") : false,
    vStart,
    aStart,
    vCodec: vStream?.codec_name || null,
    vProfile: vStream?.profile || null,
    vLevel: vStream?.level || null,
    pixFmt: vStream?.pix_fmt || null,
    aCodec: aStream?.codec_name || null,
    aSampleRate: aStream?.sample_rate ? Number(aStream.sample_rate) : null,
    aChannels: aStream?.channels ? Number(aStream.channels) : null,
  };
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function validateHlsFolder(folderPath) {
  const root = path.resolve(folderPath);
  const reasons = new Set();
  const perRendition = {};

  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { ok: false, reasons: ["folder not found"], perRendition };
  }

  const masterPath = path.join(root, "master.m3u8");
  if (!fs.existsSync(masterPath)) {
    return { ok: false, reasons: ["missing master.m3u8"], perRendition };
  }

  const masterStreams = parseMasterPlaylist(fs.readFileSync(masterPath, "utf8"));
  const masterUris = new Set(masterStreams.map((s) => s.uri));
  const diskRenditions = RENDITIONS.filter((r) => fs.existsSync(path.join(root, r)));
  if (diskRenditions.length === 0) {
    return { ok: false, reasons: ["no rendition folders"], perRendition };
  }

  for (const r of diskRenditions) {
    if (!masterUris.has(`${r}/index.m3u8`)) {
      reasons.add(`master missing ${r}/index.m3u8`);
    }
  }

  const codecSignatures = new Set();

  for (const r of diskRenditions) {
    const rDir = path.join(root, r);
    const idxPath = path.join(rDir, "index.m3u8");
    const counts = {
      missingFiles: 0,
      zeroByte: 0,
      extraFiles: 0,
      missingKeyframe: 0,
      avStartGap: 0,
      extinfMismatch: 0,
      longerThanTarget: 0,
      timestampGap: 0,
      missingAudio: 0,
      missingEndlist: 0,
    };

    if (!fs.existsSync(idxPath)) {
      reasons.add("missing index.m3u8");
      perRendition[r] = counts;
      continue;
    }

    const parsed = parseVariantPlaylist(fs.readFileSync(idxPath, "utf8"));
    if (!parsed.hasEndlist) {
      counts.missingEndlist = 1;
      reasons.add("missing #EXT-X-ENDLIST");
    }
    if (!parsed.targetDuration) {
      reasons.add("missing #EXT-X-TARGETDURATION");
    }

    const diskSegs = fs.readdirSync(rDir).filter((f) => f !== "index.m3u8");
    const refSegs = new Set(parsed.segments.map((s) => s.uri));
    counts.extraFiles = diskSegs.filter((f) => !refSegs.has(f)).length;
    if (diskSegs.length !== parsed.segments.length) {
      reasons.add("segment count mismatch");
    }

    const validPaths = [];
    for (let i = 0; i < parsed.segments.length; i++) {
      const segPath = path.join(rDir, parsed.segments[i].uri);
      if (!fs.existsSync(segPath)) {
        counts.missingFiles++;
        reasons.add("missing segments");
      } else if (fs.statSync(segPath).size <= 0) {
        counts.zeroByte++;
        reasons.add("zero-byte segments");
      } else {
        validPaths.push({ idx: i, segPath, extinf: parsed.segments[i].extinf });
      }
    }

    const probes = await mapPool(validPaths, 4, async (item) => ({
      ...item,
      probe: await probeSegment(item.segPath),
    }));

    for (let i = 0; i < probes.length; i++) {
      const { extinf, probe } = probes[i];
      if (!probe.startsWithKeyframe) {
        counts.missingKeyframe++;
        reasons.add("keyframe missing");
      }
      if (!probe.hasAudio) {
        counts.missingAudio++;
        reasons.add("missing audio");
      }
      if (probe.vStart !== null && probe.aStart !== null && Math.abs(probe.vStart - probe.aStart) >= 0.1) {
        counts.avStartGap++;
        reasons.add("audio/video start gap");
      }
      if (extinf !== null && Math.abs(probe.duration - extinf) > 0.5) {
        counts.extinfMismatch++;
        reasons.add("segments longer than target");
      }
      if (parsed.targetDuration && probe.duration > parsed.targetDuration + 1) {
        counts.longerThanTarget++;
        reasons.add("segments longer than target");
      }
      if (i > 0) {
        const prev = probes[i - 1].probe;
        if (prev.vStart !== null && probe.vStart !== null) {
          const expectedNext = prev.vStart + prev.vDur;
          if (Math.abs(probe.vStart - expectedNext) > 0.05) {
            counts.timestampGap++;
            reasons.add("timestamp gap");
          }
        }
      }
      if (i === 0) {
        codecSignatures.add(
          `${probe.vCodec}/${probe.vProfile}/${probe.pixFmt}/${probe.aCodec}/${probe.aSampleRate}/${probe.aChannels}`
        );
        const ms = masterStreams.find((s) => s.uri === `${r}/index.m3u8`);
        if (ms?.codecs) {
          if (!ms.codecs.includes("avc1.") || (probe.hasAudio && !ms.codecs.includes("mp4a.40.2"))) {
            reasons.add("master CODECS mismatch");
          }
        }
      }
    }

    perRendition[r] = counts;
  }

  if (codecSignatures.size > 1) {
    reasons.add("inconsistent codecs/audio across renditions");
  }

  const reasonList = [...reasons];
  return {
    ok: reasonList.length === 0,
    reasons: reasonList,
    perRendition,
  };
}

const isCli =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

if (isCli) {
  const args = process.argv.slice(2);
  let folder = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--local") folder = args[++i] || "";
    else if (args[i].startsWith("--local=")) folder = args[i].split("=")[1] || "";
    else if (!args[i].startsWith("--") && !folder) folder = args[i];
  }
  if (!folder) {
    console.error("Usage: npm run video:validate -- --local <hls-folder>");
    process.exit(1);
  }
  const res = await validateHlsFolder(folder);
  console.table(res.perRendition);
  console.log(res.ok ? "OK" : `BROKEN: ${res.reasons.join(", ")}`);
  if (!res.ok) process.exit(1);
}
