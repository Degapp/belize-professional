'use client';

import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ 
  src, 
  poster, 
  title = "Video",
  description,
  autoPlay = false,
  controls = true,
  className = "",
  compact = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (autoPlay && videoRef.current && isLoaded) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay, isLoaded]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
    }
  };

  const handleError = (e) => {
    setError('Unable to load video. Please check your connection or try again later.');
    console.error('Video error:', e);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Determine video source type
  const getVideoType = (url) => {
    if (!url) return null;
    if (url.includes('.m3u8')) return 'application/x-mpegURL';
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.mp4')) return 'video/mp4';
    return 'video/mp4'; // default
  };

  // Compact mode for small card thumbnails
  if (compact) {
    return (
      <div className={`relative w-full h-full bg-black ${className}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
          poster={poster}
          playsInline
          muted
        >
          {src && <source src={src} type={getVideoType(src)} />}
        </video>

        {/* Play Overlay for compact mode */}
        {!isPlaying && !error && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
          >
            <div className="w-12 h-12 bg-brand-600/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <i className="ph-light ph-play text-white text-2xl ml-0.5"></i>
            </div>
          </button>
        )}

        {/* Error state for compact mode */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <i className="ph-light ph-video-camera-slash text-3xl text-slate-500"></i>
          </div>
        )}
      </div>
    );
  }

  // Full mode with controls
  if (error) {
    return (
      <div className={`bg-slate-100 rounded-2xl overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center bg-slate-900 text-white p-8">
          <div className="text-center space-y-3">
            <i className="ph-light ph-video-camera-slash text-6xl text-slate-400"></i>
            <p className="text-slate-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
          poster={poster}
          playsInline
        >
          {src && <source src={src} type={getVideoType(src)} />}
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
          >
            <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <i className="ph-light ph-play text-white text-5xl ml-1"></i>
            </div>
          </button>
        )}

        {/* Title Overlay */}
        {title && (
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white text-2xl font-bold">{title}</h3>
            {description && <p className="text-gray-200 mt-1 text-sm">{description}</p>}
          </div>
        )}
      </div>

      {/* Video Controls */}
      {controls && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${progress}%, #374151 ${progress}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-slate-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-brand-600 hover:bg-brand-700 rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                {isPlaying ? (
                  <i className="ph-light ph-pause text-white text-2xl"></i>
                ) : (
                  <i className="ph-light ph-play text-white text-2xl ml-1"></i>
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, currentTime - 10);
                  }
                }}
                className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                title="Rewind 10 seconds"
              >
                <i className="ph-light ph-arrow-counter-clockwise text-white text-xl"></i>
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                  }
                }}
                className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                title="Forward 10 seconds"
              >
                <i className="ph-light ph-arrow-clockwise text-white text-xl"></i>
              </button>
            </div>

            {/* Status Badge */}
            <div className="hidden md:flex items-center space-x-2">
              {isLoaded && (
                <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-medium">
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
