import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { ValidationError } from "../errors";

export const HLS_FILE_WHITELIST_RE =
  /^(master\.m3u8|(360p|480p|720p|1080p)\/(index\.m3u8|seg_\d+\.ts))$/;

export const MAX_HLS_UPLOAD_FILES = 5000;

export function assertValidHlsFile(filePath: string): void {
  if (!filePath || typeof filePath !== "string" || !HLS_FILE_WHITELIST_RE.test(filePath)) {
    throw new ValidationError(`Invalid HLS file path: ${filePath}`);
  }
}

export function rewriteMasterPlaylist(
  content: string,
  buildVariantUrl: (variantPath: string) => string
): string {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim().replace(/\\/g, "/");
      if (!trimmed || trimmed.startsWith("#")) return line;
      assertValidHlsFile(trimmed);
      if (!trimmed.endsWith("/index.m3u8")) {
        throw new ValidationError(`Unexpected variant playlist reference: ${trimmed}`);
      }
      return buildVariantUrl(trimmed);
    })
    .join("\n");
}

export function rewriteVariantPlaylist(
  content: string,
  variantDir: "360p" | "480p" | "720p" | "1080p",
  buildSegmentUrl: (relativePath: string) => string
): string {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim().replace(/\\/g, "/");
      if (!trimmed || trimmed.startsWith("#")) return line;
      const relativePath = `${variantDir}/${trimmed}`;
      assertValidHlsFile(relativePath);
      if (!trimmed.endsWith(".ts")) {
        throw new ValidationError(`Unexpected segment reference: ${trimmed}`);
      }
      return buildSegmentUrl(relativePath);
    })
    .join("\n");
}

export interface VideoSetupDiagnostics {
  connectivity: { ok: boolean; message: string };
  corsCheck: { ok: boolean; message: string; rules?: any[] };
}

export interface VideoStorageProvider {
  readonly mode: "stub" | "azure";
  generateWriteSasUrls(
    prefix: string,
    files: string[],
    ttlSeconds: number
  ): Promise<Record<string, string>>;
  generateSingleWriteSasUrl(blobPath: string, ttlSeconds: number): Promise<string>;
  verifyBlobExists(blobPath: string): Promise<{ exists: boolean; sizeBytes: number }>;
  listBlobsWithSizes?(prefix: string): Promise<Map<string, number>>;
  getPlaylistText(blobPath: string): Promise<string>;
  generateReadSasUrl(blobPath: string, ttlSeconds: number): Promise<string>;
  deletePrefix(prefix: string): Promise<number>;
  listBlobPrefixes(): Promise<string[]>;
  runSetupDiagnostics(
    probeConnectivity: boolean,
    expectedOrigins: string[]
  ): Promise<VideoSetupDiagnostics>;
}

const STUB_MASTER_PLAYLIST = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480
480p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720
720p/index.m3u8
`;

const STUB_VARIANT_PLAYLIST = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:6.000,
seg_000.ts
#EXTINF:6.000,
seg_001.ts
#EXT-X-ENDLIST
`;

export class StubVideoStorageProvider implements VideoStorageProvider {
  readonly mode = "stub" as const;

