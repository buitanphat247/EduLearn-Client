import { useState, useRef, useEffect, useCallback } from "react";

interface UseListeningAudioProps {
  audioSrc: string;
  playbackSpeed: number;
}

/**
 * Custom hook for managing listening audio playback
 * @param audioSrc - Audio source URL
 * @param playbackSpeed - Playback speed (0.5, 0.75, 1, 1.25, 1.5)
 * @returns Audio control functions and state
 */
export function useListeningAudio({ audioSrc, playbackSpeed }: UseListeningAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Maintain Playback Speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const changeSpeed = useCallback((speeds: number[]) => {
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    return speeds[nextIdx];
  }, [playbackSpeed]);

  const formatTime = useCallback((time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  }, []);

  return {
    audioRef,
    isPlaying,
    currentTime,
    setCurrentTime,
    duration,
    togglePlay,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleAudioEnded,
    changeSpeed,
    formatTime,
  };
}
