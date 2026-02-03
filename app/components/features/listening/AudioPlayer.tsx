"use client";

import { FaPlay, FaPause, FaVolumeUp, FaEllipsisV } from "react-icons/fa";

interface AudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  audioSrc: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onEnded: () => void;
  onChangeSpeed: () => void;
  onSeek: (time: number) => void;
  formatTime: (time: number) => string;
}

/**
 * Audio Player Component for Listening Practice
 */
export default function AudioPlayer({
  audioRef,
  audioSrc,
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  onTogglePlay,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onChangeSpeed,
  onSeek,
  formatTime,
}: AudioPlayerProps) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-sky-500 to-indigo-500 opacity-70"></div>

      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onPlay={() => {}}
        onPause={() => {}}
        className="hidden"
      />

      <div className="flex items-center gap-5">
        <button
          onClick={onTogglePlay}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-all transform hover:scale-105 active:scale-95 border-2 border-blue-500/50"
        >
          {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer group">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0.1}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <button className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            <FaVolumeUp />
          </button>
          <button className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            <FaEllipsisV />
          </button>
        </div>

        <div
          onClick={onChangeSpeed}
          className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white transition select-none min-w-[80px] text-center"
        >
          {playbackSpeed}x
        </div>
      </div>
    </div>
  );
}
