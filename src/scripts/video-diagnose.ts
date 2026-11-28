import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "../db";
import { lessons } from "../db/schema";
import { getVideoEnvStatus } from "../services/video.service";
import { getVideoStorageProvider } from "../services/video-storage.service";

function parsePlaylistLines(text: string) {
  const lines = text.split(/\r?\n/);
  let hasEndlist = false;
  let extinfSum = 0;
  const uris: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line === "#EXT-X-ENDLIST") hasEndlist = true;
    else if (line.startsWith("#EXTINF:")) {
      const d = Number(line.slice("#EXTINF:".length).split(",")[0]);
      if (Number.isFinite(d) && d > 0) extinfSum += d;
    } else if (!line.startsWith("#")) {
      uris.push(line.split("?")[0]);
    }
  }
  return { hasEndlist, extinfSum, uris };
}

async function main() {
  const args = process.argv.slice(2);
  const markBroken = args.includes("--mark-broken");
  const target = args.find((a) => !a.startsWith("--")) || "all";

  const env = getVideoEnvStatus();
  console.log(`[video:diagnose] mode=${env.storageMode} azureConfigured=${env.azureConfigured} target=${target} markBroken=${markBroken}`);
  if (env.storageMode !== "azure" || !env.azureConfigured) {
    console.error("[video:diagnose] Requires VIDEO_STORAGE_MODE=azure and Azure credentials in environment.");
    await pool.end();
    process.exit(1);
  }

  const storage = getVideoStorageProvider();
  if (!storage.listBlobsDetailed) {
    console.error("[video:diagnose] Storage provider does not support detailed blob listing.");
    await pool.end();
    process.exit(1);
  }

  const rows =
    target === "all"
      ? await db
          .select({
            id: lessons.id,
            videoProvider: lessons.videoProvider,
            videoStatus: lessons.videoStatus,
            videoHlsPath: lessons.videoHlsPath,
            durationMinutes: lessons.durationMinutes,
          })
          .from(lessons)
          .where(eq(lessons.videoProvider, "AZURE_HLS"))
      : await db
          .select({
            id: lessons.id,
            videoProvider: lessons.videoProvider,
            videoStatus: lessons.videoStatus,
            videoHlsPath: lessons.videoHlsPath,
            durationMinutes: lessons.durationMinutes,
          })
          .from(lessons)
          .where(eq(lessons.id, target));

  const summary: any[] = [];

  for (const row of rows) {
    const cleanHlsPath = row.videoHlsPath ? row.videoHlsPath.split("?")[0] : null;
    if (!cleanHlsPath) {
      summary.push({
        lessonId: row.id,
        status: row.videoStatus,
        expected: 0,
        existing: 0,
        missing: 0,
        zeroByte: 0,
        endlist: false,
        verdict: "BROKEN",
        reason: "video_hls_path is null",
      });
      continue;
    }

    const prefix = cleanHlsPath.replace(/\/master\.m3u8$/, "");
    const allBlobs = await storage.listBlobsDetailed(`${row.id}/`);
    const blobMap = new Map(allBlobs.map((b) => [b.name, b]));
    const lowerMap = new Map(allBlobs.map((b) => [b.name.toLowerCase(), b]));
    const wrongPrefixBlobs = allBlobs.filter((b) => !b.name.startsWith(`${prefix}/`));

    const masterBlob = blobMap.get(cleanHlsPath);
    if (!masterBlob || masterBlob.sizeBytes <= 0) {
      const reason = !masterBlob
        ? `master.m3u8 missing (${wrongPrefixBlobs.length} blobs under other prefix)`
        : "master.m3u8 is 0 bytes";
      summary.push({
        lessonId: row.id,
        status: row.videoStatus,
        expected: 0,
        existing: 0,
        missing: 1,
        zeroByte: masterBlob ? 1 : 0,
        endlist: false,
        verdict: "BROKEN",
        reason,
      });
      if (markBroken) {
        await db.update(lessons).set({ videoStatus: "NEEDS_REUPLOAD", videoError: reason }).where(eq(lessons.id, row.id));
      }
      continue;
    }

    const masterParsed = parsePlaylistLines(await storage.getPlaylistText(cleanHlsPath));
    let expectedSegs = 0;
    let existingSegs = 0;
    let missingSegs = 0;
    let zeroByteSegs = 0;
    let caseMismatches = 0;
    let absoluteUris = 0;
    let allEndlist = true;
    const missingSample: string[] = [];
    const m3u8Types = new Set<string>();
    const tsTypes = new Set<string>();
    const tsCaches = new Set<string>();
    const variantDurations: number[] = [];

    if (masterBlob.contentType) m3u8Types.add(masterBlob.contentType);

    for (const vp of masterParsed.uris) {
      if (/^https?:\/\//i.test(vp)) {
        absoluteUris++;
        continue;
      }
      const vFull = `${prefix}/${vp.replace(/\\/g, "/")}`;
      const vBlob = blobMap.get(vFull);
      if (!vBlob || vBlob.sizeBytes <= 0) {
        missingSegs++;
        missingSample.push(vp);
        continue;
      }
      if (vBlob.contentType) m3u8Types.add(vBlob.contentType);
      const vDir = vp.split("/")[0];
      const vParsed = parsePlaylistLines(await storage.getPlaylistText(vFull));
      if (!vParsed.hasEndlist) allEndlist = false;
      variantDurations.push(vParsed.extinfSum);

      for (const seg of vParsed.uris) {
        expectedSegs++;
        if (/^https?:\/\//i.test(seg)) {
          absoluteUris++;
          continue;
        }
        const sFull = `${prefix}/${vDir}/${seg.replace(/\\/g, "/")}`;
        const exact = blobMap.get(sFull);
        if (exact) {
          if (exact.sizeBytes <= 0) {
            zeroByteSegs++;
            if (missingSample.length < 5) missingSample.push(`${vDir}/${seg} (0B)`);
          } else {
            existingSegs++;
            if (exact.contentType) tsTypes.add(exact.contentType);
            if (exact.cacheControl) tsCaches.add(exact.cacheControl);
          }
        } else {
          missingSegs++;
          if (lowerMap.has(sFull.toLowerCase())) caseMismatches++;
          if (missingSample.length < 5) missingSample.push(`${vDir}/${seg}`);
        }
      }
    }

    const reasons: string[] = [];
    if (missingSegs > 0) reasons.push(`${missingSegs} missing (${missingSample.join(", ")})`);
    if (zeroByteSegs > 0) reasons.push(`${zeroByteSegs} zero-byte`);
    if (caseMismatches > 0) reasons.push(`${caseMismatches} case mismatch`);
    if (!allEndlist) reasons.push("missing #EXT-X-ENDLIST");
    if (absoluteUris > 0) reasons.push(`${absoluteUris} absolute URI(s)`);
    if (wrongPrefixBlobs.length > 0) reasons.push(`${wrongPrefixBlobs.length} wrong-prefix blob(s)`);

    const verdict = reasons.length === 0 ? "OK" : "BROKEN";
    const reasonStr = reasons.join("; ") || `OK (m3u8=${[...m3u8Types].join(",") || "unset"}, ts=${[...tsTypes].join(",") || "unset"}, extinf=${variantDurations.map((d) => Math.round(d)).join("/")}s vs ${row.durationMinutes || "?"}m)`;

    summary.push({
      lessonId: row.id,
      status: row.videoStatus,
      expected: expectedSegs,
      existing: existingSegs,
      missing: missingSegs,
      zeroByte: zeroByteSegs,
      endlist: allEndlist,
      verdict,
      reason: reasonStr,
    });

    if (markBroken && verdict === "BROKEN") {
      await db
        .update(lessons)
        .set({ videoStatus: "NEEDS_REUPLOAD", videoError: reasonStr.slice(0, 500) })
        .where(eq(lessons.id, row.id));
    }
  }

  console.table(summary);
  await pool.end();
}

main().catch((err) => {
  console.error("[video:diagnose] ERROR:", err?.message || err);
  process.exit(1);
});