  async generateWriteSasUrls(
    prefix: string,
    files: string[],
    ttlSeconds: number
  ): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    for (const file of files) {
      assertValidHlsFile(file);
      out[file] =
        `https://stub-azure.local/hls/${prefix}/${file}?sv=stub&sr=b&sp=cw&ttl=${ttlSeconds}`;
    }
    return out;
  }

  async generateSingleWriteSasUrl(blobPath: string, ttlSeconds: number): Promise<string> {
    return `https://stub-azure.local/hls/${blobPath}?sv=stub&sr=b&sp=cw&ttl=${ttlSeconds}`;
  }

  async verifyBlobExists(_blobPath: string): Promise<{ exists: boolean; sizeBytes: number }> {
    return { exists: true, sizeBytes: 1024 };
  }

  async getPlaylistText(blobPath: string): Promise<string> {
    if (blobPath.endsWith("/master.m3u8")) {
      return STUB_MASTER_PLAYLIST;
    }
    if (blobPath.endsWith("/index.m3u8")) {
      return STUB_VARIANT_PLAYLIST;
    }
    throw new ValidationError(`Unknown stub playlist path: ${blobPath}`);
  }

  async generateReadSasUrl(blobPath: string, ttlSeconds: number): Promise<string> {
    return `https://stub-azure.local/hls/${blobPath}?sv=stub&sr=b&sp=r&ttl=${ttlSeconds}`;
  }

  async deletePrefix(_prefix: string): Promise<number> {
    return 0;
  }

  async listBlobPrefixes(): Promise<string[]> {
    return [];
  }

  async runSetupDiagnostics(
    _probeConnectivity: boolean,
    _expectedOrigins: string[]
  ): Promise<VideoSetupDiagnostics> {
    return {
      connectivity: {
        ok: false,
        message: "Running in stub mode (VIDEO_STORAGE_MODE=stub). Configure Azure credentials to test live blob storage.",
      },
      corsCheck: {
        ok: false,
        message: "CORS check skipped in stub mode.",
      },
    };
  }
}

export class AzureVideoStorageProvider implements VideoStorageProvider {
  readonly mode = "azure" as const;
  private readonly accountName: string;
  private readonly containerName: string;
  private readonly endpointBase: string;
  private readonly credential: StorageSharedKeyCredential;
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT || "";
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
    this.containerName = process.env.AZURE_HLS_CONTAINER || "hls";
    this.endpointBase =
      (process.env.AZURE_STORAGE_ENDPOINT || "").replace(/\/+$/, "") ||
      `https://${this.accountName}.blob.core.windows.net`;

    if (!this.accountName || !accountKey) {
      throw new Error(
        "AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCOUNT_KEY are required when VIDEO_STORAGE_MODE=azure"
      );
    }

