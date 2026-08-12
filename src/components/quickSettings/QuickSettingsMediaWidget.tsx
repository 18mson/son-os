/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Play, Pause, SkipBack, SkipForward, Disc } from "lucide-react";

interface QuickSettingsMediaWidgetProps {
  isLight: boolean;
  currentTrack: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
  mediaIsPlaying: boolean;
  toggleMediaPlay: () => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
}

export const QuickSettingsMediaWidget: React.FC<QuickSettingsMediaWidgetProps> = ({
  isLight,
  currentTrack,
  mediaIsPlaying,
  toggleMediaPlay,
  playNextTrack,
  playPrevTrack,
}) => {
  return (
    <div
      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
        isLight ? "bg-slate-100/90 border-slate-300" : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md bg-zinc-800 flex items-center justify-center">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Disc className="text-zinc-400 animate-spin" size={20} />
          )}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
            {currentTrack.title}
          </p>
          <p className={`text-[11px] truncate ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            {currentTrack.artist}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={playPrevTrack}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLight ? "hover:bg-slate-200 text-slate-700" : "hover:bg-white/10 text-zinc-300"
          }`}
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={toggleMediaPlay}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
        >
          {mediaIsPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <button
          onClick={playNextTrack}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLight ? "hover:bg-slate-200 text-slate-700" : "hover:bg-white/10 text-zinc-300"
          }`}
        >
          <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
};
