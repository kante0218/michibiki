"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface SpeechSegment {
  start: number;
  end: number;
}

interface InterviewPlayerProps {
  videoUrl: string;
  segments: SpeechSegment[];
  duration: number;
  candidateName?: string;
}

export default function InterviewPlayer({
  videoUrl,
  segments,
  duration,
  candidateName,
}: InterviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speechOnly, setSpeechOnly] = useState(false);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);

  const totalSpeechTime = segments.reduce((sum, s) => sum + (s.end - s.start), 0);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (speechOnly && segments.length > 0) {
      // Find current or next segment
      const idx = segments.findIndex((s) => t >= s.start && t <= s.end);
      if (idx >= 0) {
        setCurrentSegmentIdx(idx);
        return;
      }
      // Not in any segment - skip to next
      const nextIdx = segments.findIndex((s) => s.start > t);
      if (nextIdx >= 0) {
        videoRef.current.currentTime = segments[nextIdx].start;
        setCurrentSegmentIdx(nextIdx);
      } else {
        // No more segments
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [speechOnly, segments]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [handleTimeUpdate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (speechOnly && segments.length > 0 && currentTime < segments[0].start) {
        videoRef.current.currentTime = segments[0].start;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const jumpToSegment = (idx: number) => {
    if (!videoRef.current || !segments[idx]) return;
    videoRef.current.currentTime = segments[idx].start;
    setCurrentSegmentIdx(idx);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Video */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          onEnded={() => setIsPlaying(false)}
        />
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Timeline with speech segments overlay */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="relative w-full h-6 bg-gray-100 rounded-full cursor-pointer"
          onClick={(e) => {
            if (!videoRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = pct * duration;
          }}
        >
          {/* Speech segment markers */}
          {segments.map((seg, i) => (
            <div
              key={i}
              className="absolute top-0 h-full bg-indigo-200 rounded-full"
              style={{
                left: `${(seg.start / duration) * 100}%`,
                width: `${((seg.end - seg.start) / duration) * 100}%`,
              }}
            />
          ))}
          {/* Playhead */}
          <div
            className="absolute top-0 h-full bg-indigo-600 rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setSpeechOnly(!speechOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              speechOnly
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {speechOnly ? "🎤 発話のみ再生中" : "全体再生"}
          </button>
        </div>
        <div className="text-xs text-gray-400">
          発話時間: {formatTime(totalSpeechTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Speech segments list */}
      {segments.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2">
            発話セグメント ({segments.length}件)
          </h4>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {segments.map((seg, i) => (
              <button
                key={i}
                onClick={() => jumpToSegment(i)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  i === currentSegmentIdx
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                }`}
              >
                {formatTime(seg.start)} - {formatTime(seg.end)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
