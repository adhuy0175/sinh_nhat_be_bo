import React, { useState } from 'react';
import { Mail, Heart, Sparkles, ScrollText, Check } from 'lucide-react';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';
import { romanticAudio } from '../utils/romanticAudio';
import { fireHeartConfetti } from '../utils/confettiHearts';

export const Scene5SecretLoveLetter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenLetter = () => {
    if (!isOpen) {
      romanticAudio.playSpecialEffect('envelope');
      fireHeartConfetti(0.5, 0.55);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const letter = BIRTHDAY_CONFIG.scene5;

  const handleCopyLetter = () => {
    const fullText = [
      letter.salutation,
      '',
      ...letter.paragraphs,
      '',
      letter.closing,
      '',
      letter.signature,
    ].join('\n');

    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="scene-letter" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8DCE4]/60 text-[#6B4B50] text-xs font-medium border border-[#C98799]/30">
          <Mail className="w-3.5 h-3.5 text-[#C98799]" />
          <span>Thư tay đặc biệt</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#6B4B50] tracking-tight">
          {letter.title}
        </h2>

        <p className="text-stone-600 text-sm sm:text-base font-light">
          {isOpen ? 'Lá thư từ tận đáy lòng gửi đến em yêu' : 'Chạm vào phong thư để mở lá thư anh viết riêng cho em'}
        </p>
      </div>

      {/* Sealed Envelope Container */}
      {!isOpen ? (
        <div className="flex flex-col items-center justify-center my-6">
          <div
            onClick={handleOpenLetter}
            className="group relative w-80 sm:w-96 h-56 bg-gradient-to-br from-[#FFF8F0] via-[#F8DCE4] to-[#FFF8F0] rounded-3xl p-6 shadow-2xl border-2 border-[#F8DCE4] flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-all duration-300"
          >
            {/* Soft pulsing glow */}
            <div className="absolute -inset-2 rounded-3xl bg-[#C98799]/20 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Vintage stamp in top corner */}
            <div className="self-end z-10">
              <div className="w-12 h-14 border-2 border-dashed border-[#C98799]/50 rounded-lg p-1.5 flex flex-col items-center justify-center bg-white/80 rotate-3 shadow-sm">
                <span className="text-[9px] font-mono text-[#C98799] font-bold">21.10</span>
                <Heart className="w-4 h-4 text-[#C98799] fill-[#F8DCE4]" />
                <span className="text-[8px] text-stone-400">LOVE</span>
              </div>
            </div>

            {/* Center Wax Seal */}
            <div className="z-10 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C98799] to-[#A86577] shadow-xl flex items-center justify-center text-white border-2 border-[#F8DCE4] group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 fill-white text-white drop-shadow" />
              </div>
              <span className="font-handwriting text-2xl text-[#6B4B50] font-medium">
                {letter.envelopeLabel}
              </span>
            </div>

            {/* Tap instruction */}
            <div className="z-10 flex items-center gap-1.5 text-xs text-[#C98799] font-medium pb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Chạm để mở niêm phong 💌</span>
            </div>
          </div>
        </div>
      ) : (
        /* Unfolded Letter Parchment */
        <div className="relative bg-[#FFF8F0] rounded-3xl shadow-2xl p-6 sm:p-12 border border-[#F8DCE4] transition-all duration-500 max-w-2xl mx-auto">
          {/* Subtle paper texture overlay */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-7 washi-tape rotate-[-0.5deg] z-10" />

          {/* Letter Header */}
          <div className="flex items-center justify-between border-b border-[#F8DCE4] pb-4 mb-6">
            <div className="flex items-center gap-2 text-[#C98799] text-xs sm:text-sm font-medium">
              <ScrollText className="w-4 h-4" />
              <span>{letter.letterTitle}</span>
            </div>
            <span className="font-mono text-xs text-stone-400">21.10.2026</span>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 text-[#6B4B50] leading-relaxed font-sans text-base sm:text-lg">
            <p className="font-serif text-xl sm:text-2xl font-semibold text-[#6B4B50] mb-4">
              {letter.salutation}
            </p>

            {letter.paragraphs.map((p, idx) => (
              <p key={idx} className="text-[#6B4B50]/90 font-light text-justify sm:text-left leading-relaxed">
                {p}
              </p>
            ))}

            <div className="pt-6 text-right space-y-1">
              <p className="font-serif text-xl font-semibold text-[#C98799]">
                {letter.closing}
              </p>
              <p className="font-handwriting text-2xl text-[#6B4B50]">
                {letter.signature}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 pt-4 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleOpenLetter}
              className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Gấp lại lá thư ✉️
            </button>

            <button
              onClick={handleCopyLetter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã sao chép thư</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>Lưu giữ lời yêu thương</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
