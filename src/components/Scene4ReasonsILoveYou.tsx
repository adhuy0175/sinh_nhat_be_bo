import React, { useState } from 'react';
import {
  Smile,
  Sparkles,
  ShieldCheck,
  Sun,
  Gift,
  Heart,
  RotateCw,
} from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';
import { romanticAudio } from '../utils/romanticAudio';
import { fireHeartConfetti } from '../utils/confettiHearts';

export const Scene4ReasonsILoveYou: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const iconMap: Record<string, React.ReactNode> = {
    Smile: <Smile className="w-6 h-6 text-rose-500" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    Sparkles: <Sparkles className="w-6 h-6 text-amber-500" />,
    Sun: <Sun className="w-6 h-6 text-amber-500" />,
    Gift: <Gift className="w-6 h-6 text-purple-500" />,
    Heart: <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />,
  };

  const handleCardClick = (id: number) => {
    const nextState = !flippedCards[id];
    setFlippedCards((prev) => ({
      ...prev,
      [id]: nextState,
    }));

    if (nextState) {
      romanticAudio.playSpecialEffect('sparkle');
      if (id === 6) {
        // Grand celebration for 6th wish card
        fireHeartConfetti(0.5, 0.6);
      }
    }
  };

  const handleRevealAll = () => {
    const allFlipped: Record<number, boolean> = {};
    BIRTHDAY_CONFIG.scene4.wishes.forEach((w) => {
      allFlipped[w.id] = true;
    });
    setFlippedCards(allFlipped);
    romanticAudio.playSpecialEffect('heart');
    fireHeartConfetti(0.5, 0.5);
  };

  const wishes = BIRTHDAY_CONFIG.scene4.wishes;
  const flippedCount = Object.values(flippedCards).filter(Boolean).length;
  const totalCards = wishes.length;

  return (
    <section id="scene-reasons" className="relative py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100/70 text-rose-700 text-xs font-medium">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>{BIRTHDAY_CONFIG.scene4.badge}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          {BIRTHDAY_CONFIG.scene4.heading}
        </h2>

        <p className="text-stone-600 text-sm sm:text-base font-light">
          {BIRTHDAY_CONFIG.scene4.subtitle}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 pt-1 text-xs text-stone-500">
          <span>Đã mở {flippedCount}/{totalCards} lời chúc</span>
          {flippedCount < totalCards ? (
            <button
              onClick={handleRevealAll}
              className="text-rose-600 hover:text-rose-700 underline font-medium cursor-pointer"
            >
              Mở tất cả cùng lúc ✨
            </button>
          ) : (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Em đã khám phá hết những lời chúc tuổi mới này!
            </span>
          )}
        </div>
      </div>

      {/* 6 Flip Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {wishes.map((item) => {
          const isFlipped = !!flippedCards[item.id];

          return (
            <div
              key={item.id}
              className="h-72 [perspective:1000px] cursor-pointer"
              onClick={() => handleCardClick(item.id)}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] rounded-3xl shadow-md hover:shadow-xl ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Front Side: Sealed Birthday Card */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl p-6 glass-panel-warm border border-rose-200/90 flex flex-col items-center justify-between text-center overflow-hidden">
                  {/* Decorative background glow */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-rose-100/50 blur-lg" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-amber-100/40 blur-lg" />

                  <div className="w-full flex items-center justify-between text-stone-400 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 font-medium text-rose-500 text-[11px]">
                      {item.badge}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>

                  <div className="flex flex-col items-center gap-3 my-auto">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-100 via-pink-50 to-amber-50 border border-rose-200 flex items-center justify-center shadow-inner">
                      <Gift className="w-8 h-8 text-rose-500 animate-float-gentle" />
                    </div>
                    <span className="font-serif text-lg font-bold text-stone-800">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                    <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Chạm để lật mở lời chúc</span>
                  </div>
                </div>

                {/* Back Side: Sweet Revealed Wish */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl p-6 bg-gradient-to-br from-[#FFF5F7] via-[#FFF9F5] to-[#FDE8ED] border-2 border-rose-300 shadow-xl flex flex-col items-center justify-between text-center">
                  <div className="w-full flex items-center justify-between text-xs text-rose-400">
                    <span className="font-mono font-semibold text-rose-500">Lời chúc #{item.id}</span>
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </div>

                  <div className="my-auto space-y-3 px-2">
                    <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto border border-rose-100">
                      {iconMap[item.iconName] || <Heart className="w-5 h-5 text-rose-500" />}
                    </div>

                    <h4 className="font-serif font-bold text-stone-800 text-base">
                      {item.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
                      "{item.wish}"
                    </p>
                  </div>

                  <span className="text-[11px] text-stone-400 italic font-handwriting text-base">
                    Chạm để lật lại
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
