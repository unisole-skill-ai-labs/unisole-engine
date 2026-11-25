import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { ValidationError } from "../errors";

export const HLS_FILE_WHITELIST_RE =
  /^(master\.m3u8|(360p|480p|720p)\/(index\.m3u8|seg_\d+\.ts))$/;

export const MAX_HLS_UPLOAD_FILES = 2000;

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
      const trimmed = line.trim();
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
  variantDir: "360p" | "480p" | "720p",
  buildSegmentUrl: (relativePath: string) => string
): string {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
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

export interface VideoStorageProvider {
  readonly mode: "stub" | "azure";
  generateWriteSasUrls(
    prefix: string,
    files: string[],
    ttlSeconds: number
  ): Promise<Record<string, string>>;
  getPlaylistText(blobPath: string): Promise<string>;
  generateReadSasUrl(blobPath: string, ttlSeconds: number): Promise<string>;
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
}

export class AzureVideoStorageProvider implements VideoStorageProvider {
  readonly mode = "azure" as const;
  private readonly accountName: string;
  private readonly containerName: string;
  private readonly credential: StorageSharedKeyCredential;
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT || "";
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
    this.containerName = process.env.AZURE_HLS_CONTAINER || "hls";

    if (!this.accountName || !accountKey) {
      throw new Error(
        "AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCOUNT_KEY are required when VIDEO_STORAGE_MODE=azure"
      );
    }

    this.credential = new StorageSharedKeyCredential(this.accountName, accountKey);
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      this.credential
    );
  }

  async generateWriteSasUrls(
    prefix: string,
    files: string[],
    ttlSeconds: number
  ): Promise<Record<string, string>> {
    const startsOn = new Date(Date.now() - 60 * 1000);
    const expiresOn = new Date(Date.now() + ttlSeconds * 1000);
    const permissions = BlobSASPermissions.parse("cw");
    const out: Record<string, string> = {};

    for (const file of files) {
      assertValidHlsFile(file);
      const blobName = `${prefix}/${file}`;
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName,
          permissions,
          startsOn,
          expiresOn,
          protocol: SASProtocol.Https,
        },
        this.credential
      ).toString();
      out[file] =
        `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;
    }

    return out;
  }

  async getPlaylistText(blobPath: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(blobPath);
    const buffer = await blobClient.downloadToBuffer();
    return buffer.toString("utf-8");
  }

  async generateReadSasUrl(blobPath: string, ttlSeconds: number): Promise<string> {
    const startsOn = new Date(Date.now() - 60 * 1000);
    const expiresOn = new Date(Date.now() + ttlSeconds * 1000);
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      this.credential
    ).toString();

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobPath}?${sasToken}`;
  }
}

let cachedProvider: VideoStorageProvider | null = null;

export function getVideoStorageProvider(): VideoStorageProvider {
  if (cachedProvider) return cachedProvider;
  const mode = (process.env.VIDEO_STORAGE_MODE || "stub").toLowerCase();
  cachedProvider =
    mode === "azure" ? new AzureVideoStorageProvider() : new StubVideoStorageProvider();
  return cachedProvider;
}
