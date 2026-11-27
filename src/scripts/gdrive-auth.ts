import http from "http";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const PORT = 3333;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = "https://www.googleapis.com/auth/drive.file";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in environment."
  );
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

console.log("\n=== Google Drive OAuth2 One-Time Setup ===");
console.log("1. Open this URL in your browser and sign in with your Google account:\n");
console.log(authUrl.toString());
console.log(`\n2. Waiting for callback on ${REDIRECT_URI} ...\n`);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);
    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const error = url.searchParams.get("error");
    if (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(`OAuth error: ${error}`);
      console.error("OAuth error:", error);
      server.close();
      process.exit(1);
    }

    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing authorization code.");
      return;
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokenData.refresh_token || !tokenData.access_token) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Failed to obtain refresh token. Check terminal output.");
      console.error(
        "Failed to exchange code:",
        tokenData.error || tokenRes.status,
        tokenData.error_description || ""
      );
      server.close();
      process.exit(1);
    }

    // Create or reuse the "Unisole-LMS" root folder using the drive.file scope
    let rootFolderId = "";
    const q = "name = 'Unisole-LMS' and 'root' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    if (listRes.ok) {
      const listData = (await listRes.json()) as { files?: Array<{ id: string }> };
      if (listData.files && listData.files.length > 0) {
        rootFolderId = listData.files[0].id;
      }
    }
    if (!rootFolderId) {
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Unisole-LMS",
          mimeType: "application/vnd.google-apps.folder",
        }),
      });
      if (!createRes.ok) {
        throw new Error(`Failed to create Unisole-LMS root folder (HTTP ${createRes.status})`);
      }
      const created = (await createRes.json()) as { id: string };
      rootFolderId = created.id;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h2>Success!</h2><p>Refresh token and root folder ID printed in your terminal. You may close this tab.</p>");

    console.log("\n=== SUCCESS ===");
    console.log("Add these to your .env (do NOT commit them):\n");
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokenData.refresh_token}`);
    console.log(`GDRIVE_ROOT_FOLDER_ID=${rootFolderId}\n`);
    server.close();
    process.exit(0);
  } catch (err: any) {
    console.error("Unexpected error:", err?.message || err);
    res.writeHead(500);
    res.end("Internal error");
    server.close();
    process.exit(1);
  }
});

server.listen(PORT);
