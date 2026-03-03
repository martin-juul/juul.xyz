import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { mediaplayerTranslations } from './translations';
import './mediaplayer.css';

const VIDEO_SRC = '/assets/mvs/Kanal Trailer 2.mp4';

export function MediaPlayer() {
  const { language } = useLanguage();
  const t = mediaplayerTranslations[language];

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  // Volume change
  const handleVolumeChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  }, []);

  // Seek
  const handleSeek = useCallback((e: MouseEvent) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  }, [duration]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          }
          break;
        case 'ArrowRight':
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
          }
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div class="mediaplayer-container" ref={containerRef}>
      {/* Menu Bar */}
      <div class="mediaplayer-menubar">
        <span class="mediaplayer-menu-item">File</span>
        <span class="mediaplayer-menu-item">View</span>
        <span class="mediaplayer-menu-item">Play</span>
        <span class="mediaplayer-menu-item">Help</span>
      </div>

      {/* Video Area */}
      <div class="mediaplayer-video-area" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          class="mediaplayer-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
        />
        {!isPlaying && (
          <div class="mediaplayer-play-overlay">
            <span>▶</span>
          </div>
        )}
      </div>

      {/* Now Playing Info */}
      <div class="mediaplayer-info">
        <div class="mediaplayer-visualizer">
          {isPlaying && Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              class="mediaplayer-bar"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
        <div class="mediaplayer-title-area">
          <span class="mediaplayer-label">{t.nowPlaying}</span>
          <span class="mediaplayer-filename">Kanal Trailer 2.mp4</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div class="mediaplayer-progress-container">
        <span class="mediaplayer-time">{formatTime(currentTime)}</span>
        <div
          ref={progressRef}
          class="mediaplayer-progress"
          onClick={handleSeek}
        >
          <div class="mediaplayer-progress-fill" style={{ width: `${progress}%` }} />
          <div class="mediaplayer-progress-thumb" style={{ left: `${progress}%` }} />
        </div>
        <span class="mediaplayer-time">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div class="mediaplayer-controls">
        <div class="mediaplayer-controls-left">
          <button
            class="mediaplayer-btn"
            onClick={stop}
            title="Stop"
          >
            ■
          </button>
          <button
            class="mediaplayer-btn mediaplayer-btn-large"
            onClick={togglePlay}
            title={isPlaying ? t.pause : t.play}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            class="mediaplayer-btn"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = Math.min(duration, currentTime + 10);
              }
            }}
            title="Skip Forward"
          >
            ⏭
          </button>
        </div>

        <div class="mediaplayer-controls-right">
          <button
            class="mediaplayer-btn"
            onClick={toggleMute}
            title={isMuted ? t.unmute : t.mute}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            class="mediaplayer-volume"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            title="Volume"
          />
          <button
            class="mediaplayer-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? t.exitFullscreen : t.fullscreen}
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div class="mediaplayer-statusbar">
        <span>{isPlaying ? 'Playing' : 'Stopped'}</span>
        <span>Windows Media Video</span>
      </div>
    </div>
  );
}
