import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sparkles, Upload, AlertCircle, RotateCcw } from 'lucide-react';
import { romanticAudio } from '../utils/romanticAudio';
import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';

interface MusicControlProps {
  onCustomTrackLoaded?: (url: string) => void;
}

export const MusicControl: React.FC<MusicControlProps> = ({ onCustomTrackLoaded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [trackTitle, setTrackTitle] = useState(romanticAudio.getCurrentTrackTitle());
  const [trackArtist, setTrackArtist] = useState(romanticAudio.getCurrentTrackArtist());
  const [isCustomTrack, setIsCustomTrack] = useState(romanticAudio.isCustomTrack());
  const [isUsingSynth, setIsUsingSynth] = useState(romanticAudio.isUsingSynthesizer());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const updateState = () => {
      setIsPlaying(romanticAudio.getIsPlaying());
      setIsMuted(romanticAudio.getIsMuted());
      setTrackTitle(romanticAudio.getCurrentTrackTitle());
      setTrackArtist(romanticAudio.getCurrentTrackArtist());
      setIsCustomTrack(romanticAudio.isCustomTrack());
      setIsUsingSynth(romanticAudio.isUsingSynthesizer());
      setErrorMessage(romanticAudio.getPlaybackError());
    };

    updateState();
    const unsubscribe = romanticAudio.subscribe(updateState);
    return unsubscribe;
  }, []);

  const handleTogglePlay = () => {
    // Always toggle the currently selected track (never reset to default)
    romanticAudio.toggle();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    romanticAudio.toggleMute();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime-type or file extension
    const isAudioType = file.type.startsWith('audio/') || 
      /\.(mp3|wav|m4a|aac|ogg|flac|weba)$/i.test(file.name);

    if (!isAudioType) {
      setErrorMessage('Định dạng tệp không hợp lệ. Vui lòng chọn tệp âm thanh MP3, WAV hoặc M4A.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsLoadingFile(true);
      setErrorMessage(null);
      romanticAudio.clearPlaybackError();

      // Create new blob object URL
      const url = URL.createObjectURL(file);
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');

      // Immediately replace track and start playing
      const success = await romanticAudio.replaceAudioTrack(
        url,
        cleanFileName,
        'Tệp MP3 bạn tải lên'
      );

      if (success) {
        onCustomTrackLoaded?.(url);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMessage('Không thể phát tệp âm thanh này. Vui lòng thử lại với một file MP3 khác.');
    } finally {
      setIsLoadingFile(false);
      // Reset input value so user can upload the same file again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRevertDefault = async () => {
    setErrorMessage(null);
    romanticAudio.clearPlaybackError();
    await romanticAudio.revertToDefault();
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Expanded popout card */}
      {isExpanded && (
        <div className="mb-3 p-4 rounded-2xl glass-panel shadow-xl border border-rose-100 w-80 transition-all bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-rose-500 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Âm nhạc lãng mạn
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-stone-600 text-xs px-1.5 py-0.5 rounded cursor-pointer"
              aria-label="Đóng bảng nhạc"
            >
              ✕
            </button>
          </div>

          {/* Current track information */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-serif text-sm font-medium text-stone-800 line-clamp-1">
                {trackTitle}
              </p>
              {isCustomTrack && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-rose-100 text-rose-700 rounded-full shrink-0">
                  Tùy chỉnh
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {isUsingSynth ? 'Giai điệu hộp nhạc mộc (Acoustic Synthesizer)' : trackArtist}
            </p>
          </div>

          {/* Error Message if playback failed */}
          {errorMessage && (
            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1">
                <p className="font-medium">Lỗi phát nhạc</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{errorMessage}</p>
                <button
                  onClick={handleRevertDefault}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold underline hover:text-rose-900 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Khôi phục nhạc mặc định
                </button>
              </div>
            </div>
          )}

          {/* Controls: Play/Pause, Mute, Revert */}
          <div className="flex items-center justify-between pt-2 border-t border-rose-100/60">
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Phát nhạc
                  </>
                )}
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1.5 text-stone-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-rose-500" />}
              </button>
            </div>

            {isCustomTrack && (
              <button
                onClick={handleRevertDefault}
                className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                title="Khôi phục bài nhạc gốc 'Thế Giới Của Anh'"
              >
                <RotateCcw className="w-3 h-3" /> Mặc định
              </button>
            )}
          </div>

          {/* Custom MP3 Upload with same-file support */}
          <div className="mt-3 pt-2.5 border-t border-rose-100/40">
            <label className="text-[11px] text-stone-600 hover:text-rose-600 cursor-pointer flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60 transition-colors font-medium">
              <Upload className="w-3.5 h-3.5 text-rose-500" />
              <span>{isLoadingFile ? 'Đang nạp file MP3...' : 'Tải lên bài hát MP3 khác'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                onClick={(e) => {
                  // Reset value so uploading the same file again triggers onChange
                  (e.target as HTMLInputElement).value = '';
                }}
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoadingFile}
              />
            </label>
            <p className="text-[10px] text-stone-400 text-center mt-1">
              Hỗ trợ MP3, WAV, M4A · Tự động phát ngay sau khi chọn
            </p>
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-lg transition-all duration-300 border cursor-pointer ${
            isPlaying
              ? 'bg-white/90 text-rose-600 border-rose-200 shadow-rose-200/50'
              : 'bg-white/80 text-stone-600 border-stone-200 hover:border-rose-300'
          }`}
          aria-label={isPlaying ? 'Dừng phát nhạc' : 'Bật nhạc lãng mạn'}
        >
          <div className={`relative flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
            <Music className="w-4 h-4 text-rose-500" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            )}
          </div>

          <span className="text-xs font-medium tracking-tight">
            {isPlaying ? (isUsingSynth ? 'Hộp nhạc' : 'Đang phát') : 'Nhạc nền'}
          </span>

          <button
            onClick={handleToggleMute}
            className="p-0.5 hover:text-rose-600 transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-stone-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-rose-500" />
            )}
          </button>
        </button>

        {/* More details trigger */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 bg-white/80 hover:bg-white text-stone-500 hover:text-rose-600 rounded-full shadow-md border border-stone-200 transition-colors cursor-pointer"
          title="Tùy chỉnh âm thanh"
          aria-label="Mở tùy chỉnh âm thanh"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
