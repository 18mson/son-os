/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Music, Disc, Upload, Plus } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { PLAYLIST, Track } from "@/config/musicConfig";

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
    customTracks,
    toggleMediaPlay,
    playNextTrack,
    playPrevTrack,
    selectTrack,
    setMediaCurrentTime,
    setMediaVolume,
    toggleMediaMute,
    toggleMediaShuffle,
    toggleMediaRepeat,
    addCustomTrack,
  } = useWindowStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const playlist: Track[] = [...PLAYLIST, ...customTracks];
  const track = playlist[mediaTrackIndex] || playlist[0] || PLAYLIST[0];

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setMediaCurrentTime(newTime);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previousLength = playlist.length;
    Array.from(files).forEach((file, idx) => {
      const newTrack: Track = {
        id: `custom-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "File Lokal",
        album: "Unggahan Pengguna",
        duration: 180,
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
        audioUrl: URL.createObjectURL(file),
      };
      addCustomTrack(newTrack);
    });

    selectTrack(previousLength);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-xl overflow-hidden border border-white/10 select-none p-4 sm:p-5 justify-between font-sans">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400">
            <Music size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-wide">Son-OS Music Player</h2>
            <p className="text-[10px] text-zinc-400">Pemutar Musik Desktop & Audio Manager</p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Upload size={12} /> Unggah MP3
        </button>
      </div>

      {/* Main Track Display */}
      <div className="flex flex-col md:flex-row items-center gap-4 py-3 shrink-0">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl shrink-0 group border border-white/10 bg-zinc-900 flex items-center justify-center">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Disc className="text-purple-400 animate-spin" size={48} />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        </div>

        <div className="flex flex-col text-center md:text-left min-w-0 flex-1 space-y-1">
          <h3 className="text-sm font-bold truncate text-white tracking-tight">{track.title}</h3>
          <p className="text-xs font-medium text-purple-300/80 truncate">{track.artist}</p>
          <p className="text-[10px] text-zinc-500 truncate">{track.album}</p>

          <div className="pt-2">
            <input
              type="range"
              min={0}
              max={mediaDuration || track.duration || 100}
              value={mediaCurrentTime || 0}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-1">
              <span>{formatTime(mediaCurrentTime)}</span>
              <span>{formatTime(mediaDuration || track.duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Selector */}
      <div className="flex-1 overflow-y-auto max-h-36 my-2 bg-white/5 rounded-xl p-2 border border-white/5 no-scrollbar">
        <div className="flex items-center justify-between px-2 pb-1 mb-1 border-b border-white/5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Playlist ({playlist.length})</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hover:text-purple-400 flex items-center gap-0.5 text-[9px] cursor-pointer"
          >
            <Plus size={10} /> Tambah Lagu
          </button>
        </div>
        <div className="space-y-0.5">
          {playlist.map((t: Track, idx: number) => (
            <button
              key={t.id}
              onClick={() => selectTrack(idx)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                mediaTrackIndex === idx
                  ? "bg-purple-600/30 text-purple-300 font-semibold"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              <span className="truncate flex-1">{t.title} - <span className="opacity-60 text-[10px]">{t.artist}</span></span>
              {mediaTrackIndex === idx && mediaIsPlaying && (
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping ml-2 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Controls Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMediaShuffle}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              mediaIsShuffle ? "text-purple-400 bg-purple-500/20" : "text-zinc-400 hover:text-white"
            }`}
            title="Shuffle"
          >
            <Shuffle size={14} />
          </button>
          <button
            onClick={toggleMediaRepeat}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              mediaIsRepeat ? "text-purple-400 bg-purple-500/20" : "text-zinc-400 hover:text-white"
            }`}
            title="Repeat"
          >
            <Repeat size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={playPrevTrack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors min-h-9 min-w-9 flex items-center justify-center cursor-pointer"
            title="Previous"
          >
            <SkipBack size={17} />
          </button>
          <button
            onClick={() => toggleMediaPlay()}
            className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-transform active:scale-95 shadow-lg shadow-purple-600/30 min-h-10 min-w-10 flex items-center justify-center cursor-pointer"
            title={mediaIsPlaying ? "Pause" : "Play"}
          >
            {mediaIsPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button
            onClick={playNextTrack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors min-h-9 min-w-9 flex items-center justify-center cursor-pointer"
            title="Next"
          >
            <SkipForward size={17} />
          </button>
        </div>

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
            max={100}
            value={mediaIsMuted ? 0 : mediaVolume}
            onChange={(e) => {
              setMediaVolume(Number(e.target.value));
            }}
            className="w-16 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 hidden sm:block"
          />
        </div>
      </div>
    </div>
  );
};
