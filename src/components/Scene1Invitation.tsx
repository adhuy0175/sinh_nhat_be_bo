import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, Heart, Clock } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';
import { romanticAudio } from '../utils/romanticAudio';
import { fireHeartConfetti } from '../utils/confettiHearts';

interface Scene1InvitationProps {
  onProceedToNext: () => void;
}

export const Scene1Invitation: React.FC<Scene1InvitationProps> = ({ onProceedToNext }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      // Target: 00:00 ngày 21.10.2026 giờ Việt Nam (GMT+7)
      const target = new Date('2026-10-21T00:00:00+07:00').getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setCountdown({
          days,
          hours,
          minutes,
          seconds,
          isPast: false,
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Audio SFX + start romantic music
    romanticAudio.playSpecialEffect('envelope');
    romanticAudio.startAudio();

    // Confetti burst
    fireHeartConfetti(0.5, 0.5);

    // Transition smoothly after envelope opens
    setTimeout(() => {
      onProceedToNext();
    }, 1800);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative floating birthday balloons left and right */}
      <div className="absolute top-12 left-4 sm:left-12 pointer-events-none hidden sm:flex flex-col items-center animate-float-gentle opacity-85">
        <div className="w-12 h-16 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-tr from-rose-400 to-pink-300 shadow-md relative">
          <div className="absolute top-2 left-2 w-2.5 h-2.5 bg-white/60 rounded-full" />
        </div>
        <div className="w-0.5 h-10 bg-stone-300" />
      </div>

      <div className="absolute top-20 right-4 sm:right-16 pointer-events-none hidden sm:flex flex-col items-center animate-float-gentle opacity-85" style={{ animationDelay: '-2s' }}>
        <div className="w-14 h-18 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-tr from-amber-300 to-yellow-200 shadow-md relative">
          <div className="absolute top-2 left-2 w-3 h-3 bg-white/70 rounded-full" />
        </div>
        <div className="w-0.5 h-12 bg-stone-300" />
      </div>

      <div className="max-w-xl w-full text-center mx-auto relative z-10">
        {/* Birthday Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs sm:text-sm font-medium mb-6 shadow-sm border border-rose-200/60">
          <span className="text-base">🎂</span>
          <span className="font-semibold tracking-wide">21.10.2026</span>
          <span className="text-rose-300">·</span>
          <span>{BIRTHDAY_CONFIG.scene1.badge}</span>
        </div>

        {/* Envelope & Letter Container */}
        <div className="relative mb-8 flex justify-center">
          <div
            className={`relative transition-all duration-700 transform ${
              isOpening ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            {/* Glowing Aura */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-rose-300/30 via-pink-200/40 to-amber-200/30 blur-2xl animate-pulse-glow" />

            {/* Realistic Envelope Graphic */}
            <div className="relative w-72 sm:w-80 h-52 sm:h-56 bg-gradient-to-br from-[#FFF4EB] to-[#FFE3E8] rounded-2xl shadow-2xl border border-rose-200/80 p-5 flex flex-col items-center justify-between overflow-hidden">
              {/* Envelope flap folds (SVG) */}
              <div
                className={`absolute top-0 left-0 right-0 h-28 origin-top transition-transform duration-700 ease-in-out z-20 ${
                  isOpening ? '-rotate-x-180 -translate-y-2' : ''
                }`}
              >
                <svg
                  viewBox="0 0 320 110"
                  className="w-full h-full fill-[#FFE1E7] drop-shadow-sm stroke-rose-200/70"
                >
                  <polygon points="0,0 320,0 160,105" />
                </svg>
              </div>

              {/* Heart wax seal */}
              <div
                className={`absolute top-20 z-30 transition-all duration-500 transform ${
                  isOpening ? 'opacity-0 scale-150 rotate-12' : 'scale-100 hover:scale-110'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 shadow-md flex items-center justify-center text-white border-2 border-rose-200 cursor-pointer">
                  <Heart className="w-6 h-6 fill-white text-white drop-shadow" />
                </div>
              </div>

              {/* Letter paper peeking out when opening */}
              <div
                className={`absolute inset-x-4 transition-all duration-700 z-10 bg-white rounded-t-xl p-4 shadow-md border border-rose-100 ${
                  isOpening ? '-translate-y-24 opacity-100' : 'translate-y-6 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between border-b border-rose-100 pb-2 mb-2">
                  <span className="font-handwriting text-rose-500 text-lg">Sinh nhật 21.10.2026</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="h-1.5 bg-rose-100 rounded w-3/4 mb-1.5" />
                <div className="h-1.5 bg-rose-100/60 rounded w-full mb-1.5" />
                <div className="h-1.5 bg-rose-100/40 rounded w-1/2" />
              </div>

              {/* Decorative stamp in top right */}
              <div className="self-end z-0">
                <div className="w-10 h-12 border-2 border-dashed border-rose-300 rounded p-1 flex flex-col items-center justify-center bg-rose-50/60 rotate-3">
                  <span className="text-[9px] uppercase font-mono text-rose-400 font-semibold tracking-tighter">OCT 21</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300" />
                </div>
              </div>

              <div className="w-full text-center z-10 pt-8">
                <p className="font-handwriting text-xl text-stone-700 font-bold">Gửi: {BIRTHDAY_CONFIG.couple.girlfriendName} 🌸</p>
                <p className="text-[11px] text-stone-400 font-sans tracking-wide">Từ {BIRTHDAY_CONFIG.couple.boyfriendName} yêu thương</p>
              </div>
            </div>
          </div>
        </div>

        {/* Story Text */}
        <div className="space-y-4 mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
            {BIRTHDAY_CONFIG.scene1.title}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-light max-w-md mx-auto leading-relaxed">
            {BIRTHDAY_CONFIG.scene1.subtitle}
          </p>
        </div>

        {/* Small Countdown Clock to 00:00 on October 21, 2026 */}
        <div className="mb-8">
          <div className="inline-block p-4 sm:p-5 rounded-2xl glass-panel-warm border border-rose-200/80 shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {countdown.isPast
                  ? 'Đã đến ngày sinh nhật của công chúa! 🎂'
                  : 'Thời gian còn lại đến 00:00 ngày 21.10.2026'}
              </span>
            </div>

            {countdown.isPast ? (
              <div className="text-sm font-serif font-bold text-rose-700 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Chúc mừng sinh nhật em yêu của anh!</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                {/* Ngày */}
                <div className="bg-white/80 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-rose-100 shadow-sm min-w-[58px]">
                  <span className="block font-serif text-lg sm:text-2xl font-bold text-rose-600 leading-tight">
                    {String(countdown.days).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wider">
                    Ngày
                  </span>
                </div>

                {/* Giờ */}
                <div className="bg-white/80 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-rose-100 shadow-sm min-w-[58px]">
                  <span className="block font-serif text-lg sm:text-2xl font-bold text-stone-800 leading-tight">
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wider">
                    Giờ
                  </span>
                </div>

                {/* Phút */}
                <div className="bg-white/80 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-rose-100 shadow-sm min-w-[58px]">
                  <span className="block font-serif text-lg sm:text-2xl font-bold text-stone-800 leading-tight">
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wider">
                    Phút
                  </span>
                </div>

                {/* Giây */}
                <div className="bg-white/80 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-rose-100 shadow-sm min-w-[58px]">
                  <span className="block font-serif text-lg sm:text-2xl font-bold text-amber-600 leading-tight animate-pulse">
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] text-stone-500 font-medium uppercase tracking-wider">
                    Giây
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Glowing Button */}
        <div className="flex flex-col items-center justify-center gap-3">
          <button
            onClick={handleOpenEnvelope}
            disabled={isOpening}
            className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium text-base text-white shadow-xl transition-all duration-300 ${
              isOpening
                ? 'bg-rose-400 cursor-wait scale-95'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 hover:shadow-rose-400/50 hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {/* Sparkle ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-400 to-amber-300 opacity-60 blur-md group-hover:opacity-100 transition-opacity" />

            <span className="relative flex items-center gap-2.5">
              <Mail className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{isOpening ? 'Đang mở món quà bí mật...' : BIRTHDAY_CONFIG.scene1.buttonText}</span>
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
            </span>
          </button>

          <p className="text-xs text-stone-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
            Nhấn vào đây để cùng anh mở ra điều kỳ diệu cho ngày sinh nhật
          </p>
        </div>
      </div>
    </section>
  );
};
