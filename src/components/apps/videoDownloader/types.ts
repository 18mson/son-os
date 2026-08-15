// src/components/apps/videoDownloader/types.ts

export interface VideoStreamOption {
  quality: string;
  label: string;
  ext: "mp4" | "webm" | "mp3" | "m4a" | "image";
  url: string;
  proxyUrl?: string;
  isAudioOnly?: boolean;
  sizeEstimate?: string;
  sizeBytes?: number;
}

export interface VideoStreamInfo {
  url: string;
  proxyUrl: string;
  title: string;
  filename: string;
  mimeType: string;
  sizeBytes?: number;
  quality?: string;
  thumbnailUrl?: string;
  domain: string;
  isDirectStream: boolean;
  isYouTube?: boolean;
  youtubeId?: string;
  author?: string;
  durationSeconds?: number;
  streamOptions?: VideoStreamOption[];
}

export interface VideoInspectResponse {
  success: boolean;
  data?: VideoStreamInfo;
  streams?: VideoStreamInfo[];
  error?: string;
  details?: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  url: string;
  filename: string;
  format: string;
  sizeBytes?: number;
  downloadedAt: number;
  thumbnailUrl?: string;
  blobUrl?: string;
  status: "completed" | "downloading" | "failed";
  progress?: number;
}
