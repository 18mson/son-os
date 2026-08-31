/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Play, Pause, SkipBack, SkipForward, Disc, ExternalLink, Shuffle, Repeat } from "lucide-react";

interface QuickSettingsMediaWidgetProps {
  isLight: boolean;
  currentTrack: {
    title: string;
    artist: string;
    coverUrl?: string;
    duration?: number;
    youtubeId?: string;
  };
  mediaIsPlaying: boolean;
  mediaCurrentTime: number;
  mediaDuration: number;
  mediaIsShuffle: boolean;
  mediaIsRepeat: boolean;
  toggleMediaPlay: () => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  setMediaCurrentTime: (time: number) => void;
  toggleMediaShuffle: () => void;
  toggleMediaRepeat: () => void;
  onOpenPlayer?: () => void;
}

export const QuickSettingsMediaWidget: React.FC<QuickSettingsMediaWidgetProps> = ({
  isLight,
  currentTrack,
  mediaIsPlaying,
  mediaCurrentTime,
  mediaDuration,
  mediaIsShuffle,
  mediaIsRepeat,
  toggleMediaPlay,
  playNextTrack,
  playPrevTrack,
  setMediaCurrentTime,
  toggleMediaShuffle,
  toggleMediaRepeat,
  onOpenPlayer,
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const totalDuration = mediaDuration || currentTrack.duration || 100;

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
        isLight ? "bg-slate-100/90 border-slate-300 shadow-sm" : "bg-white/5 border-white/10 shadow-lg"
      }`}
    >
      {/* Top Row: Cover, Info & Open App Button */}
      <div className="flex items-center justify-between gap-3">
        <div
          onClick={onOpenPlayer}
          className="flex items-center gap-3 overflow-hidden cursor-pointer group flex-1 min-w-0"
          title="Klik untuk membuka Pemutar Musik"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${mediaIsPlaying ? "scale-105" : ""}`}
              />
            ) : (
              <Disc className={`text-zinc-400 ${mediaIsPlaying ? "animate-spin text-purple-400" : ""}`} size={20} />
            )}

            {/* Subtle Playing Equalizer Overlay on Cover */}
            {mediaIsPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.45s]" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className={`text-xs font-bold truncate group-hover:text-purple-500 transition-colors ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                {currentTrack.title}
              </p>
              <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
            </div>
            <p className={`text-[11px] truncate ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Shuffle & Repeat Toggles */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleMediaShuffle}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              mediaIsShuffle
                ? "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20"
                : isLight
                ? "hover:bg-slate-200 text-slate-400"
                : "hover:bg-white/10 text-zinc-500"
            }`}
            title="Shuffle"
          >
            <Shuffle size={13} />
          </button>
          <button
            type="button"
            onClick={toggleMediaRepeat}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              mediaIsRepeat
                ? "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20"
                : isLight
                ? "hover:bg-slate-200 text-slate-400"
                : "hover:bg-white/10 text-zinc-500"
            }`}
            title="Repeat"
          >
            <Repeat size={13} />
          </button>
        </div>
      </div>

      {/* Progress Bar & Timing */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={totalDuration}
          value={mediaCurrentTime || 0}
          onChange={(e) => setMediaCurrentTime(parseFloat(e.target.value))}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-600 ${
            isLight ? "bg-slate-200" : "bg-white/10"
          }`}
        />
        <div className={`flex justify-between text-[10px] font-mono ${
          isLight ? "text-slate-500" : "text-zinc-400"
        }`}>
          <span>{formatTime(mediaCurrentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3 pt-0.5">
        <button
          type="button"
          onClick={playPrevTrack}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isLight ? "hover:bg-slate-200 text-slate-700" : "hover:bg-white/10 text-zinc-300"
          }`}
          title="Lagu Sebelumnya"
        >
          <SkipBack size={16} />
        </button>
        <button
          type="button"
          onClick={toggleMediaPlay}
          className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={mediaIsPlaying ? "Jeda" : "Putar"}
        >
          {mediaIsPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={playNextTrack}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isLight ? "hover:bg-slate-200 text-slate-700" : "hover:bg-white/10 text-zinc-300"
          }`}
          title="Lagu Berikutnya"
        >
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
};
