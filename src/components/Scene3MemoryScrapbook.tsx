import React, { useState } from 'react';
import { Camera, Sparkles, Heart, SlidersHorizontal, Star, Film, Play, Eye } from 'lucide-react';
import { BIRTHDAY_CONFIG, MemoryPhoto } from '../config/birthdayConfig';
import { PhotoLightbox } from './PhotoLightbox';
import { CinematicSlideshow } from './CinematicSlideshow';

interface Scene3MemoryScrapbookProps {
  photos: MemoryPhoto[];
  onOpenCustomizer: () => void;
}

export const Scene3MemoryScrapbook: React.FC<Scene3MemoryScrapbookProps> = ({
  photos,
  onOpenCustomizer,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isCinematicOpen, setIsCinematicOpen] = useState(false);
  const [cinematicStartIndex, setCinematicStartIndex] = useState(0);

  // Subtle organic rotation angles for scrapbook polaroids
  const rotations = [
    '-rotate-1.5',
    'rotate-1',
    '-rotate-2',
    'rotate-1.5',
    '-rotate-1',
    'rotate-2',
    '-rotate-2.5',
    'rotate-1',
  ];

  // Cover photo is from config
  const coverPhoto = BIRTHDAY_CONFIG.scene3.coverPhoto;

  const handleOpenCinematic = (startIndex = 0) => {
    setCinematicStartIndex(startIndex);
    setIsCinematicOpen(true);
  };

  return (
    <section id="scene-memories" className="relative py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
        {/* Anti-slop clean metadata badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8DCE4]/60 text-[#6B4B50] text-xs font-medium border border-[#C98799]/30">
          <Camera className="w-3.5 h-3.5 text-[#C98799]" />
          <span>{BIRTHDAY_CONFIG.scene3.badge}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#6B4B50] tracking-tight">
          {BIRTHDAY_CONFIG.scene3.title}
        </h2>

        <p className="text-stone-600 text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed">
          {BIRTHDAY_CONFIG.scene3.subtitle}
        </p>

        {/* Action Controls: Cinematic Slideshow + Quick Customize */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Cinematic Photo Experience Trigger */}
          <button
            onClick={() => handleOpenCinematic(0)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#C98799] to-[#A86577] hover:from-[#A86577] hover:to-[#8E4E5F] rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Film className="w-4 h-4 text-amber-200" />
            <span>Trình chiếu kỷ niệm điện ảnh ✨</span>
          </button>

          <button
            onClick={onOpenCustomizer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-[#6B4B50] hover:text-[#C98799] bg-white/80 hover:bg-white rounded-full border border-[#C98799]/30 transition-colors shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tùy chỉnh ({photos.length} ảnh)</span>
          </button>
        </div>
      </div>

      {/* Featured Cover Polaroid with warm paper border and washi tape */}
      <div className="max-w-xl mx-auto mb-16">
        <div
          onClick={() => setSelectedPhotoIndex(0)}
          className="group relative bg-white p-4 sm:p-6 pb-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer border border-[#F8DCE4]"
        >
          {/* Delicate decorative washi tape on top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape rotate-[-1deg] z-10" />

          {/* Featured favorite badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-[#C98799] text-white text-[11px] font-semibold shadow-sm">
            <Star className="w-3 h-3 fill-white" />
            <span>Khoảnh khắc yêu thích nhất</span>
          </div>

          {/* Photo Frame with preserved aspect ratio (no awkward face cropping!) */}
          <div className="relative w-full rounded-xl bg-[#FFF8F0] overflow-hidden flex items-center justify-center p-2 min-h-[260px] sm:min-h-[340px] border border-[#F8DCE4]/60">
            <img
              src={coverPhoto.url}
              alt={coverPhoto.title}
              className="max-h-[380px] sm:max-h-[440px] w-auto max-w-full object-contain rounded-lg drop-shadow-sm transition-transform duration-500 group-hover:scale-102"
              onError={(e) => {
                if (photos.length > 0 && e.currentTarget.src !== photos[0].url) {
                  e.currentTarget.src = photos[0].url;
                }
              }}
            />
          </div>

          {/* Cover Caption */}
          <div className="mt-5 text-center px-2">
            <p className="font-handwriting text-2xl sm:text-3xl text-[#C98799] font-bold leading-snug">
              "{coverPhoto.caption}"
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-serif">{coverPhoto.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Romantic Asymmetrical Scrapbook Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 items-start">
        {photos.map((photo, index) => {
          const rotationClass = rotations[index % rotations.length];

          // Asymmetrical layout styling: select cards receive subtle varied heights and spanning
          const isSpanningFeatured = index === 2 || index === 7;
          // Selective decorative washi tape (sparingly, only on select photos: index 0, 4, 8)
          const hasWashiTape = index % 4 === 0;
          // Selective delicate corner sticker/flower (only on index 1, 5)
          const hasDelicateFlower = index % 4 === 1;

          return (
            <div
              key={photo.id || index}
              onClick={() => setSelectedPhotoIndex(index)}
              className={`group relative bg-white p-3.5 pb-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform ${rotationClass} hover:rotate-0 hover:-translate-y-2 cursor-pointer border border-[#F8DCE4] flex flex-col ${
                isSpanningFeatured ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Selective washi tape on top edge (sparingly used!) */}
              {hasWashiTape && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 washi-tape rotate-[-1deg] z-10" />
              )}

              {/* Selective tiny pressed flower / heart pin */}
              {hasDelicateFlower && (
                <div className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-[#FFF8F0] shadow-sm border border-[#F8DCE4] flex items-center justify-center text-xs">
                  🌸
                </div>
              )}

              {/* Photo Image Frame with natural aspect ratio preservation (no awkward face cropping!) */}
              <div
                className={`relative w-full rounded-xl bg-[#FFF8F0] flex items-center justify-center overflow-hidden p-2 border border-[#F8DCE4]/50 ${
                  isSpanningFeatured
                    ? 'min-h-[280px] sm:min-h-[320px]'
                    : 'min-h-[230px] sm:min-h-[260px]'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="max-h-[300px] sm:max-h-[340px] w-auto max-w-full object-contain rounded-lg drop-shadow-sm transition-transform duration-500 group-hover:scale-102"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.polaroid-fallback');
                      if (fallback) fallback.classList.remove('hidden');
                    }
                  }}
                />

                {/* Romantic artistic placeholder */}
                <div className="polaroid-fallback hidden absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F8DCE4] flex items-center justify-center text-[#C98799] mb-2">
                    <Heart className="w-6 h-6 fill-[#C98799]" />
                  </div>
                  <span className="font-serif text-sm font-semibold text-[#6B4B50] line-clamp-1">
                    {photo.title}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5">
                    Chạm để xem ảnh
                  </span>
                </div>

                {/* Subtle sticker if defined */}
                {photo.sticker && (
                  <span className="absolute top-2.5 right-2.5 text-lg select-none drop-shadow-sm group-hover:scale-115 transition-transform">
                    {photo.sticker}
                  </span>
                )}

                {/* Quick Slideshow Icon on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCinematic(index);
                  }}
                  className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-white/90 text-[#6B4B50] hover:text-[#C98799] shadow-sm transition-all text-xs flex items-center gap-1 cursor-pointer"
                  title="Xem trình chiếu từ ảnh này"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>

              {/* Polaroid Handwritten Caption */}
              <div className="mt-4 px-1 text-center flex-1 flex flex-col justify-between">
                <p className="font-handwriting text-xl text-[#6B4B50] leading-snug group-hover:text-[#C98799] transition-colors">
                  "{photo.caption}"
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-stone-400">
                  <span className="font-serif text-stone-500">{photo.title}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <PhotoLightbox
        photos={photos}
        currentIndex={selectedPhotoIndex}
        onClose={() => setSelectedPhotoIndex(null)}
        onNavigate={(idx) => setSelectedPhotoIndex(idx)}
      />

      {/* Cinematic Slideshow Mode */}
      <CinematicSlideshow
        photos={photos}
        isOpen={isCinematicOpen}
        onClose={() => setIsCinematicOpen(false)}
        initialIndex={cinematicStartIndex}
      />
    </section>
  );
};
