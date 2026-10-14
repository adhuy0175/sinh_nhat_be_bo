import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, RefreshCw, Flame } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';
import { fireBirthdayFireworks, fireGrandHugCelebration } from '../utils/confettiHearts';
import { romanticAudio } from '../utils/romanticAudio';

interface Scene7FinalSurpriseProps {
  onReplayFromStart: () => void;
}

export const Scene7FinalSurprise: React.FC<Scene7FinalSurpriseProps> = ({ onReplayFromStart }) => {
  const [step, setStep] = useState<number>(0);
  const [hugGiven, setHugGiven] = useState(false);
  const [fireworksCount, setFireworksCount] = useState(0);

  useEffect(() => {
    // Sequence the emotional reveal steps
    const t1 = setTimeout(() => setStep(1), 700);   // "Em có biết hôm nay là ngày gì không? ✨"
    const t2 = setTimeout(() => {
      setStep(2);
      fireBirthdayFireworks();
    }, 2400);  // "Chúc em tuổi mới thật rực rỡ, hạnh phúc và luôn được yêu thương. Anh yêu em! ❤️"
    const t3 = setTimeout(() => setStep(3), 4400);  // "Happy Birthday, Công Chúa Của Anh! 🎂" + buttons

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleFireFireworks = () => {
    setFireworksCount((prev) => prev + 1);
    romanticAudio.playSpecialEffect('sparkle');
    fireBirthdayFireworks();
  };

  const handleReceiveHug = () => {
    setHugGiven(true);
    romanticAudio.playSpecialEffect('sparkle');
    romanticAudio.playSpecialEffect('heart');
    fireGrandHugCelebration();
  };

  const scene = BIRTHDAY_CONFIG.scene7;

  return (
    <section id="scene-final" className="relative min-h-screen flex items-center justify-center px-4 py-20 text-center overflow-hidden">
      {/* Cinematic Night-sky background effect with subtle stars */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-pink-100/30 to-[#FFE4E8]/60 -z-10" />

      {/* Floating Birthday Balloons in Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {[
          { x: 10, y: 30, color: '#fda4af', delay: 0 },
          { x: 88, y: 25, color: '#fcd34d', delay: 1.5 },
          { x: 18, y: 75, color: '#bae6fd', delay: 2.2 },
          { x: 82, y: 70, color: '#c4b5fd', delay: 0.8 },
        ].map((b, i) => (
          <div
            key={i}
            className="absolute animate-float-gentle opacity-70"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              animationDelay: `${b.delay}s`,
            }}
          >
            <div
              className="w-10 h-13 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] shadow-md relative"
              style={{ backgroundColor: b.color }}
            >
              <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white/70 rounded-full" />
            </div>
            <div className="w-0.5 h-8 bg-stone-300 mx-auto" />
          </div>
        ))}
      </div>

      {/* Twinkling stars in the scene */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              top: `${(i * 17) % 95}%`,
              left: `${(i * 23) % 95}%`,
              animationDelay: `${(i % 5) * 0.7}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]" />
          </div>
        ))}
      </div>

      <div className="max-w-3xl w-full mx-auto space-y-9 relative z-10">
        {/* Step 1: Question */}
        <div
          className={`transition-all duration-1000 transform ${
            step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="font-handwriting text-2xl sm:text-3xl text-rose-500 font-medium">
            {scene.question}
          </span>
        </div>

        {/* Step 2: Main Birthday Declaration */}
        <div
          className={`transition-all duration-1000 delay-300 transform ${
            step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="p-6 sm:p-8 rounded-3xl glass-panel-warm border-2 border-rose-200/90 shadow-2xl max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 leading-snug px-2">
              "{scene.finalWish}"
            </h2>
          </div>
        </div>

        {/* Step 3: "Happy Birthday, Công Chúa Của Anh!" & Date & Interactive Fireworks */}
        <div
          className={`transition-all duration-1000 delay-500 transform space-y-6 ${
            step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="inline-block relative">
            <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
              {scene.birthdayGreeting}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <p className="font-serif italic text-base sm:text-lg text-stone-600">
                {scene.dateGreeting}
              </p>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          {/* Interactive Celebration Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {/* Fireworks Button */}
            <button
              onClick={handleFireFireworks}
              className="group relative inline-flex items-center gap-2.5 px-7 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-medium text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-2xl animate-bounce">🎆</span>
              <span>{scene.fireworksButton}</span>
              {fireworksCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-white/30 rounded-full font-mono">
                  x{fireworksCount}
                </span>
              )}
            </button>

            {/* Hug Button */}
            <button
              onClick={handleReceiveHug}
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-full font-medium text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-2xl">🤗</span>
              <span>{scene.hugButtonText}</span>
              <Heart className="w-5 h-5 fill-white text-white group-hover:scale-125 transition-transform" />
            </button>
          </div>
        </div>

        {/* Hug Celebration Overlay Modal */}
        {hugGiven && (
          <div
            role="dialog"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setHugGiven(false)}
          >
            <div
              className="relative max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl border-2 border-rose-300 transform scale-100 animate-float-gentle"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Hearts in modal */}
              <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Heart className="w-10 h-10 fill-rose-500 animate-pulse" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                {scene.hugMessageTitle}
              </h3>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-light">
                {scene.hugMessageBody}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleReceiveHug();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-full text-sm shadow-md transition-transform hover:scale-102 cursor-pointer"
                >
                  Nhận thêm một cái ôm nữa! 💖
                </button>

                <button
                  onClick={() => setHugGiven(false)}
                  className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  Khép lại cái ôm ấm áp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Replay action */}
        {step >= 3 && (
          <div className="pt-10">
            <button
              onClick={onReplayFromStart}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-rose-600 transition-colors py-2 px-4 rounded-full hover:bg-white/60 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Xem lại từ đầu món quà sinh nhật này 🎂</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
