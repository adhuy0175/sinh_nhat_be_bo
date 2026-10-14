import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';

/**
 * Romantic Audio Engine:
 * - Plays custom or default MP3 audio tracks
 * - Immediate and safe audio track replacement with full race condition protection
 * - Automatic blob URL cleanup
 * - Session-persistent track selection
 * - Acoustic music box / piano synthesizer fallback
 * - Special celebratory sound effects (sparkle, candle blow, heart chime, envelope)
 */

interface SessionTrackData {
  src: string;
  title: string;
  artist: string;
  isCustom: boolean;
}

const SESSION_STORAGE_KEY = 'romantic_birthday_audio_track_v1';

class RomanticAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.7;
  private audioElement: HTMLAudioElement | null = null;
  private synthTimer: number | null = null;
  private step = 0;
  private usingSynth = false;
  private listeners: Array<() => void> = [];

  // Track info & state
  private currentTrackSrc: string = BIRTHDAY_CONFIG.music.src;
  private currentTrackTitle: string = BIRTHDAY_CONFIG.music.title;
  private currentTrackArtist: string = BIRTHDAY_CONFIG.music.artist;
  private isCustom = false;
  private currentBlobUrl: string | null = null;
  private playbackError: string | null = null;

  // Race condition protection
  private operationToken = 0;
  private pendingPlayPromise: Promise<void> | null = null;

  constructor() {
    this.restoreFromSession();
  }

  private restoreFromSession() {
    try {
      if (typeof window === 'undefined') return;
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const data: SessionTrackData = JSON.parse(saved);
        // Note: Blob URLs do not survive full reload, only remember if valid URL
        if (data.src && !data.src.startsWith('blob:')) {
          this.currentTrackSrc = data.src;
          this.currentTrackTitle = data.title || BIRTHDAY_CONFIG.music.title;
          this.currentTrackArtist = data.artist || BIRTHDAY_CONFIG.music.artist;
          this.isCustom = Boolean(data.isCustom);
        } else if (data.isCustom) {
          // If was custom blob, title remembered but fallback src to default
          this.currentTrackTitle = data.title || 'Bản nhạc tùy chọn';
        }
      }
    } catch {
      // Ignore storage error
    }
  }

  private saveToSession() {
    try {
      if (typeof window === 'undefined') return;
      const data: SessionTrackData = {
        src: this.currentTrackSrc.startsWith('blob:') ? '' : this.currentTrackSrc,
        title: this.currentTrackTitle,
        artist: this.currentTrackArtist,
        isCustom: this.isCustom,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Audio listener error:', err);
      }
    });
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrackSrc(): string {
    return this.currentTrackSrc;
  }

  public getCurrentTrackTitle(): string {
    return this.currentTrackTitle;
  }

  public getCurrentTrackArtist(): string {
    return this.currentTrackArtist;
  }

  public isCustomTrack(): boolean {
    return this.isCustom;
  }

  public getPlaybackError(): string | null {
    return this.playbackError;
  }

  public clearPlaybackError(): void {
    this.playbackError = null;
    this.notify();
  }

  public isUsingSynthesizer(): boolean {
    return this.usingSynth;
  }

  /**
   * Dedicated method to safely replace the active audio track with a new source.
   * Handles stopping current audio, stopping synth, cleaning up old blob URLs,
   * setting the new source, resetting time, loading, and playing immediately.
   */
  public async replaceAudioTrack(
    newSrc: string,
    title?: string,
    artist?: string
  ): Promise<boolean> {
    const currentOp = ++this.operationToken;
    this.playbackError = null;

    // 1. Immediately stop synthesizer fallback if running
    this.stopSynth();

    // 2. Immediately stop & pause current audio element
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {
        // Ignore pause error
      }
    }
    this.isPlaying = false;
    this.notify();

    // 3. Clean up previous blob URL if different from newSrc
    if (this.currentBlobUrl && this.currentBlobUrl !== newSrc) {
      try {
        URL.revokeObjectURL(this.currentBlobUrl);
      } catch {
        // Ignore revoke error
      }
      this.currentBlobUrl = null;
    }

    if (newSrc.startsWith('blob:')) {
      this.currentBlobUrl = newSrc;
    }

    // 4. Update track info & session state
    this.currentTrackSrc = newSrc;
    this.currentTrackTitle = title || (newSrc === BIRTHDAY_CONFIG.music.src ? BIRTHDAY_CONFIG.music.title : 'Bản nhạc bạn chọn');
    this.currentTrackArtist = artist || (newSrc === BIRTHDAY_CONFIG.music.src ? BIRTHDAY_CONFIG.music.artist : 'Tệp MP3 cá nhân');
    this.isCustom = newSrc !== BIRTHDAY_CONFIG.music.src;
    this.saveToSession();

    // 5. Ensure audio context is ready
    this.initAudioContext();

    // 6. Setup or reuse audio element
    if (!this.audioElement) {
      this.audioElement = new Audio();
    }

    const audio = this.audioElement;
    audio.loop = true;
    audio.volume = this.volume;
    audio.muted = this.isMuted;

    // Remove any stale event listeners by re-assigning handlers
    audio.onended = () => {
      // Should loop, but if ended
      this.isPlaying = false;
      this.notify();
    };

    audio.onerror = () => {
      if (currentOp !== this.operationToken) return;
      this.isPlaying = false;
      this.playbackError = 'Không thể phát định dạng âm thanh này. Vui lòng thử lại với file MP3 chuẩn.';
      this.notify();
    };

    // Update source and reload
    audio.src = newSrc;
    audio.load();

    // 7. Start playing immediately (within user gesture call stack)
    try {
      this.pendingPlayPromise = audio.play();
      await this.pendingPlayPromise;
      this.pendingPlayPromise = null;

      // Check for race conditions if another replace occurred while waiting
      if (currentOp !== this.operationToken) {
        audio.pause();
        return false;
      }

      this.isPlaying = true;
      this.usingSynth = false;
      this.playbackError = null;
      this.notify();
      return true;
    } catch (err: unknown) {
      this.pendingPlayPromise = null;
      if (currentOp !== this.operationToken) return false;

      const error = err as Error;
      if (error && error.name === 'AbortError') {
        // Interrupted by another pause/replace action, not a real playback failure
        return false;
      }

      console.warn('Audio play rejection:', err);
      this.isPlaying = false;
      this.playbackError = 'Không thể phát tệp âm thanh này. Trình duyệt có thể đã chặn hoặc tệp bị hỏng.';
      this.notify();
      return false;
    }
  }

  /**
   * Reverts track to the permanent default music asset
   */
  public async revertToDefault(): Promise<boolean> {
    return this.replaceAudioTrack(
      BIRTHDAY_CONFIG.music.src,
      BIRTHDAY_CONFIG.music.title,
      BIRTHDAY_CONFIG.music.artist
    );
  }

  /**
   * Starts playing the current audio track, with fallback if not already playing.
   */
  public async startAudio(mp3Src?: string): Promise<void> {
    const targetSrc = mp3Src || this.currentTrackSrc;

    // If different track requested or previous audio stopped, delegate to replace
    if (targetSrc !== this.currentTrackSrc || !this.audioElement) {
      await this.replaceAudioTrack(targetSrc);
      return;
    }

    if (this.isPlaying) return;

    this.initAudioContext();
    const currentOp = ++this.operationToken;

    // Stop synth before audio
    this.stopSynth();

    const audio = this.audioElement;
    audio.volume = this.volume;
    audio.muted = this.isMuted;

    try {
      this.pendingPlayPromise = audio.play();
      await this.pendingPlayPromise;
      this.pendingPlayPromise = null;

      if (currentOp !== this.operationToken) return;

      this.isPlaying = true;
      this.usingSynth = false;
      this.playbackError = null;
      this.notify();
    } catch (err: unknown) {
      this.pendingPlayPromise = null;
      if (currentOp !== this.operationToken) return;

      const error = err as Error;
      if (error && error.name === 'AbortError') return;

      // Fall back to synthesizer if configured and default track failed
      if (BIRTHDAY_CONFIG.music.useSynthesizerFallback && !this.isCustom) {
        this.startSynth();
      } else {
        this.isPlaying = false;
        this.playbackError = 'Không thể phát nhạc. Vui lòng bấm vào nút phát nhạc để cấp quyền cho trình duyệt.';
        this.notify();
      }
    }
  }

  public pause(): void {
    this.operationToken++;
    this.isPlaying = false;

    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {
        // Ignore
      }
    }

    this.stopSynth();
    this.notify();
  }

  public resume(mp3Src?: string): void {
    if (this.isPlaying) return;
    this.startAudio(mp3Src || this.currentTrackSrc);
  }

  public toggle(mp3Src?: string): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.startAudio(mp3Src || this.currentTrackSrc);
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
    }
    this.notify();
  }

  public setVolume(newVol: number): void {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.notify();
  }

  private stopSynth() {
    this.usingSynth = false;
    if (this.synthTimer !== null) {
      window.clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
  }

  private initAudioContext() {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch {
      // AudioContext unavailable
    }
  }

  private playChime(freq: number, duration: number, gainValue = 0.16) {
    if (!this.audioCtx || this.isMuted) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const oscHarmonic = this.audioCtx.createOscillator();
      const oscSub = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Soft music box bell timbre: fundamental sine + soft triangle overtone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, now);

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 0.5, now);

      // Warm low-pass filter to sound acoustic and intimate
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.setValueAtTime(1.2, now);

      // Gentle chime envelope
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainValue * this.volume, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      if (freq > 300) {
        oscSub.connect(gain);
      }

      gain.connect(filter);
      filter.connect(this.audioCtx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      if (freq > 300) oscSub.start(now);

      osc.stop(now + duration + 0.1);
      oscHarmonic.stop(now + duration + 0.1);
      if (freq > 300) oscSub.stop(now + duration + 0.1);
    } catch {
      // Ignore audio glitch
    }
  }

  private startSynth() {
    this.initAudioContext();
    this.stopSynth();
    this.usingSynth = true;
    this.isPlaying = true;
    this.notify();

    // Sweet romantic melody combining Happy Birthday motif with River Flows in You / Thế Giới Của Anh chords
    const melody = [
      // Section A: Romantic arpeggio (C Major / G / Am / F)
      { freq: 261.63, dur: 2.4, bass: true }, // C4
      { freq: 523.25, dur: 1.2 },             // C5
      { freq: 659.25, dur: 1.2 },             // E5
      { freq: 783.99, dur: 1.8 },             // G5
      { freq: 659.25, dur: 1.0 },             // E5

      { freq: 196.00, dur: 2.4, bass: true }, // G3
      { freq: 392.00, dur: 1.2 },             // G4
      { freq: 493.88, dur: 1.2 },             // B4
      { freq: 587.33, dur: 1.8 },             // D5
      { freq: 493.88, dur: 1.0 },             // B4

      { freq: 220.00, dur: 2.4, bass: true }, // A3
      { freq: 440.00, dur: 1.2 },             // A4
      { freq: 523.25, dur: 1.2 },             // C5
      { freq: 659.25, dur: 1.8 },             // E5
      { freq: 587.33, dur: 1.0 },             // D5

      { freq: 174.61, dur: 2.4, bass: true }, // F3
      { freq: 349.23, dur: 1.2 },             // F4
      { freq: 440.00, dur: 1.2 },             // A4
      { freq: 523.25, dur: 1.8 },             // C5
      { freq: 493.88, dur: 1.0 },             // B4

      // Section B: Delicate Happy Birthday Music Box Phrase
      { freq: 261.63, dur: 0.8 },             // C4
      { freq: 261.63, dur: 0.8 },             // C4
      { freq: 293.66, dur: 1.4 },             // D4
      { freq: 261.63, dur: 1.4 },             // C4
      { freq: 349.23, dur: 1.4 },             // F4
      { freq: 329.63, dur: 2.2, bass: true }, // E4

      { freq: 261.63, dur: 0.8 },             // C4
      { freq: 261.63, dur: 0.8 },             // C4
      { freq: 293.66, dur: 1.4 },             // D4
      { freq: 261.63, dur: 1.4 },             // C4
      { freq: 392.00, dur: 1.4 },             // G4
      { freq: 349.23, dur: 2.2, bass: true }, // F4

      { freq: 261.63, dur: 0.8 },             // C4
      { freq: 261.63, dur: 0.8 },             // C4
      { freq: 523.25, dur: 1.6 },             // C5
      { freq: 440.00, dur: 1.4 },             // A4
      { freq: 349.23, dur: 1.4 },             // F4
      { freq: 329.63, dur: 1.4 },             // E4
      { freq: 293.66, dur: 2.0 },             // D4

      { freq: 466.16, dur: 0.8 },             // Bb4
      { freq: 466.16, dur: 0.8 },             // Bb4
      { freq: 440.00, dur: 1.4 },             // A4
      { freq: 349.23, dur: 1.4 },             // F4
      { freq: 392.00, dur: 1.4 },             // G4
      { freq: 349.23, dur: 2.6, bass: true }, // F4
    ];

    const tick = () => {
      if (!this.isPlaying || !this.usingSynth) return;

      const note = melody[this.step % melody.length];
      const gain = note.bass ? 0.22 : 0.16;
      this.playChime(note.freq, note.dur, gain);

      this.step = (this.step + 1) % melody.length;
      this.synthTimer = window.setTimeout(tick, 480);
    };

    tick();
  }

  public playSpecialEffect(type: 'sparkle' | 'blow' | 'heart' | 'envelope') {
    this.initAudioContext();
    if (!this.audioCtx || this.isMuted) return;

    try {
      const now = this.audioCtx.currentTime;

      if (type === 'sparkle') {
        const notes = [587.33, 783.99, 987.77, 1174.66, 1318.51];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playChime(freq, 0.8, 0.12);
          }, idx * 75);
        });
      } else if (type === 'blow') {
        // Soft breath wind whoosh
        const bufferSize = this.audioCtx.sampleRate * 0.8;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.8);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.3 * this.volume, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        noise.start(now);
      } else if (type === 'heart' || type === 'envelope') {
        // Sweet bell chime chord (F# - A - D)
        const chord = [739.99, 880.0, 1174.66];
        chord.forEach((freq, i) => {
          setTimeout(() => {
            this.playChime(freq, 1.4, 0.15);
          }, i * 60);
        });
      }
    } catch {
      // Ignore
    }
  }
}

export const romanticAudio = new RomanticAudioEngine();
