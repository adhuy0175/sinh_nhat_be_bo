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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel-warm border border-[#F8DCE4] shadow-sm">
          {/* Status message */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F8DCE4] flex items-center justify-center text-[#C98799] shrink-0">
              {showCelebrationBanner ? <Heart className="w-4 h-4 fill-[#C98799] text-[#C98799]" /> : <Calendar className="w-4 h-4" />}
            </div>

            <div>
              {showCelebrationBanner ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#C98799]">
                    Hôm nay là ngày đặc biệt!
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-[#6B4B50]">
                    21 tháng 10 năm 2026
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#6B4B50]">
                    Đếm ngược sinh nhật em yêu
                  </span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-500">Giờ Việt Nam (GMT+7)</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#6B4B50] font-medium">
                {showCelebrationBanner
                  ? `Chúc mừng sinh nhật ${BIRTHDAY_CONFIG.couple.girlfriendName}! Chúc em một ngày ngập tràn yêu thương ✨`
                  : 'Đang đếm từng phút giây đến ngày thiên thần của anh chào đời ✨'}
              </p>
            </div>
          </div>

          {/* Time Counter or Birthday Badge */}
          <div className="flex items-center gap-2 shrink-0">
            {!showCelebrationBanner ? (
              <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-[#C98799] bg-[#FFF8F0] px-3 py-1.5 rounded-xl border border-[#F8DCE4]">
                <div className="text-center">
                  <span className="font-bold text-sm text-[#C98799]">{timeLeft.days}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">ngày</span>
                </div>
                <span className="text-[#C98799]/50 font-sans pb-1">:</span>
                <div className="text-center">
                  <span className="font-bold text-sm text-[#6B4B50]">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">giờ</span>
                </div>
                <span className="text-[#C98799]/50 font-sans pb-1">:</span>
                <div className="text-center">
                  <span className="font-bold text-sm text-[#6B4B50]">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">phút</span>
                </div>
                <span className="text-[#C98799]/50 font-sans pb-1">:</span>
                <div className="text-center">
                  <span className="font-bold text-sm text-amber-600">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] text-stone-400 block -mt-0.5">giây</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#C98799] bg-[#F8DCE4]/60 px-3 py-1.5 rounded-xl border border-[#F8DCE4] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#C98799]" />
                <span>21.10.2026 🎉</span>
              </div>
            )}

            {/* Preview mode toggle for boyfriend */}
            <button
              onClick={onTogglePreviewMode}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                previewBirthdayMode
                  ? 'bg-[#F8DCE4] text-[#C98799] border-[#C98799]/40 font-medium'
                  : 'bg-white/80 hover:bg-[#F8DCE4]/40 text-[#6B4B50] border-[#F8DCE4]'
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
