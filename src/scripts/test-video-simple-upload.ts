import assert from "assert";
import { db } from "../db";
import { lmsService } from "../services/lms.service";
import { videoService } from "../services/video.service";
import { ServiceUnavailableError, ValidationError } from "../errors";

async function run() {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevStorageMode = process.env.VIDEO_STORAGE_MODE;
  const prevUploadMode = process.env.VIDEO_UPLOAD_MODE;
  const prevMaxMb = process.env.VIDEO_MAX_SIZE_MB;

  try {
    // 1. Dormant by default: VIDEO_UPLOAD_MODE defaults to "hls"
    delete process.env.VIDEO_UPLOAD_MODE;
    process.env.NODE_ENV = "test";
    process.env.VIDEO_STORAGE_MODE = "stub";

    await assert.rejects(
      () =>
        videoService.initSimpleUpload("les_123", {
          fileName: "demo.mp4",
          contentType: "video/mp4",
          sizeBytes: 1024,
        }),
      (err: any) => err instanceof ValidationError && /disabled/i.test(err.message)
    );

    // 2. Production guard: NODE_ENV=production without Azure returns 503 and never marks READY
    process.env.NODE_ENV = "production";
    process.env.VIDEO_STORAGE_MODE = "stub";
    process.env.VIDEO_UPLOAD_MODE = "simple";

    await assert.rejects(
      () => videoService.getStatus("les_123"),
      (err: any) => err instanceof ServiceUnavailableError && err.status === 503
    );
    await assert.rejects(
      () =>
        videoService.initSimpleUpload("les_123", {
          fileName: "demo.mp4",
          contentType: "video/mp4",
          sizeBytes: 1024,
        }),
      (err: any) => err instanceof ServiceUnavailableError && err.status === 503
    );
    await assert.rejects(
      () =>
        videoService.completeSimpleUpload(
          "les_123",
          "les_123/11111111-1111-4111-8111-111111111111/video.mp4"
        ),
      (err: any) => err instanceof ServiceUnavailableError && err.status === 503
    );
    await assert.rejects(
      () =>
        videoService.completeUpload(
          "les_123",
          "les_123/11111111-1111-4111-8111-111111111111/master.m3u8"
        ),
      (err: any) => err instanceof ServiceUnavailableError && err.status === 503
    );
    await assert.rejects(
      () => videoService.getVideoAccess("stu_1", "les_123", false, "http://localhost:3000"),
      (err: any) => err instanceof ServiceUnavailableError && err.status === 503
    );

    // 3. Setup check never leaks secret values
    process.env.AZURE_STORAGE_ACCOUNT_KEY = "super-secret-do-not-leak";
    const setup = await videoService.getSetupCheck(false, ["http://localhost:5174"]);
    const setupJson = JSON.stringify(setup);
    assert.ok(!setupJson.includes("super-secret-do-not-leak"), "Setup check must never leak secrets");
    assert.equal(setup.envPresent.AZURE_STORAGE_ACCOUNT_KEY, true);
    delete process.env.AZURE_STORAGE_ACCOUNT_KEY;

    // 4. Simple MP4 validation in stub mode (non-production)
    process.env.NODE_ENV = "test";
    process.env.VIDEO_STORAGE_MODE = "stub";
    process.env.VIDEO_UPLOAD_MODE = "both";
    process.env.VIDEO_MAX_SIZE_MB = "1";

    await assert.rejects(
      () =>
        videoService.initSimpleUpload("les_123", {
          fileName: "demo.mov",
          contentType: "video/mp4",
          sizeBytes: 1024,
        }),
      (err: any) => err instanceof ValidationError && /\.mp4/i.test(err.message)
    );
    await assert.rejects(
      () =>
        videoService.initSimpleUpload("les_123", {
          fileName: "demo.mp4",
          contentType: "video/quicktime",
          sizeBytes: 1024,
        }),
      (err: any) => err instanceof ValidationError && /video\/mp4/i.test(err.message)
    );
    await assert.rejects(
      () =>
        videoService.initSimpleUpload("les_123", {
          fileName: "demo.mp4",
          contentType: "video/mp4",
          sizeBytes: 2 * 1024 * 1024,
        }),
      (err: any) => err instanceof ValidationError && /1 MB/i.test(err.message)
    );

    // 5. Simple MP4 init -> complete -> playback access (stubbed DB)
    const origSelect = db.select;
    const origUpdate = db.update;
    const origGetLessonContent = lmsService.getLessonContent;
    let savedUpdate: any = null;

    (db as any).select = () => ({
      from: () => ({
        where: () => {
          const arr: any = [{ id: "les_123", videoStatus: "NONE", videoUpdatedAt: null, videoHlsPath: null }];
          arr.limit = async () => arr;
          return arr;
        },
      }),
    });
    (db as any).update = () => ({
      set: (data: any) => ({
        where: async () => {
          savedUpdate = data;
          return [];
        },
      }),
    });

    try {
      const initRes = await videoService.initSimpleUpload("les_123", {
        fileName: "lesson1.mp4",
        contentType: "video/mp4",
        sizeBytes: 1024,
      });
      assert.ok(initRes.uploadUrl.includes("stub-azure.local"));
      assert.ok(initRes.blobPath.startsWith("les_123/"));
      assert.ok(initRes.blobPath.endsWith("/video.mp4"));
      assert.equal(savedUpdate?.videoStatus, "UPLOADING");

      const completeRes = await videoService.completeSimpleUpload("les_123", initRes.blobPath, 12);
      assert.equal(completeRes.status, "READY");
      assert.equal(completeRes.videoProvider, "AZURE_MP4");
      assert.equal(savedUpdate?.videoStatus, "READY");
      assert.equal(savedUpdate?.videoProvider, "AZURE_MP4");
      assert.equal(savedUpdate?.durationMinutes, 12);

      (lmsService as any).getLessonContent = async () => ({
        id: "les_123",
        videoProvider: "AZURE_MP4",
        videoStatus: "READY",
        videoHlsPath: initRes.blobPath,
      });

      const accessRes = await videoService.getVideoAccess(
        "stu_1",
        "les_123",
        false,
        "http://localhost:3000"
      );
      assert.equal(accessRes.provider, "AZURE_MP4");
      assert.ok(accessRes.videoUrl && accessRes.videoUrl.includes(initRes.blobPath));

      // 6. Orphaned blob dry-run and cleanup
      const mockStorage: any = {
        mode: "azure",
        listBlobPrefixes: async () => ["les_123/aaa", "les_orphan/bbb"],
        deletePrefix: async () => 3,
      };
      (db as any).select = () => ({
        from: () => ({
          where: async () => [{ videoHlsPath: "les_123/aaa/video.mp4" }],
        }),
      });
      const dryRes = await videoService.listOrphanedVideoBlobs(true, mockStorage);
      assert.deepEqual(dryRes.orphans, ["les_orphan/bbb"]);
      assert.equal(dryRes.deletedCount, 0);

      const cleanRes = await videoService.listOrphanedVideoBlobs(false, mockStorage);
      assert.equal(cleanRes.deletedCount, 3);
    } finally {
      (db as any).select = origSelect;
      (db as any).update = origUpdate;
      (lmsService as any).getLessonContent = origGetLessonContent;
    }

    console.log("✅ All simple video upload, production guard, and orphan cleanup tests passed!");
  } finally {
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
    if (prevStorageMode === undefined) delete process.env.VIDEO_STORAGE_MODE;
    else process.env.VIDEO_STORAGE_MODE = prevStorageMode;
    if (prevUploadMode === undefined) delete process.env.VIDEO_UPLOAD_MODE;
    else process.env.VIDEO_UPLOAD_MODE = prevUploadMode;
    if (prevMaxMb === undefined) delete process.env.VIDEO_MAX_SIZE_MB;
    else process.env.VIDEO_MAX_SIZE_MB = prevMaxMb;
  }
}

run().catch((err) => {
  console.error("❌ Simple video upload tests failed:", err);
  process.exit(1);
});
