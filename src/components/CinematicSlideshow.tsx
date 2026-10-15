import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Maximize2, Minimize2, Heart, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { MemoryPhoto } from '../config/birthdayConfig';
import { romanticAudio } from '../utils/romanticAudio';

interface CinematicSlideshowProps {
  photos: MemoryPhoto[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const CinematicSlideshow: React.FC<CinematicSlideshowProps> = ({
  photos,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(romanticAudio.getIsMuted());
  const containerRef = useRef<HTMLDivElement>(null);

  const SLIDE_DURATION = 5000; // 5 seconds per slide, natural breathing cadence

  // Reset index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsPlaying(true);
      // Ensure romantic music is playing softly in background
      if (!romanticAudio.getIsPlaying()) {
        try {
          romanticAudio.resume();
        } catch {
          // ignore autoplay restrictions
        }
      }
    }
  }, [isOpen, initialIndex]);

  // Slideshow timer & progress bar
  useEffect(() => {
    if (!isOpen || !isPlaying || photos.length === 0) return;

    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % photos.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setProgress(0);
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setProgress(0);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Toggle audio
  const toggleMute = () => {
    romanticAudio.toggleMute();
    setIsAudioMuted(romanticAudio.getIsMuted());
  };

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Trình chiếu ảnh kỷ niệm điện ảnh"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#1f1619] text-[#FFF8F0] select-none overflow-hidden transition-all duration-700"
    >
      {/* Blurred romantic ambient backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-35 filter blur-3xl scale-110 transition-all duration-1000">
        <img
          key={`bg-${currentPhoto.id || currentIndex}`}
          src={currentPhoto.url}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Soft warm vignette gradient overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#1f1619]/60 to-[#120c0e]/95 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-[#120c0e]/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide text-[#F8DCE4]">
            <Sparkles className="w-4 h-4 text-[#C98799]" />
            <span className="font-serif">Khoảnh khắc đáng yêu của em</span>
            <span className="text-stone-500">·</span>
            <span className="text-xs font-mono text-[#F8DCE4]/80">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute / Unmute Button */}
          <button
            onClick={toggleMute}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FFF8F0] text-xs transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            title={isAudioMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            <span className="hidden sm:inline">{isAudioMuted ? 'Tắt tiếng' : 'Nhạc nền'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FFF8F0] transition-colors cursor-pointer backdrop-blur-md"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-rose-500/80 text-[#FFF8F0] transition-colors cursor-pointer backdrop-blur-md"
            title="Đóng trình chiếu (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Cinematic Visual Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Previous / Next Arrow buttons on desktop */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute left-4 sm:left-8 z-30 p-3.5 rounded-full bg-black/30 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer transform hover:-translate-x-1"
          aria-label="Khoảnh khắc trước"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="hidden sm:flex absolute right-4 sm:right-8 z-30 p-3.5 rounded-full bg-black/30 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer transform hover:translate-x-1"
          aria-label="Khoảnh khắc tiếp theo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center Picture Container with Soft Glow and Gentle Ken Burns Zoom */}
        <div className="relative max-w-4xl max-h-[68vh] sm:max-h-[72vh] flex items-center justify-center">
          {/* Subtle warm halo */}
          <div className="absolute -inset-4 rounded-3xl bg-[#C98799]/15 blur-2xl pointer-events-none" />

          {/* The Photo Frame */}
          <div className="relative rounded-2xl overflow-hidden p-2 sm:p-3 bg-white/5 border border-white/15 backdrop-blur-md shadow-2xl">
            <img
              key={`photo-${currentPhoto.id || currentIndex}`}
              src={currentPhoto.url}
              alt={currentPhoto.title}
              className="max-h-[55vh] sm:max-h-[60vh] w-auto max-w-full object-contain rounded-xl drop-shadow-2xl transition-all duration-1000 ease-out animate-ken-burns motion-reduce:animate-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = parent.querySelector('.cinematic-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }
              }}
            />

            {/* Fallback if image path not found */}
            <div className="cinematic-fallback hidden w-80 h-72 flex flex-col items-center justify-center p-6 text-center">
              <Heart className="w-12 h-12 text-[#C98799] fill-[#C98799]/30 mb-3 animate-pulse" />
              <p className="font-serif text-lg font-medium text-[#FFF8F0]">{currentPhoto.title}</p>
              <p className="font-handwriting text-xl text-[#F8DCE4] mt-2">"{currentPhoto.caption}"</p>
            </div>

            {/* Sticker overlay if available */}
            {currentPhoto.sticker && (
              <span className="absolute top-4 right-4 text-2xl sm:text-3xl drop-shadow-md select-none">
                {currentPhoto.sticker}
              </span>
            )}
          </div>
        </div>

        {/* Handwritten Romantic Caption */}
        <div className="mt-5 text-center max-w-2xl px-4 z-20">
          <p className="font-handwriting text-2xl sm:text-3xl lg:text-4xl text-[#F8DCE4] font-medium leading-relaxed drop-shadow">
            "{currentPhoto.caption}"
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs sm:text-sm text-[#FFF8F0]/70">
            <Heart className="w-3.5 h-3.5 fill-[#C98799] text-[#C98799]" />
            <span className="font-serif">{currentPhoto.title}</span>
            <span className="text-stone-500">·</span>
            <span>Sinh nhật 21.10.2026</span>
          </div>
        </div>
      </main>

      {/* Bottom Timeline & Controls */}
      <footer className="relative z-20 px-4 sm:px-8 py-4 bg-gradient-to-t from-[#120c0e]/95 to-transparent">
        {/* Soft Timeline Progress Bar */}
        <div className="max-w-xl mx-auto mb-3">
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C98799] via-[#F8DCE4] to-[#C98799] transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Player Controls */}
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="sm:hidden text-xs text-[#F8DCE4] flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </button>

          {/* Central Play / Pause Button */}
          <div className="flex items-center gap-4 mx-auto">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="px-5 py-2 rounded-full bg-[#C98799] hover:bg-[#A86577] text-white text-xs sm:text-sm font-medium transition-all shadow-lg hover:shadow-[#C98799]/30 flex items-center gap-2 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Tiếp tục</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleNext}
            className="sm:hidden text-xs text-[#F8DCE4] flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10"
          >
            Sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
