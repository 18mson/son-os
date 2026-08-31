"use client";

import React, { useEffect, useRef } from "react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
import { PLAYLIST } from "@/config/musicConfig";

export const GlobalAudioManager: React.FC = () => {
  const {
    mediaTrackIndex,
    mediaIsPlaying,
    mediaCurrentTime,
    mediaVolume,
    mediaIsMuted,
    mediaIsRepeat,
    customTracks,
    playNextTrack,
    setMediaCurrentTime,
    setMediaDuration,
    toggleMediaPlay,
  } = useWindowStore();

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const playlist = [...PLAYLIST, ...customTracks];
  const currentTrack = playlist[mediaTrackIndex] || playlist[0] || PLAYLIST[0];

  const effectiveVolume = (!soundEnabled || mediaIsMuted) ? 0 : mediaVolume / 100;

  // Synchronize audio volume and mute for HTML5 Audio
  useEffect(() => {
    if (audioRef.current && !currentTrack.youtubeId) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [mediaVolume, mediaIsMuted, soundEnabled, effectiveVolume, currentTrack.youtubeId]);

  // Synchronize user seek from UI (MusicPlayerApp or QuickSettings) to Audio Element
  useEffect(() => {
    if (audioRef.current && !currentTrack.youtubeId) {
      const diff = Math.abs(audioRef.current.currentTime - mediaCurrentTime);
      if (diff > 1.5 && !isSeekingRef.current) {
        audioRef.current.currentTime = mediaCurrentTime;
      }
    }
  }, [mediaCurrentTime, currentTrack.youtubeId]);

  // Synchronize audio play / pause state for HTML5 Audio
  useEffect(() => {
    if (currentTrack.youtubeId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (!audioRef.current) return;

    if (mediaIsPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          toggleMediaPlay(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [mediaIsPlaying, mediaTrackIndex, toggleMediaPlay, currentTrack.youtubeId, currentTrack.audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !currentTrack.youtubeId) {
      setMediaCurrentTime(audioRef.current.currentTime);
      setMediaDuration(audioRef.current.duration || currentTrack.duration);
    }
  };

  const handleEnded = () => {
    if (mediaIsRepeat) {
      if (audioRef.current && !currentTrack.youtubeId) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      playNextTrack();
    }
  };

  return (
    <>
      {!currentTrack.youtubeId && currentTrack.audioUrl && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
          className="hidden"
        />
      )}
    </>
  );
};
