// src/components/apps/videoDownloader/presetSamples.ts

export interface PresetSample {
  id: string;
  name: string;
  category: "demo" | "nature" | "short" | "animation";
  url: string;
  format: string;
  resolution: string;
  approxSize: string;
  description: string;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: "yt-joseph-vincent",
    name: "YouTube: As Long as You Love Me",
    category: "demo",
    url: "https://www.youtube.com/watch?v=vgnkhvCac88",
    format: "YouTube",
    resolution: "720p HD",
    approxSize: "~35 MB",
    description: "Joseph Vincent - As Long as You Love Me (Backstreet Boys Cover)",
  },
  {
    id: "bbb-1080p",
    name: "Big Buck Bunny (1080p MP4)",
    category: "animation",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    format: "MP4",
    resolution: "1080p FHD",
    approxSize: "158 MB",
    description: "High quality open-source 3D animated film benchmark video",
  },
  {
    id: "elephants-dream",
    name: "Elephants Dream (720p MP4)",
    category: "animation",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    format: "MP4",
    resolution: "720p HD",
    approxSize: "140 MB",
    description: "Open-source Sci-Fi animated short film by Blender Foundation",
  },
  {
    id: "for-bigger-blazes",
    name: "For Bigger Blazes (Trailer MP4)",
    category: "short",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    format: "MP4",
    resolution: "720p HD",
    approxSize: "15 MB",
    description: "Chromecast sample promotional clip (fast download test)",
  },
  {
    id: "tears-of-steel",
    name: "Tears of Steel (Sci-Fi 1080p)",
    category: "demo",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    format: "MP4",
    resolution: "1080p FHD",
    approxSize: "168 MB",
    description: "VFX live action dystopian sci-fi short film",
  },
  {
    id: "we-are-going-on-bullrun",
    name: "Nature & Travel Drone (MP4)",
    category: "nature",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    format: "MP4",
    resolution: "720p HD",
    approxSize: "22 MB",
    description: "Scenic road trip clip with landscape panning",
  },
  {
    id: "sintel-trailer",
    name: "Sintel Dragon Fantasy (720p)",
    category: "animation",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    format: "MP4",
    resolution: "720p HD",
    approxSize: "40 MB",
    description: "Fantasy adventure animation teaser by Blender Studio",
  },
];
