import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { MemoryPhoto } from '../config/birthdayConfig';

interface PhotoLightboxProps {
  photos: MemoryPhoto[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < photos.length;
  const currentPhoto = isOpen ? photos[currentIndex] : null;

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    const prev = (currentIndex - 1 + photos.length) % photos.length;
    onNavigate(prev);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const next = (currentIndex + 1) % photos.length;
    onNavigate(next);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch swipe support on mobile
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1a1215]/85 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Top Bar with counter & close */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between text-white/90 z-20">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <Heart className="w-4 h-4 fill-[#C98799] text-[#C98799]" />
          <span className="text-[#F8DCE4]">Khoảnh khắc #{currentIndex + 1} / {photos.length}</span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FFF8F0] transition-colors cursor-pointer"
          aria-label="Đóng xem ảnh"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev / Next Buttons (Desktop) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="hidden sm:flex absolute left-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-[#FFF8F0] transition-colors cursor-pointer"
        aria-label="Ảnh trước"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="hidden sm:flex absolute right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-[#FFF8F0] transition-colors cursor-pointer"
        aria-label="Ảnh kế tiếp"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Polaroid Center Card in Lightbox with Warm Aesthetic */}
      <div
        className="relative max-w-lg w-full bg-white rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center z-10 border border-[#F8DCE4]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo view with preserved natural aspect ratio without cropping faces */}
        <div className="relative w-full overflow-hidden rounded-xl bg-[#FFF8F0] flex items-center justify-center border border-[#F8DCE4]/60 p-2">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className="w-auto max-h-[58vh] max-w-full object-contain rounded-lg drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.photo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }
            }}
          />

          {/* Styled Romantic Fallback */}
          <div className="photo-fallback hidden w-full py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#F8DCE4] flex items-center justify-center mb-3 text-[#C98799]">
              <Heart className="w-7 h-7 fill-[#C98799]" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#6B4B50]">{currentPhoto.title}</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Vị trí: <code className="bg-[#FFF8F0] px-1.5 py-0.5 rounded text-[#C98799] font-mono">{currentPhoto.url}</code>
            </p>
          </div>

          {currentPhoto.sticker && (
            <span className="absolute top-3 right-3 text-2xl drop-shadow select-none">
              {currentPhoto.sticker}
            </span>
          )}
        </div>

        {/* Caption below in handwritten Caveat */}
        <div className="w-full mt-4 text-center">
          <p className="font-handwriting text-2xl text-[#6B4B50] font-medium leading-snug">
            "{currentPhoto.caption}"
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-stone-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-serif">{currentPhoto.title}</span>
          </div>
        </div>

        {/* Mobile quick navigation arrows */}
        <div className="flex sm:hidden items-center justify-between w-full mt-4 pt-3 border-t border-[#F8DCE4]/60">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 text-xs text-[#6B4B50] font-medium px-3 py-1.5 rounded-lg bg-[#FFF8F0] border border-[#F8DCE4]"
          >
            <ChevronLeft className="w-4 h-4" /> Trước
          </button>
          <span className="text-[11px] text-stone-400">Vuốt để chuyển ảnh</span>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-xs text-[#6B4B50] font-medium px-3 py-1.5 rounded-lg bg-[#FFF8F0] border border-[#F8DCE4]"
          >
            Sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
