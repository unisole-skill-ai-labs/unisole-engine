import "dotenv/config";
import { isNotNull, eq } from "drizzle-orm";
import { db, pool } from "../db";
import { users } from "../db/schema";
import { getFileStorageProvider } from "../services/file-storage.service";

const REQUIRED_DRIVE_VARS = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "GDRIVE_ROOT_FOLDER_ID",
] as const;

async function main() {
  const userIdArg = process.argv.find((a) => a.startsWith("--user="))?.split("=")[1];

  console.log("=== Google Drive Storage Diagnostic (Read-Only) ===");
  for (const name of REQUIRED_DRIVE_VARS) {
    console.log(`ENV ${name}: ${process.env[name] ? "SET" : "UNSET"}`);
  }

  const missing = REQUIRED_DRIVE_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.log(`STATUS: INCOMPLETE (${missing.join(", ")} unset)`);
    await pool.end();
    process.exit(1);
  }

  try {
    const provider = getFileStorageProvider();
    console.log(`PROVIDER_MODE: ${provider.mode}`);

    const rootOk = await provider.verifyFolderExists(process.env.GDRIVE_ROOT_FOLDER_ID!);
    console.log(`ROOT_FOLDER_STATUS: ${rootOk ? "OK" : "MISSING_OR_TRASHED"}`);

    const userRows = userIdArg
      ? await db
          .select({ id: users.id, driveFolderId: users.driveFolderId })
          .from(users)
          .where(eq(users.id, userIdArg))
          .limit(1)
      : await db
          .select({ id: users.id, driveFolderId: users.driveFolderId })
          .from(users)
          .where(isNotNull(users.driveFolderId))
          .limit(3);

    if (userRows.length === 0) {
      console.log("USER_DRIVE_FOLDER: NONE_FOUND_IN_DB");
    } else {
      for (const row of userRows) {
        if (!row.driveFolderId) {
          console.log(`USER ${row.id}: drive_folder_id=NULL`);
          continue;
        }
        const ok = await provider.verifyFolderExists(row.driveFolderId);
        console.log(`USER ${row.id}: drive_folder_id=${row.driveFolderId} status=${ok ? "OK" : "MISSING_OR_TRASHED"}`);
      }
    }
  } catch (err: any) {
    const errClass = err?.constructor?.name || "Error";
    const errCode = err?.code || err?.statusCode || "UNKNOWN";
    console.error(`DIAGNOSE_ERROR: class=${errClass} code=${errCode} message=${err?.message || "unknown"}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
