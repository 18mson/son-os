/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Music, Disc } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { PLAYLIST } from "@/config/musicConfig";

export const MusicPlayerApp: React.FC = () => {
  const {
    mediaTrackIndex,
    mediaIsPlaying,
    mediaCurrentTime,
    mediaDuration,
    mediaVolume,
    mediaIsMuted,
    mediaIsShuffle,
    mediaIsRepeat,
    toggleMediaPlay,
    playNextTrack,
    playPrevTrack,
    setMediaCurrentTime,
    setMediaVolume,
    toggleMediaMute,
    toggleMediaShuffle,
    toggleMediaRepeat,
  } = useWindowStore();

  const track = PLAYLIST[mediaTrackIndex] || PLAYLIST[0];

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setMediaCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-xl overflow-hidden border border-white/10 select-none p-4 sm:p-6 justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Music size={18} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Son-OS Music Player</h2>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          Track {mediaTrackIndex + 1} / {PLAYLIST.length}
        </span>
      </div>

      {/* Main Track Display Area */}
      <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
        {/* Album Art Cover with Spinning Disk Animation */}
        <div className="relative group shrink-0">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-zinc-900 flex items-center justify-center">
            {/* eslint-disable-next-html-element-suppression */}
            <img
              src={track.coverUrl}
              alt={track.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                mediaIsPlaying ? "scale-105" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Disc className={`text-white/80 ${mediaIsPlaying ? "animate-spin" : ""}`} size={48} />
            </div>
          </div>
        </div>

        {/* Track Details & Visualizer Bars */}
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
              {track.album}
            </span>
            <h3 className="text-lg font-bold text-white line-clamp-1">{track.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">{track.artist}</p>
          </div>

          {/* Animated Equalizer Bars */}
          <div className="flex items-end gap-1 h-6 my-4">
            {[40, 70, 30, 90, 60, 80, 45, 100, 50, 75].map((h, idx) => (
              <span
                key={idx}
                className={`flex-1 bg-linear-to-t from-purple-500 to-indigo-400 rounded-full transition-all duration-300 ${
                  mediaIsPlaying ? "animate-pulse" : "opacity-30"
                }`}
                style={{
                  height: mediaIsPlaying ? `${Math.max(15, (h * (idx + 1)) % 100)}%` : "15%",
                  animationDelay: `${idx * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Progress Seek Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={mediaDuration || 100}
              value={mediaCurrentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>{formatTime(mediaCurrentTime)}</span>
              <span>{formatTime(mediaDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Controls Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0 gap-2">
        {/* Shuffle & Repeat Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMediaShuffle}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              mediaIsShuffle ? "text-purple-400 bg-purple-500/20" : "text-zinc-400 hover:text-white"
            }`}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={toggleMediaRepeat}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              mediaIsRepeat ? "text-purple-400 bg-purple-500/20" : "text-zinc-400 hover:text-white"
            }`}
            title="Repeat"
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Main Playback Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={playPrevTrack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors min-h-9 min-w-9 flex items-center justify-center cursor-pointer"
            title="Previous"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={() => toggleMediaPlay()}
            className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-transform active:scale-95 shadow-lg shadow-purple-600/30 min-h-11 min-w-11 flex items-center justify-center cursor-pointer"
            title={mediaIsPlaying ? "Pause" : "Play"}
          >
            {mediaIsPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button
            onClick={playNextTrack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors min-h-9 min-w-9 flex items-center justify-center cursor-pointer"
            title="Next"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMediaMute}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {mediaIsMuted || mediaVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={mediaIsMuted ? 0 : mediaVolume}
            onChange={(e) => {
              setMediaVolume(parseFloat(e.target.value));
            }}
            className="w-16 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hidden sm:block"
          />
        </div>
      </div>
    </div>
  );
};
