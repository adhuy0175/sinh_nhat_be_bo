import React, { useState } from 'react';
import { Gift, Sparkles, Heart, Check, RotateCcw } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';
import { romanticAudio } from '../utils/romanticAudio';
import { fireHeartConfetti } from '../utils/confettiHearts';

export const Scene6BirthdayGiftBox: React.FC = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [customNote, setCustomNote] = useState(BIRTHDAY_CONFIG.scene6.secretNote);
  const [claimedVouchers, setClaimedVouchers] = useState<Record<number, boolean>>({});

  const handleOpenGift = () => {
    if (isOpened) return;
    setIsOpened(true);
    romanticAudio.playSpecialEffect('sparkle');
    romanticAudio.playSpecialEffect('heart');
    fireHeartConfetti(0.5, 0.5);
  };

  const handleClaimVoucher = (idx: number) => {
    setClaimedVouchers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
    romanticAudio.playSpecialEffect('sparkle');
  };

  const giftConfig = BIRTHDAY_CONFIG.scene6;

  return (
    <section id="scene-gift" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8DCE4]/60 text-[#6B4B50] text-xs font-medium border border-[#C98799]/30">
          <Gift className="w-3.5 h-3.5 text-[#C98799]" />
          <span>{giftConfig.badge}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#6B4B50] tracking-tight">
          {giftConfig.title}
        </h2>

        <p className="text-stone-600 text-sm sm:text-base font-light">
          {giftConfig.subtitle}
        </p>
      </div>

      {/* Gift Box Container */}
      {!isOpened ? (
        <div className="flex flex-col items-center justify-center my-8">
          <div
            onClick={handleOpenGift}
            className="group relative cursor-pointer flex flex-col items-center transition-all duration-300 hover:scale-105"
          >
            {/* Glowing Aura halo */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-rose-400/30 via-pink-300/40 to-amber-300/30 blur-2xl animate-pulse-glow" />

            {/* Gift Box 3D Graphic */}
            <div className="relative w-64 sm:w-72 h-64 sm:h-72 flex flex-col items-center justify-end">
              {/* Ribbon Bow on Top */}
              <div className="absolute top-2 z-30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-md flex items-center justify-center border-2 border-white">
                  <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                {/* Ribbon loops */}
                <div className="absolute -left-6 top-1 w-8 h-8 rounded-full border-4 border-amber-400 -rotate-45" />
                <div className="absolute -right-6 top-1 w-8 h-8 rounded-full border-4 border-amber-400 rotate-45" />
              </div>

              {/* Gift Box Lid */}
              <div className="relative z-20 w-60 sm:w-68 h-14 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-2xl shadow-xl border-t border-rose-300 flex items-center justify-center overflow-hidden">
                {/* Vertical Ribbon */}
                <div className="w-8 h-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 shadow-sm" />
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/10" />
              </div>

              {/* Gift Box Body */}
              <div className="relative z-10 w-52 sm:w-60 h-44 -mt-2 bg-gradient-to-b from-rose-400 via-pink-500 to-rose-600 rounded-b-3xl shadow-2xl border-x border-b border-rose-300 flex items-center justify-center overflow-hidden">
                {/* Vertical Ribbon */}
                <div className="w-8 h-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 shadow-inner" />
                {/* Horizontal Ribbon */}
                <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 shadow-inner" />

                {/* Sparkling dots on box */}
                <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-white/40" />
                <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Prompt */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <button className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full text-sm font-medium shadow-md flex items-center gap-2 transition-transform group-hover:scale-105">
                <Gift className="w-4 h-4 text-amber-200" />
                <span>{giftConfig.tapPrompt}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Revealed Gift Voucher & Birthday Surprises */
        <div className="space-y-6 max-w-2xl mx-auto animate-float-gentle">
          {/* Main Gold Voucher Card */}
          <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FFF8F0] to-[#FEF3C7]/60 rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-amber-300/80 overflow-hidden">
            {/* Corner Ribbons */}
            <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
              <div className="absolute transform rotate-45 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-mono text-[9px] font-bold py-1 right-[-35px] top-[24px] w-[140px] text-center shadow-md">
                VIP BIRTHDAY
              </div>
            </div>

            {/* Voucher Header */}
            <div className="text-center mb-8 border-b border-amber-200/80 pb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-3 shadow-inner">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {giftConfig.voucherTitle}
              </h3>

              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {giftConfig.voucherSubtitle}
              </p>
            </div>

            {/* List of 4 Privilege Coupons */}
            <div className="space-y-3.5">
              {giftConfig.giftItems.map((item, idx) => {
                const isClaimed = !!claimedVouchers[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => handleClaimVoucher(idx)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                      isClaimed
                        ? 'bg-[#F8DCE4]/60 border-[#C98799]/40 shadow-sm'
                        : 'bg-white/80 hover:bg-white border-[#F8DCE4] hover:border-[#C98799]/40 shadow-sm hover:shadow'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl sm:text-3xl shrink-0 select-none">{item.icon}</span>
                      <div className="text-left">
                        <h4 className="font-serif font-bold text-[#6B4B50] text-sm sm:text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs text-stone-500 font-light mt-0.5">
                          {item.detail}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                        isClaimed
                          ? 'bg-[#C98799] text-white'
                          : 'bg-[#F8DCE4] hover:bg-[#F8DCE4]/80 text-[#6B4B50]'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã nhận!</span>
                        </>
                      ) : (
                        <span>Nhận voucher</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Boyfriend's Secret Message */}
            <div className="mt-8 pt-6 border-t border-[#F8DCE4]">
              <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#F8DCE4] flex items-start gap-3">
                <Heart className="w-5 h-5 text-[#C98799] fill-[#C98799] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-[#C98799] block mb-1">
                    Lời nhắn gửi bí mật từ {BIRTHDAY_CONFIG.couple.boyfriendName}:
                  </span>
                  <p className="font-handwriting text-xl text-[#6B4B50]">
                    "{customNote}"
                  </p>
                </div>
              </div>
            </div>

            {/* Voucher Footer Reset / Close */}
            <div className="mt-6 flex items-center justify-between text-xs text-stone-400">
              <span>Mã vé: HBD-21102026-PRINCESS</span>
              <button
                onClick={() => setIsOpened(false)}
                className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đóng hộp quà</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
