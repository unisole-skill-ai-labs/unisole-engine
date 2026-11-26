import assert from "node:assert/strict";
import {
  HLS_FILE_WHITELIST_RE,
  StubVideoStorageProvider,
  assertValidHlsFile,
  rewriteMasterPlaylist,
  rewriteVariantPlaylist,
} from "../services/video-storage.service";
import {
  signCliVideoToken,
  signPlayVideoToken,
  verifyCliVideoToken,
  verifyPlayVideoToken,
  videoService,
} from "../services/video.service";
import { lmsService } from "../services/lms.service";
import { db } from "../db";
import { lessons } from "../db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("[TEST] 1. Path whitelist validation...");
  assert.equal(HLS_FILE_WHITELIST_RE.test("master.m3u8"), true);
  assert.equal(HLS_FILE_WHITELIST_RE.test("360p/index.m3u8"), true);
  assert.equal(HLS_FILE_WHITELIST_RE.test("480p/seg_000.ts"), true);
  assert.equal(HLS_FILE_WHITELIST_RE.test("720p/seg_999.ts"), true);

  for (const bad of [
    "../secret.txt",
    "hls/master.m3u8",
    "/master.m3u8",
    "1080p/index.m3u8",
    "360p/seg_000.mp4",
    "360p/index.m3u8?x=1",
    "360p/../480p/index.m3u8",
  ]) {
    assert.throws(() => assertValidHlsFile(bad), `Expected rejection for ${bad}`);
  }

  console.log("[TEST] 2. Playlist rewriter (master + variant)...");
  const stub = new StubVideoStorageProvider();
  const rawMaster = await stub.getPlaylistText("les_1/uuid/master.m3u8");
  const rewrittenMaster = rewriteMasterPlaylist(
    rawMaster,
    (v) => `https://api.unisole.org/api/lms/lessons/les_1/hls/${v}?token=abc`
  );
  assert.ok(rewrittenMaster.includes("#EXT-X-STREAM-INF:BANDWIDTH=800000"));
  assert.ok(rewrittenMaster.includes("https://api.unisole.org/api/lms/lessons/les_1/hls/360p/index.m3u8?token=abc"));
  assert.ok(rewrittenMaster.includes("https://api.unisole.org/api/lms/lessons/les_1/hls/720p/index.m3u8?token=abc"));

  const rawVariant = await stub.getPlaylistText("les_1/uuid/360p/index.m3u8");
  const rewrittenVariant = rewriteVariantPlaylist(
    rawVariant,
    "360p",
    (rel) => `https://unisolelmsvideo.blob.core.windows.net/hls/les_1/uuid/${rel}?sv=stub&sr=b&sp=r`
  );
  assert.ok(rewrittenVariant.includes("#EXTINF:6.000,"));
  assert.ok(rewrittenVariant.includes("https://unisolelmsvideo.blob.core.windows.net/hls/les_1/uuid/360p/seg_000.ts?sv=stub&sr=b&sp=r"));

  console.log("[TEST] 3. JWT scope & lessonId checks...");
  const cliTok = signCliVideoToken("user_admin", "ADMIN", "les_123");
  const decodedCli = verifyCliVideoToken(cliTok, "les_123");
  assert.equal(decodedCli.sub, "user_admin");
  assert.equal(decodedCli.scope, "video:upload");
  assert.throws(() => verifyCliVideoToken(cliTok, "les_other"), /mismatch/i);
  assert.throws(() => verifyPlayVideoToken(cliTok, "les_123"), /mismatch/i);

  const playTok = signPlayVideoToken("user_student", "les_123", 3600);
  const decodedPlay = verifyPlayVideoToken(playTok, "les_123");
  assert.equal(decodedPlay.scope, "video:play");
  assert.throws(() => verifyPlayVideoToken(playTok, "les_other"), /mismatch/i);
  assert.throws(() => verifyCliVideoToken(playTok, "les_123"), /mismatch/i);

  console.log("[TEST] 4. Enrollment gating & server-controlled video fields...");
  const origGetLessonContent = lmsService.getLessonContent;
  const origSelect = db.select;
  try {
    // Non-enrolled student -> ForbiddenError propagated
    (lmsService as any).getLessonContent = async () => {
      throw new Error("You do not have access to this lesson.");
    };
    await assert.rejects(
      () => videoService.getVideoAccess("stu_1", "les_123", false, "http://localhost:3000"),
      /do not have access/
    );

    // Enrolled student when lesson is YOUTUBE / NONE -> NotFoundError
    (lmsService as any).getLessonContent = async () => ({
      id: "les_123",
      videoProvider: "YOUTUBE",
      videoStatus: "NONE",
      videoHlsPath: null,
    });
    await assert.rejects(
      () => videoService.getVideoAccess("stu_1", "les_123", false, "http://localhost:3000"),
      /not available/
    );

    // Enrolled student when AZURE_HLS + READY -> manifestUrl returned
    (lmsService as any).getLessonContent = async () => ({
      id: "les_123",
      videoProvider: "AZURE_HLS",
      videoStatus: "READY",
      videoHlsPath: "les_123/11111111-1111-4111-8111-111111111111/master.m3u8",
    });
    const access = await videoService.getVideoAccess(
      "stu_1",
      "les_123",
      false,
      "http://localhost:3000"
    );
    assert.ok(access.manifestUrl && access.manifestUrl.startsWith("http://localhost:3000/api/lms/lessons/les_123/hls/master.m3u8?token="));
    assert.equal(access.storageMode, "stub");
  } finally {
    (lmsService as any).getLessonContent = origGetLessonContent;
    (db as any).select = origSelect;
  }

  console.log("✅ All video HLS unit tests passed!");
}

run().catch((err) => {
  console.error("❌ Video HLS tests failed:", err);
  process.exit(1);
});
