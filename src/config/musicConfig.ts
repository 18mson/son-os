export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  youtubeId?: string;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const PLAYLIST: Track[] = [
  {
    id: "yt-zelda-lofi",
    title: "Zelda & Chill Lofi",
    artist: "Mikel & GameChops",
    album: "Zelda & Chill",
    duration: 300,
    coverUrl: "https://img.youtube.com/vi/g3jCAyPai2Y/hqdefault.jpg",
    audioUrl: "",
    youtubeId: "g3jCAyPai2Y",
  },
  {
    id: "yt-track-1",
    title: "Lofi Girl - 24/7 Relaxing Beats",
    artist: "Lofi Girl",
    album: "YouTube Live Stream",
    duration: 300,
    coverUrl: "https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg",
    audioUrl: "",
    youtubeId: "5qap5aO4i9A",
  },
  {
    id: "yt-synthwave",
    title: "Synthwave Retro Beats",
    artist: "ChillSynth Radio",
    album: "YouTube Live Stream",
    duration: 300,
    coverUrl: "https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg",
    audioUrl: "",
    youtubeId: "4xDzrJKXOOY",
  },
  {
    id: "track-1",
    title: "Lofi Study Beats",
    artist: "Ambient Chill Co.",
    album: "Midnight Sessions",
    duration: 165,
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  },
  {
    id: "track-3",
    title: "Soft Rain & Piano",
    artist: "Calm Mind Studio",
    album: "Peaceful Sleep",
    duration: 195,
    coverUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=300&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxing-mountains-rivers-14132.mp3",
  },
];
