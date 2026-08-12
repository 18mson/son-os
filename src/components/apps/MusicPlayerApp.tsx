/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Music,
  Disc,
  Upload,
  Plus,
  Video,
  VideoOff,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { PLAYLIST, Track, extractYouTubeId } from "@/config/musicConfig";

const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

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
    showNotification,
  } = useWindowStore();

  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [showYouTubeModal, setShowYouTubeModal] = useState<boolean>(false);
  const [youtubeInput, setYoutubeInput] = useState<string>("");
  const [youtubeTitleInput, setYoutubeTitleInput] = useState<string>("");

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
        artist: "File Lokal MP3",
        album: "Unggahan Pengguna",
        duration: 180,
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80",
        audioUrl: URL.createObjectURL(file),
      };
      addCustomTrack(newTrack);
    });

    selectTrack(previousLength);
  };

  const handleAddYouTubeTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeId(youtubeInput);
    if (!ytId) {
      showNotification("URL Tidak Valid", "Masukkan URL atau ID YouTube yang valid (contoh: https://youtu.be/...)", "Music Player");
      return;
    }

    const title = youtubeTitleInput.trim() || `YouTube Music (${ytId})`;
    const newTrack: Track = {
      id: `yt-custom-${Date.now()}`,
      title,
      artist: "YouTube Stream",
      album: "YouTube Track",
      duration: 300,
      coverUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      audioUrl: "",
      youtubeId: ytId,
    };

    const nextIndex = playlist.length;
    addCustomTrack(newTrack);
    selectTrack(nextIndex);
    setYoutubeInput("");
    setYoutubeTitleInput("");
    setShowYouTubeModal(false);
    showNotification("Lagu YouTube Ditambahkan", `Menambahkan "${title}" ke playlist`, "Music Player");
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentYtId = extractYouTubeId(youtubeInput);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-xl overflow-hidden border border-white/10 select-none p-4 sm:p-5 justify-between font-sans relative">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Modal Add YouTube URL */}
      {showYouTubeModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/15 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <YoutubeIcon className="text-red-500" size={20} />
                <h3 className="text-sm font-bold text-white">Tambah Lagu dari YouTube</h3>
              </div>
              <button
                onClick={() => setShowYouTubeModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddYouTubeTrack} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">URL atau ID YouTube</label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... atau ID"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 outline-hidden focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Judul Lagu (Opsional)</label>
                <input
                  type="text"
                  value={youtubeTitleInput}
                  onChange={(e) => setYoutubeTitleInput(e.target.value)}
                  placeholder="Judul musik..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 outline-hidden focus:border-red-500 transition-all"
                />
              </div>

              {currentYtId && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <img
                    src={`https://img.youtube.com/vi/${currentYtId}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-16 h-10 object-cover rounded-lg border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-white truncate">Video ID: {currentYtId}</p>
                    <p className="text-[10px] text-emerald-400 font-medium">Ready to import stream</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYouTubeModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Tambah Lagu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400">
            <Music size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-wide">Son-OS Music Player</h2>
            <p className="text-[10px] text-zinc-400">Pemutar Musik Desktop &amp; Stream Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowYouTubeModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <YoutubeIcon size={13} /> + YouTube
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Upload size={12} /> Unggah MP3
          </button>
        </div>
      </div>

      {/* Main Track Display */}
      <div className="flex flex-col md:flex-row items-center gap-4 py-3 shrink-0">
        {/* Cover Art / YouTube Video Player Container */}
        <div className="relative w-44 h-32 sm:w-52 sm:h-36 rounded-2xl overflow-hidden shadow-2xl shrink-0 group border border-white/10 bg-zinc-900 flex items-center justify-center">
          {track.youtubeId ? (
            showVideo ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=${mediaIsPlaying ? 1 : 0}&enablejsapi=1`}
                title={track.title}
                className="w-full h-full border-0 rounded-2xl"
                allow="autoplay; encrypted-media; fullscreen"
              />
            ) : (
              <>
                <img
                  src={track.coverUrl || `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`}
                  alt={track.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Disc className="text-red-400 animate-spin" size={36} />
                </div>
                {/* Hidden Audio Stream Container for Video: OFF mode */}
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${track.youtubeId}?autoplay=${mediaIsPlaying ? 1 : 0}&enablejsapi=1`}
                  title={track.title}
                  className="w-1 h-1 opacity-0 absolute -z-50 pointer-events-none"
                  allow="autoplay"
                />
              </>
            )
          ) : track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Disc className="text-purple-400 animate-spin" size={48} />
          )}

          {/* Toggle Video On/Off Badge for YouTube Tracks */}
          {track.youtubeId && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer z-10"
              title={showVideo ? "Sembunyikan Video (Mode Cover)" : "Tampilkan Video YouTube"}
            >
              {showVideo ? (
                <>
                  <VideoOff size={11} className="text-amber-400" /> Video: ON
                </>
              ) : (
                <>
                  <Video size={11} className="text-red-400" /> Video: OFF
                </>
              )}
            </button>
          )}
        </div>

        {/* Track Details & Seek Bar */}
        <div className="flex flex-col text-center md:text-left min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-center md:justify-between gap-2">
            <h3 className="text-sm font-bold truncate text-white tracking-tight">{track.title}</h3>
            {track.youtubeId && (
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[9px] font-bold shrink-0">
                YouTube
              </span>
            )}
          </div>
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
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Playlist ({playlist.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowYouTubeModal(true)}
              className="hover:text-red-400 flex items-center gap-0.5 text-[9px] cursor-pointer text-zinc-300 font-medium"
            >
              <Plus size={10} /> YouTube
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-purple-400 flex items-center gap-0.5 text-[9px] cursor-pointer text-zinc-300 font-medium"
            >
              <Plus size={10} /> MP3
            </button>
          </div>
        </div>
        <div className="space-y-0.5">
          {playlist.map((t: Track, idx: number) => (
            <button
              key={t.id}
              onClick={() => selectTrack(idx)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                mediaTrackIndex === idx
                  ? "bg-purple-600/30 text-purple-300 font-semibold"
                  : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              <div className="flex items-center gap-2 truncate flex-1">
                {t.youtubeId ? (
                  <YoutubeIcon size={13} className="text-red-500 shrink-0" />
                ) : (
                  <Music size={13} className="text-purple-400 shrink-0" />
                )}
                <span className="truncate">
                  {t.title} - <span className="opacity-60 text-[10px]">{t.artist}</span>
                </span>
              </div>
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
            title="Previous Track"
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
            title="Next Track"
          >
            <SkipForward size={17} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMediaMute}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={mediaIsMuted || mediaVolume === 0 ? "Unmute" : "Mute"}
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