    this.credential = new StorageSharedKeyCredential(this.accountName, accountKey);
    this.blobServiceClient = new BlobServiceClient(this.endpointBase, this.credential);
  }

  private signSas(blobName: string, perm: string, ttlSeconds: number): string {
    const startsOn = new Date(Date.now() - 60 * 1000);
    const expiresOn = new Date(Date.now() + ttlSeconds * 1000);
    const protocol = this.endpointBase.startsWith("http://")
      ? SASProtocol.HttpsAndHttp
      : SASProtocol.Https;
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse(perm),
        startsOn,
        expiresOn,
        protocol,
      },
      this.credential
    ).toString();
    return `${this.endpointBase}/${this.containerName}/${blobName}?${sasToken}`;
  }

  async generateWriteSasUrls(
    prefix: string,
    files: string[],
    ttlSeconds: number
  ): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    for (const file of files) {
      assertValidHlsFile(file);
      out[file] = this.signSas(`${prefix}/${file}`, "cw", ttlSeconds);
    }
    return out;
  }

  async generateSingleWriteSasUrl(blobPath: string, ttlSeconds: number): Promise<string> {
    return this.signSas(blobPath, "cw", ttlSeconds);
  }

  async verifyBlobExists(blobPath: string): Promise<{ exists: boolean; sizeBytes: number }> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(blobPath);
    try {
      const props = await blobClient.getProperties();
      return { exists: true, sizeBytes: Number(props.contentLength || 0) };
    } catch {
      return { exists: false, sizeBytes: 0 };
    }
  }

  async listBlobsWithSizes(prefix: string): Promise<Map<string, number>> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const normalized = prefix.endsWith("/") ? prefix : `${prefix}/`;
    const result = new Map<string, number>();
    for await (const item of containerClient.listBlobsFlat({ prefix: normalized })) {
      result.set(item.name, Number(item.properties?.contentLength || 0));
    }
    return result;
  }

  async getPlaylistText(blobPath: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(blobPath);
    const buffer = await blobClient.downloadToBuffer();
    return buffer.toString("utf-8");
  }

  async generateReadSasUrl(blobPath: string, ttlSeconds: number): Promise<string> {
    return this.signSas(blobPath, "r", ttlSeconds);
  }

  async deletePrefix(prefix: string): Promise<number> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const normalized = prefix.endsWith("/") ? prefix : `${prefix}/`;
    let deleted = 0;
    for await (const item of containerClient.listBlobsFlat({ prefix: normalized })) {
      await containerClient.deleteBlob(item.name, { deleteSnapshots: "include" });
      deleted++;
    }
    return deleted;
  }

  async listBlobPrefixes(): Promise<string[]> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const prefixes = new Set<string>();
    for await (const item of containerClient.listBlobsFlat()) {
      const parts = item.name.split("/");
      if (parts.length >= 2 && parts[0] !== "__healthcheck") {
        prefixes.add(`${parts[0]}/${parts[1]}`);
      }
    }
    return Array.from(prefixes).sort();
  }

  async runSetupDiagnostics(
    probeConnectivity: boolean,
    expectedOrigins: string[]
  ): Promise<VideoSetupDiagnostics> {
    let connectivity = { ok: true, message: "Azure storage client initialized (probe not run)." };
    if (probeConnectivity) {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const testBlobName = `__healthcheck/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.txt`;
      const blockClient = containerClient.getBlockBlobClient(testBlobName);
      try {
        const payload = Buffer.from("unisole-healthcheck", "utf-8");
        await blockClient.uploadData(payload);
        const downloaded = await blockClient.downloadToBuffer();
        await blockClient.deleteIfExists();
        connectivity = {
          ok: downloaded.toString("utf-8") === "unisole-healthcheck",
          message: `Write, read, and delete probe succeeded in container "${this.containerName}".`,
        };
      } catch (err: any) {
        connectivity = {
          ok: false,
          message: `Connectivity probe failed: ${err?.message || "Unknown Azure error"}`,
        };
      }
    }

    let corsCheck: VideoSetupDiagnostics["corsCheck"] = {
      ok: false,
      message: "Could not inspect Azure Blob CORS properties.",
    };
    try {
      const props = await this.blobServiceClient.getProperties();
      const rules = props.cors || [];
      const hasRequiredRule = rules.some((rule) => {
        const methods = (rule.allowedMethods || "").toUpperCase().split(",").map((m) => m.trim());
        const origins = (rule.allowedOrigins || "").split(",").map((o) => o.trim());
        const methodsOk = ["GET", "PUT", "HEAD"].every((m) => methods.includes(m));
        const originsOk =
          origins.includes("*") ||
          expectedOrigins.length === 0 ||
          expectedOrigins.every((o) => origins.includes(o));
        return methodsOk && originsOk;
      });
      corsCheck = {
        ok: hasRequiredRule,
        message: hasRequiredRule
          ? "CORS rules include GET, PUT, HEAD for expected origins."
          : "CORS rules missing required GET, PUT, HEAD or LMS origin.",
        rules,
      };
    } catch (err: any) {
      corsCheck = {
        ok: false,
        message: `Failed to read CORS properties: ${err?.message || "Unknown error"}`,
      };
    }

    return { connectivity, corsCheck };
  }
}

let cachedProvider: VideoStorageProvider | null = null;
let cachedKey = "";

export function getVideoStorageProvider(): VideoStorageProvider {
  const mode = (process.env.VIDEO_STORAGE_MODE || "stub").toLowerCase();
  const key = `${mode}|${process.env.AZURE_STORAGE_ACCOUNT || ""}|${process.env.AZURE_HLS_CONTAINER || ""}|${process.env.AZURE_STORAGE_ENDPOINT || ""}`;
  if (cachedProvider && cachedKey === key) return cachedProvider;
  cachedKey = key;
  cachedProvider =
    mode === "azure" ? new AzureVideoStorageProvider() : new StubVideoStorageProvider();
  return cachedProvider;
}
