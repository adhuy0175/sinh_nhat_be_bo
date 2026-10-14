import React, { useState } from 'react';
import { Camera, Sparkles, Heart, SlidersHorizontal, Star } from 'lucide-react';
import { BIRTHDAY_CONFIG, MemoryPhoto } from '../config/birthdayConfig';
import { PhotoLightbox } from './PhotoLightbox';

interface Scene3MemoryScrapbookProps {
  photos: MemoryPhoto[];
  onOpenCustomizer: () => void;
}

export const Scene3MemoryScrapbook: React.FC<Scene3MemoryScrapbookProps> = ({
  photos,
  onOpenCustomizer,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Subtle natural Polaroid rotation angles
  const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-2'];

  // Cover photo is index 0 or defined in config
  const coverPhoto = BIRTHDAY_CONFIG.scene3.coverPhoto;

  return (
    <section id="scene-memories" className="relative py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100/70 text-rose-700 text-xs font-medium">
          <Camera className="w-3.5 h-3.5" />
          <span>{BIRTHDAY_CONFIG.scene3.badge}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          {BIRTHDAY_CONFIG.scene3.title}
        </h2>

        <p className="text-stone-600 text-sm sm:text-base font-light">
          {BIRTHDAY_CONFIG.scene3.subtitle}
        </p>

        {/* Quick personalize button */}
        <div className="pt-2">
          <button
            onClick={onOpenCustomizer}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 rounded-full border border-rose-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tùy chỉnh ảnh kỷ niệm ({photos.length} ảnh)</span>
          </button>
        </div>
      </div>

      {/* Featured Main Cover Photo */}
      <div className="max-w-xl mx-auto mb-16">
        <div
          onClick={() => setSelectedPhotoIndex(0)}
          className="group relative bg-white p-4 sm:p-6 pb-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer border-2 border-rose-200/80"
        >
          {/* Decorative washi tape on top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape rotate-[-1deg] z-10" />

          {/* Featured badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[11px] font-semibold shadow-md">
            <Star className="w-3 h-3 fill-white" />
            <span>Ảnh yêu thích nhất</span>
          </div>

          {/* Photo Frame with preserved aspect ratio */}
          <div className="relative w-full rounded-2xl bg-gradient-to-tr from-rose-50 via-pink-50 to-amber-50 overflow-hidden flex items-center justify-center p-2 min-h-[260px] sm:min-h-[340px]">
            <img
              src={coverPhoto.url}
              alt={coverPhoto.title}
              className="max-h-[380px] sm:max-h-[440px] w-auto max-w-full object-contain rounded-xl drop-shadow-sm transition-transform duration-500 group-hover:scale-102"
              onError={(e) => {
                // If cover.jpg not loaded, use first gallery photo
                if (photos.length > 0 && e.currentTarget.src !== photos[0].url) {
                  e.currentTarget.src = photos[0].url;
                }
              }}
            />
          </div>

          {/* Cover Caption */}
          <div className="mt-5 text-center px-2">
            <p className="font-handwriting text-2xl sm:text-3xl text-rose-600 font-bold leading-snug">
              "{coverPhoto.caption}"
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{coverPhoto.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrapbook Grid with Polaroid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {photos.map((photo, index) => {
          const rotationClass = rotations[index % rotations.length];

          return (
            <div
              key={photo.id || index}
              onClick={() => setSelectedPhotoIndex(index)}
              className={`group relative bg-white p-3.5 pb-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform ${rotationClass} hover:rotate-0 hover:-translate-y-2 cursor-pointer border border-stone-200/60 flex flex-col`}
            >
              {/* Washi tape on top edge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape rotate-[-1deg] z-10" />

              {/* Photo Image Frame with natural aspect ratio preservation (no awkward face cropping!) */}
              <div
                className={`relative w-full rounded-xl bg-gradient-to-tr ${
                  photo.fallbackGradient || 'from-rose-50 to-pink-100'
                } flex items-center justify-center overflow-hidden p-2 min-h-[240px] sm:min-h-[280px]`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="max-h-[320px] w-auto max-w-full object-contain rounded-lg drop-shadow-sm transition-transform duration-500 group-hover:scale-103"
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
                  <div className="w-12 h-12 rounded-full bg-rose-200/70 flex items-center justify-center text-rose-500 mb-2">
                    <Heart className="w-6 h-6 fill-rose-400" />
                  </div>
                  <span className="font-serif text-sm font-semibold text-stone-800 line-clamp-1">
                    {photo.title}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5">
                    Chạm để xem ảnh
                  </span>
                </div>

                {/* Sticker badge */}
                {photo.sticker && (
                  <span className="absolute top-2.5 right-2.5 text-xl select-none drop-shadow-sm group-hover:scale-125 transition-transform">
                    {photo.sticker}
                  </span>
                )}
              </div>

              {/* Polaroid Handwritten Caption */}
              <div className="mt-4 px-1 text-center flex-1 flex flex-col justify-between">
                <p className="font-handwriting text-xl text-stone-800 leading-snug group-hover:text-rose-600 transition-colors">
                  "{photo.caption}"
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-stone-400">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{photo.title}</span>
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
    </section>
  );
};
