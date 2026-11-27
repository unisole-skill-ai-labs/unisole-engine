import assert from "node:assert";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../db";
import { lessons } from "../db/schema";
import { videoService } from "../services/video.service";
import {
  rewriteMasterPlaylist,
  rewriteVariantPlaylist,
  VideoStorageProvider,
} from "../services/video-storage.service";

function createMockStorage(blobs: Map<string, string>): VideoStorageProvider {
  return {
    mode: "azure",
    async generateWriteSasUrls() { return {}; },
    async generateSingleWriteSasUrl() { return ""; },
    async verifyBlobExists(blobPath: string) {
      const val = blobs.get(blobPath);
      return val !== undefined ? { exists: true, sizeBytes: Buffer.byteLength(val) } : { exists: false, sizeBytes: 0 };
    },
    async listBlobsWithSizes(prefix: string) {
      const out = new Map<string, number>();
      for (const [k, v] of blobs.entries()) {
        if (k.startsWith(prefix)) out.set(k, Buffer.byteLength(v));
      }
      return out;
    },
    async getPlaylistText(blobPath: string) {
      const val = blobs.get(blobPath);
      if (val === undefined) throw new Error(`Missing blob ${blobPath}`);
      return val;
    },
    async generateReadSasUrl(blobPath: string) { return `https://stub/${blobPath}?sig=test`; },
    async deletePrefix(prefix: string) {
      let c = 0;
      for (const k of [...blobs.keys()]) {
        if (k.startsWith(prefix)) { blobs.delete(k); c++; }
      }
      return c;
    },
    async listBlobPrefixes() { return []; },
    async runSetupDiagnostics() {
      return { connectivity: { ok: true, message: "ok" }, corsCheck: { ok: true, message: "ok" } };
    },
  };
}

async function main() {
  // 1. Playlist rewriter unit tests (3-digit, 4-digit, 5-digit, multiple renditions, ENDLIST)
  const master = "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000\n360p/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2400000\n720p/index.m3u8\n";
  const rewrittenMaster = rewriteMasterPlaylist(master, (v) => `https://api.test/hls/${v}?token=t`);
  assert.ok(rewrittenMaster.includes("https://api.test/hls/360p/index.m3u8?token=t"));
  assert.ok(rewrittenMaster.includes("https://api.test/hls/720p/index.m3u8?token=t"));

  const variant = "#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXTINF:6.000,\nseg_000.ts\n#EXTINF:6.000,\nseg_1000.ts\n#EXTINF:6.000,\nseg_00005.ts\n#EXT-X-ENDLIST\n";
  const rewrittenVar = rewriteVariantPlaylist(variant, "720p", (rel) => `https://cdn.test/${rel}?sas=1`);
  assert.ok(rewrittenVar.includes("https://cdn.test/720p/seg_000.ts?sas=1"));
  assert.ok(rewrittenVar.includes("https://cdn.test/720p/seg_1000.ts?sas=1"));
  assert.ok(rewrittenVar.includes("https://cdn.test/720p/seg_00005.ts?sas=1"));
  assert.ok(rewrittenVar.includes("#EXT-X-ENDLIST"));
  console.log("PASS 1: Playlist rewriter handles 3/4/5-digit segments, multi-rendition, and ENDLIST.");

  // 2. Post-upload verification & Replace & Diagnose tests against local DB
  const lesId = `les_unit_${Date.now()}`;
  const uuid = crypto.randomUUID();
  const prefix = `${lesId}/${uuid}`;
  const hlsPath = `${prefix}/master.m3u8`;

  await db.insert(lessons).values({
    id: lesId,
    title: "Unit HLS Verify Lesson",
    slug: lesId,
    content: "{}",
  });

  try {
    const blobs = new Map<string, string>();
    blobs.set(`${prefix}/master.m3u8`, "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000\n360p/index.m3u8\n");
    blobs.set(`${prefix}/360p/index.m3u8`, "#EXTM3U\n#EXTINF:6.0,\nseg_000.ts\n#EXTINF:6.0,\nseg_001.ts\n#EXT-X-ENDLIST\n");
    blobs.set(`${prefix}/360p/seg_000.ts`, "ts-bytes-0");
    // seg_001.ts intentionally missing!

    const storage = createMockStorage(blobs);
    let failedMissing = false;
    try {
      await videoService.completeUpload(lesId, hlsPath, 1, storage);
    } catch (err: any) {
      failedMissing = err?.message?.includes("1 missing") && err?.message?.includes("360p/seg_001.ts");
    }
    assert.ok(failedMissing, "Expected completeUpload to reject partial upload with missing seg_001.ts");
    const rowAfterFail = (await db.select().from(lessons).where(eq(lessons.id, lesId)))[0];
    assert.strictEqual(rowAfterFail.videoStatus, "FAILED");
    console.log("PASS 2: Post-upload verification blocks partial upload from becoming READY.");

    // Add missing segment and verify completeUpload succeeds
    blobs.set(`${prefix}/360p/seg_001.ts`, "ts-bytes-1");
    const okRes = await videoService.completeUpload(lesId, hlsPath, 1, storage);
    assert.strictEqual(okRes.status, "READY");

    // Diagnose check
    const diag = await videoService.diagnoseLessonVideo(lesId, storage);
    assert.strictEqual(diag.missingCount, 0);
    assert.strictEqual(diag.masterExists, true);
    console.log("PASS 3: Complete upload marks READY and diagnoseLessonVideo reports 0 missing.");

    // Replace video resets status and deletes blobs
    const rep = await videoService.resetForReplace(lesId, storage);
    assert.strictEqual(rep.reset, true);
    assert.strictEqual(rep.deletedBlobs, 4);
    const rowAfterRep = (await db.select().from(lessons).where(eq(lessons.id, lesId)))[0];
    assert.strictEqual(rowAfterRep.videoStatus, "NONE");
    console.log("PASS 4: resetForReplace deletes blobs and resets videoStatus to NONE.");
  } finally {
    await db.delete(lessons).where(eq(lessons.id, lesId));
    await pool.end();
  }
}

main().catch((err) => {
  console.error("UNIT TEST FAILED:", err);
  process.exit(1);
});
