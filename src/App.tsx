import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, SlidersHorizontal, Gift } from 'lucide-react';
import { BIRTHDAY_CONFIG, MemoryPhoto } from './config/birthdayConfig';
import { FloatingAtmosphere } from './components/FloatingAtmosphere';
import { CountdownHeader } from './components/CountdownHeader';
import { MusicControl } from './components/MusicControl';
import { Scene1Invitation } from './components/Scene1Invitation';
import { Scene2CakeReveal } from './components/Scene2CakeReveal';
import { Scene3MemoryScrapbook } from './components/Scene3MemoryScrapbook';
import { Scene4ReasonsILoveYou } from './components/Scene4ReasonsILoveYou';
import { Scene5SecretLoveLetter } from './components/Scene5SecretLoveLetter';
import { Scene6BirthdayGiftBox } from './components/Scene6BirthdayGiftBox';
import { Scene7FinalSurprise } from './components/Scene7FinalSurprise';
import { PhotoCustomizerModal } from './components/PhotoCustomizerModal';
import { fireHeartConfetti, fireBirthdayFireworks } from './utils/confettiHearts';
import { romanticAudio } from './utils/romanticAudio';

const LOCAL_STORAGE_KEY = 'romantic_birthday_custom_photos_v2';

export default function App() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [previewBirthdayMode, setPreviewBirthdayMode] = useState(true);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [photos, setPhotos] = useState<MemoryPhoto[]>(BIRTHDAY_CONFIG.scene3.photos);

  useEffect(() => {
    const unsub = romanticAudio.subscribe(() => {
      setIsAudioPlaying(romanticAudio.getIsPlaying());
    });
    return unsub;
  }, []);

  // Load custom photos from localStorage if saved by user
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPhotos(parsed);
        }
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const handleUpdatePhotos = (updated: MemoryPhoto[]) => {
    setPhotos(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or error
    }
  };

  const handleResetPhotos = () => {
    setPhotos(BIRTHDAY_CONFIG.scene3.photos);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      //
    }
  };

  const handleProceedFromScene1 = () => {
    setHasStarted(true);
    // Smooth scroll down to birthday cake section
    setTimeout(() => {
      document.getElementById('scene-cake')?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHasStarted(false);
  };

  const handleTopWishes = () => {
    fireHeartConfetti(0.85, 0.15);
    fireBirthdayFireworks();
  };

  return (
    <div className="relative min-h-screen bg-[#FFF9F9] text-stone-800 selection:bg-rose-200 selection:text-rose-900 font-sans">
      {/* Floating Ambient Atmosphere (balloons, hearts, particles, petals) */}
      <FloatingAtmosphere />

      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <header className="sticky top-0 z-40 w-full glass-panel-warm border-b border-rose-100/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-serif text-base sm:text-lg font-bold text-stone-900 hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="text-xl">🎂</span>
            <span>21.10.2026 · {BIRTHDAY_CONFIG.couple.girlfriendName}</span>
          </a>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-600">
            <button
              onClick={() => scrollToSection('scene-cake')}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Thổi nến
            </button>
            <button
              onClick={() => scrollToSection('scene-memories')}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Khoảnh khắc của em
            </button>
            <button
              onClick={() => scrollToSection('scene-reasons')}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Lời chúc tuổi mới
            </button>
            <button
              onClick={() => scrollToSection('scene-letter')}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Thư sinh nhật
            </button>
            <button
              onClick={() => scrollToSection('scene-gift')}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Hộp quà bí mật
            </button>
            <button
              onClick={() => scrollToSection('scene-final')}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pháo hoa
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => romanticAudio.toggle()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                isAudioPlaying
                  ? 'bg-rose-50 text-rose-600 border-rose-300 font-medium'
                  : 'bg-white/70 hover:bg-white text-stone-600 hover:text-rose-600 border-stone-200'
              }`}
              title="Phát / Dừng nhạc sinh nhật"
            >
              <span className={`text-sm ${isAudioPlaying ? 'animate-bounce' : ''}`}>🎵</span>
              <span className="hidden sm:inline">{isAudioPlaying ? 'Đang phát' : 'Bật nhạc'}</span>
            </button>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-rose-600 bg-white/70 hover:bg-white rounded-lg border border-stone-200 transition-colors cursor-pointer"
              title="Đổi hoặc thêm ảnh"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Đổi ảnh</span>
            </button>

            <button
              onClick={handleTopWishes}
              className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-pink-600 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Gửi ngàn lời chúc 💖</span>
            </button>
          </div>
        </div>
      </header>

      {/* Countdown or Birthday Greeting Header */}
      <CountdownHeader
        previewBirthdayMode={previewBirthdayMode}
        onTogglePreviewMode={() => setPreviewBirthdayMode(!previewBirthdayMode)}
      />

      {/* Main Storytelling Experience */}
      <main className="relative z-10 space-y-12 sm:space-y-20 pb-24">
        {/* Scene 1: Birthday Opening */}
        <Scene1Invitation onProceedToNext={handleProceedFromScene1} />

        {/* Scene 2: Birthday Cake & Celebration */}
        <div className={`transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-90'}`}>
          <Scene2CakeReveal onScrollToMemories={() => scrollToSection('scene-memories')} />
        </div>

        {/* Subtle decorative section divider */}
        <div className="flex items-center justify-center gap-4 py-4 text-rose-300">
          <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent w-36" />
          <Heart className="w-4 h-4 fill-rose-300" />
          <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent w-36" />
        </div>

        {/* Scene 3: Birthday Photo Gallery ("Những khoảnh khắc đáng yêu của em") */}
        <Scene3MemoryScrapbook
          photos={photos}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
        />

        {/* Subtle divider */}
        <div className="flex items-center justify-center gap-4 py-4 text-rose-300">
          <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent w-36" />
          <span className="text-sm font-handwriting text-rose-400">Tuổi mới thật rực rỡ</span>
          <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent w-36" />
        </div>

        {/* Scene 4: Birthday Wishes Cards */}
        <Scene4ReasonsILoveYou />

        {/* Scene 5: A Special Birthday Letter */}
        <Scene5SecretLoveLetter />

        {/* Scene 6: Birthday Surprise Gift Box */}
        <Scene6BirthdayGiftBox />

        {/* Scene 7: Grand Birthday Finale */}
        <Scene7FinalSurprise onReplayFromStart={handleReplay} />
      </main>

      {/* Floating Music Controller */}
      <MusicControl />

      {/* Photo Customizer Modal */}
      <PhotoCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        photos={photos}
        onUpdatePhotos={handleUpdatePhotos}
        onResetPhotos={handleResetPhotos}
      />

      {/* Romantic Birthday Footer */}
      <footer className="relative z-10 border-t border-rose-100/80 py-10 px-4 text-center glass-panel-warm">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-rose-500">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span className="font-handwriting text-2xl">Chúc mừng sinh nhật công chúa</span>
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>

          <p className="text-xs text-stone-500">
            Dành riêng tặng sinh nhật {BIRTHDAY_CONFIG.couple.girlfriendName} · 21.10.2026
          </p>

          <p className="text-[11px] text-stone-400">
            Món quà kỷ niệm được thiết kế với tất cả tình yêu thương của {BIRTHDAY_CONFIG.couple.boyfriendName}.
          </p>
        </div>
      </footer>
    </div>
  );
}
