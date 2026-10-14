import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';

interface CountdownHeaderProps {
  previewBirthdayMode: boolean;
  onTogglePreviewMode: () => void;
}

export const CountdownHeader: React.FC<CountdownHeaderProps> = ({
  previewBirthdayMode,
  onTogglePreviewMode,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isBirthdayOrPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isBirthdayOrPast: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // 2026-10-21 00:00:00 GMT+0700 (Asia/Ho_Chi_Minh)
      const targetTime = new Date('2026-10-21T00:00:00+07:00').getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isBirthdayOrPast: true,
        });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isBirthdayOrPast: false,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const showCelebrationBanner = timeLeft.isBirthdayOrPast || previewBirthdayMode;

  return (
    <header className="relative w-full z-30 pt-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel-warm border border-rose-100 shadow-sm">
          {/* Status message */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              {showCelebrationBanner ? <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> : <Calendar className="w-4 h-4" />}
            </div>

            <div>
              {showCelebrationBanner ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-rose-600">
                    Hôm nay là ngày đặc biệt!
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-600">
                    21 tháng 10 năm 2026
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-600">
                    Đếm ngược sinh nhật em yêu
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-500">Giờ Việt Nam (GMT+7)</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-stone-700 font-medium">
                {showCelebrationBanner
                  ? `Chúc mừng sinh nhật ${BIRTHDAY_CONFIG.couple.girlfriendName}! Chúc em một ngày ngập tràn yêu thương ✨`
                  : 'Đang đếm từng phút giây đến ngày thiên thần của anh chào đời ✨'}
              </p>
            </div>
          </div>

          {/* Time Counter or Birthday Badge */}
          <div className="flex items-center gap-2 shrink-0">
            {!showCelebrationBanner ? (
              <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-rose-700 bg-rose-50/80 px-3 py-1.5 rounded-xl border border-rose-200/60">
                <div className="text-center">
                  <span className="font-bold text-sm">{timeLeft.days}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">ngày</span>
                </div>
                <span className="text-rose-300 font-sans pb-1">:</span>
                <div className="text-center">
                  <span className="font-bold text-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">giờ</span>
                </div>
                <span className="text-rose-300 font-sans pb-1">:</span>
                <div className="text-center">
                  <span className="font-bold text-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">phút</span>
                </div>
                <span className="text-rose-300 font-sans pb-1">:</span>
                <div className="text-center">
                  <span className="font-bold text-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">giây</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200/80 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>21.10.2026 🎉</span>
              </div>
            )}

            {/* Preview mode toggle for boyfriend */}
            <button
              onClick={onTogglePreviewMode}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                previewBirthdayMode
                  ? 'bg-rose-100 text-rose-700 border-rose-300 font-medium'
                  : 'bg-white/80 hover:bg-rose-50 text-stone-500 border-stone-200'
              }`}
              title="Chuyển đổi trạng thái xem trước ngày sinh nhật"
            >
              {previewBirthdayMode ? 'Đang xem trước' : 'Xem trước'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
