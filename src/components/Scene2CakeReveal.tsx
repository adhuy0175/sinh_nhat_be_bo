import React, { useState } from 'react';
import { Sparkles, Heart, Flame } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';
import { romanticAudio } from '../utils/romanticAudio';
import { fireHeartConfetti } from '../utils/confettiHearts';

interface Scene2CakeRevealProps {
  onScrollToMemories: () => void;
}

export const Scene2CakeReveal: React.FC<Scene2CakeRevealProps> = ({ onScrollToMemories }) => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [hasBlown, setHasBlown] = useState(false);
  const [wishMade, setWishMade] = useState(false);

  const handleBlowCandles = () => {
    if (!candlesLit) return;

    // SFX: blow wind whoosh + sparkle
    romanticAudio.playSpecialEffect('blow');
    setCandlesLit(false);
    setHasBlown(true);

    setTimeout(() => {
      romanticAudio.playSpecialEffect('sparkle');
      fireHeartConfetti(0.5, 0.45);
      setWishMade(true);
    }, 600);
  };

  const handleRelight = () => {
    setCandlesLit(true);
    setHasBlown(false);
    setWishMade(false);
  };

  return (
    <section id="scene-cake" className="relative min-h-[95vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full mx-auto text-center">
        {/* Animated Main Heading */}
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8DCE4]/60 text-[#6B4B50] text-xs font-medium tracking-wide border border-[#C98799]/30">
            <Heart className="w-3.5 h-3.5 fill-[#C98799] text-[#C98799]" />
            <span>{BIRTHDAY_CONFIG.scene2.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#6B4B50] tracking-tight leading-tight">
            {BIRTHDAY_CONFIG.scene2.title}
          </h2>

          <p className="text-base sm:text-lg text-stone-600 max-w-lg mx-auto font-light leading-relaxed">
            {BIRTHDAY_CONFIG.scene2.subheading}
          </p>
        </div>

        {/* 3D-styled Interactive Birthday Cake */}
        <div className="relative my-8 flex flex-col items-center justify-center">
          <div className="relative w-72 sm:w-80 h-72 flex flex-col items-center justify-end">
            {/* Candle Flames & Smoke */}
            <div className="absolute top-6 flex items-end justify-center gap-6 z-20">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* Flame or Smoke */}
                  {candlesLit ? (
                    <div className="relative animate-candle-flame">
                      {/* Glow halo */}
                      <div className="absolute -inset-2 rounded-full bg-amber-400/40 blur-md" />
                      <div className="w-4 h-6 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full shadow-lg" />
                      <div className="absolute inset-x-1 bottom-0.5 h-3 bg-white/70 rounded-full blur-[0.5px]" />
                    </div>
                  ) : (
                    <div className="relative h-6 flex justify-center">
                      {/* Little smoke trails fading out */}
                      <div className="w-1.5 h-5 rounded-full bg-stone-300/60 blur-[1px] animate-pulse -translate-y-2 opacity-60" />
                    </div>
                  )}

                  {/* Candle Wick */}
                  <div className="w-0.5 h-3 bg-stone-800 -mt-0.5 z-10" />

                  {/* Candle Body */}
                  <div className="w-3 h-14 bg-gradient-to-b from-rose-200 via-pink-100 to-rose-300 rounded-t-sm shadow-sm border border-rose-300/40 relative overflow-hidden">
                    {/* Spiral stripes on candle */}
                    <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,#f43f5e,#f43f5e_3px,transparent_3px,transparent_6px)]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Cake Top Tier */}
            <div className="relative z-10 w-44 h-16 bg-gradient-to-b from-[#FFF5EC] to-[#FDE8E9] rounded-2xl shadow-md border border-rose-200/80 flex flex-col items-center justify-between p-2">
              {/* Cream drips */}
              <div className="w-full flex justify-around">
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    className="w-4 h-3 bg-white rounded-b-full shadow-inner -mt-2"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-handwriting text-rose-500 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Happy Birthday</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>

            {/* Cake Middle Tier */}
            <div className="relative z-0 w-60 h-20 -mt-2 bg-gradient-to-b from-[#FCE7F3] via-[#FFE4E6] to-[#FED7AA] rounded-2xl shadow-lg border border-rose-200/90 flex flex-col justify-between p-2">
              <div className="w-full flex justify-around">
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className="w-5 h-4 bg-white/90 rounded-b-full shadow-inner -mt-2"
                  />
                ))}
              </div>

              {/* Decorative strawberry & rose rosettes */}
              <div className="flex justify-around items-center px-4">
                <span className="text-sm">🍓</span>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-sm">🌸</span>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-sm">🍓</span>
              </div>
            </div>

            {/* Cake Base Plate / Stand */}
            <div className="w-72 h-4 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 rounded-full shadow-xl border-t border-amber-300 -mt-1 flex items-center justify-center">
              <div className="w-40 h-1 bg-amber-400/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 space-y-4">
          {candlesLit ? (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-stone-500 italic font-handwriting text-lg">
                "{BIRTHDAY_CONFIG.scene2.blowInstructions}"
              </p>

              <button
                onClick={handleBlowCandles}
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#C98799] to-[#A86577] hover:from-[#A86577] hover:to-[#8E4E5F] text-white rounded-full font-medium text-base shadow-lg shadow-[#C98799]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Flame className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform" />
                <span>{BIRTHDAY_CONFIG.scene2.candleButton}</span>
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl glass-panel-warm border border-[#F8DCE4] shadow-xl max-w-lg mx-auto space-y-4 animate-float-gentle">
              <div className="w-10 h-10 rounded-full bg-[#F8DCE4] text-[#C98799] flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5 fill-[#C98799]" />
              </div>

              <p className="font-serif text-lg sm:text-xl text-[#6B4B50] font-medium leading-relaxed">
                "{BIRTHDAY_CONFIG.scene2.candleBlownMessage}"
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onScrollToMemories}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#C98799] to-[#A86577] hover:from-[#A86577] hover:to-[#8E4E5F] text-white rounded-full text-sm font-medium shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  Ngắm những khoảnh khắc đáng yêu của em 📸
                </button>

                <button
                  onClick={handleRelight}
                  className="px-4 py-2 text-stone-500 hover:text-[#6B4B50] hover:bg-[#F8DCE4]/40 rounded-full text-xs transition-colors cursor-pointer"
                >
                  Thắp lại nến 🕯️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
