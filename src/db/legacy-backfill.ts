/**
 * Shared SQL predicates for the optional one-time legacy lesson type backfill.
 * Used identically by:
 *   - unisole-engine/src/db/init.ts (only when RUN_LEGACY_TYPE_BACKFILL=true)
 *   - unisole-engine/src/scripts/backfill-dry-run.ts (read-only dry run)
 *
 * Safety rules:
 *   1. Never touch rows that already store structured JSON content ("content" LIKE '{%').
 *   2. Match ONLY known seeded slug prefixes ('quiz-%' or 'task-%') — never match by title.
 *   3. Never touch rows that have a video set (video_url empty, video_hls_path empty,
 *      video_status NONE/empty, and video_provider NONE/empty/default 'YOUTUBE').
 */
export const LEGACY_NO_VIDEO_WHERE = `
  ("video_url" IS NULL OR btrim("video_url") = '')
  AND ("video_hls_path" IS NULL OR btrim("video_hls_path") = '')
  AND ("video_status" IS NULL OR "video_status" IN ('NONE', ''))
  AND ("video_provider" IS NULL OR "video_provider" IN ('NONE', '', 'YOUTUBE'))
`;

export const LEGACY_QUIZ_WHERE = `
  ("content" IS NULL OR "content" NOT LIKE '{%')
  AND "slug" LIKE 'quiz-%'
  AND (${LEGACY_NO_VIDEO_WHERE})
`;

export const LEGACY_ASSIGNMENT_WHERE = `
  ("content" IS NULL OR "content" NOT LIKE '{%')
  AND "slug" LIKE 'task-%'
  AND (${LEGACY_NO_VIDEO_WHERE})
`;

export const LEGACY_BACKFILL_UPDATE_SQL = `
  UPDATE "lessons"
  SET "content" = json_build_object(
    'type',
    CASE
      WHEN (${LEGACY_QUIZ_WHERE}) THEN 'QUIZ'
      WHEN (${LEGACY_ASSIGNMENT_WHERE}) THEN 'ASSIGNMENT'
    END,
    'description', COALESCE("description", ''),
    'contentMarkdown', COALESCE("content", '')
  )::text
  WHERE (${LEGACY_QUIZ_WHERE}) OR (${LEGACY_ASSIGNMENT_WHERE});
`;
