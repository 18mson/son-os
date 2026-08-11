export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
}

export const PLAYLIST: Track[] = [
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
    id: "track-2",
    title: "Cyberpunk City Lights",
    artist: "Synthwave Dreams",
    album: "Neon Horizon 2088",
    duration: 180,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3",
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
