import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';

/**
 * Romantic Audio Engine:
 * - Single centralized audio controller for the entire application.
 * - Manages HTMLAudioElement playback with immediate track replacement.
 * - Handles stopping default audio, stopping synthesizer oscillators, and stopping fallback loops.
 * - Prevents race conditions during asynchronous play/pause/switch operations.
 * - Safe blob URL cleanup and session memory.
 * - Dedicated Web Audio synthesizer with clean disconnectable master gain.
 * - Full debug logging for all required audio events:
 *   [MUSIC_SOURCE_CHANGED], [DEFAULT_AUDIO_STOPPED], [SYNTHESIZER_STOPPED],
 *   [CUSTOM_AUDIO_STARTED], [AUDIO_PLAYBACK_ERROR].
 */

interface SessionTrackData {
  src: string;
  title: string;
  artist: string;
  isCustom: boolean;
}

const SESSION_STORAGE_KEY = 'romantic_birthday_audio_track_v2';

class RomanticAudioEngine {
  private audioCtx: AudioContext | null = null;
  private synthMasterGain: GainNode | null = null;
  private activeOscillators: Set<{ osc: OscillatorNode; gain: GainNode }> = new Set();
  private synthTimer: number | null = null;
  private step = 0;
  private usingSynth = false;

  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.7;
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
        if (data.src && !data.src.startsWith('blob:')) {
          this.currentTrackSrc = data.src;
          this.currentTrackTitle = data.title || BIRTHDAY_CONFIG.music.title;
          this.currentTrackArtist = data.artist || BIRTHDAY_CONFIG.music.artist;
          this.isCustom = Boolean(data.isCustom);
        } else if (data.isCustom) {
          // If previous session had a custom blob, keep metadata placeholder
          this.currentTrackTitle = data.title || 'Bản nhạc tùy chọn';
          this.currentTrackArtist = data.artist || 'Tệp MP3 đã tải lên';
          // Blob URLs are invalid across page reloads, fallback to default src
          this.currentTrackSrc = BIRTHDAY_CONFIG.music.src;
          this.isCustom = false;
        }
      }
    } catch {
      // Ignore storage read error
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
      // Ignore storage write error
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

  // Getters
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

  public isUsingSynthesizer(): boolean {
    return this.usingSynth;
  }

  public getPlaybackError(): string | null {
    return this.playbackError;
  }

  public clearPlaybackError(): void {
    this.playbackError = null;
    this.notify();
  }

  /**
   * Completely pauses, resets, and tears down the active HTMLAudioElement.
   * Ensures no background playback or decoding continues.
   */
  private teardownCurrentAudioElement(): void {
    if (!this.audioElement) return;

    const audio = this.audioElement;
    this.audioElement = null; // Unbind reference immediately

    try {
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
      audio.onpause = null;
      audio.oncanplay = null;
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.removeAttribute('src');
      audio.load();
    } catch (err) {
      console.warn('Error tearing down previous audio element:', err);
    }

    console.log('[DEFAULT_AUDIO_STOPPED] Previous audio element stopped, reset, and detached');
  }

  /**
   * Stops synthesizer, disconnects all active oscillator nodes, and clears master gain.
   */
  public stopSynth(): void {
    const hadActiveSynth = this.usingSynth || this.synthTimer !== null || this.activeOscillators.size > 0;
    this.usingSynth = false;

    if (this.synthTimer !== null) {
      window.clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }

    // Immediately ramp master synth gain to 0 and disconnect
    if (this.synthMasterGain && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.synthMasterGain.gain.cancelScheduledValues(now);
        this.synthMasterGain.gain.setValueAtTime(0, now);
        this.synthMasterGain.disconnect();
      } catch {
        // Ignore disconnect error
      }
      this.synthMasterGain = null;
    }

    // Stop and disconnect every active oscillator immediately
    this.activeOscillators.forEach(({ osc, gain }) => {
      try {
        osc.stop(0);
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ignore oscillator stop error if already ended
      }
    });
    this.activeOscillators.clear();

    if (hadActiveSynth) {
      console.log('[SYNTHESIZER_STOPPED] All synthesizer oscillators stopped and master gain disconnected');
    }
  }

  /**
   * Dedicated method to safely replace the active audio track with a new source.
   * - Stops default audio and synthesizer.
   * - Disconnects all oscillators and cancels timeouts.
   * - Cleans up old blob URLs.
   * - Creates a clean HTMLAudioElement instance.
   * - Starts playback with race-condition prevention.
   */
  public async replaceAudioTrack(
    newSrc: string,
    title?: string,
    artist?: string
  ): Promise<boolean> {
    const currentOp = ++this.operationToken;
    this.playbackError = null;

    const previousSrc = this.currentTrackSrc;
    const isNewCustom = newSrc !== BIRTHDAY_CONFIG.music.src;

    console.log('[MUSIC_SOURCE_CHANGED]', {
      from: previousSrc,
      to: newSrc,
      isCustom: isNewCustom,
      title: title || 'Custom Track',
    });

    // 1. Immediately stop synthesizer fallback if running
    this.stopSynth();

    // 2. Immediately stop, reset, and teardown previous HTMLAudioElement
    this.teardownCurrentAudioElement();
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
    this.currentTrackTitle =
      title || (isNewCustom ? 'Bản nhạc bạn chọn' : BIRTHDAY_CONFIG.music.title);
    this.currentTrackArtist =
      artist || (isNewCustom ? 'Tệp MP3 tải lên' : BIRTHDAY_CONFIG.music.artist);
    this.isCustom = isNewCustom;
    this.saveToSession();

    // 5. Ensure audio context is ready
    this.initAudioContext();

    // 6. Create a brand new clean HTMLAudioElement
    const audio = new Audio();
    audio.loop = true;
    audio.volume = this.volume;
    audio.muted = this.isMuted;
    audio.preload = 'auto';

    audio.onended = () => {
      // Loop is true, but handle unexpected finish
      if (currentOp !== this.operationToken) return;
      this.isPlaying = false;
      this.notify();
    };

    audio.onerror = () => {
      if (currentOp !== this.operationToken) return;
      console.error('[AUDIO_PLAYBACK_ERROR]', 'Audio element error event for src:', newSrc);
      this.isPlaying = false;
      this.playbackError =
        'Không thể phát tệp âm thanh này. Vui lòng thử lại với một file MP3 hoặc WAV hợp lệ.';
      this.notify();
    };

    audio.src = newSrc;
    this.audioElement = audio;

    // 7. Start playing immediately inside the user-interaction execution frame
    try {
      this.pendingPlayPromise = audio.play();
      await this.pendingPlayPromise;
      this.pendingPlayPromise = null;

      // If another operation took over while waiting, pause this one
      if (currentOp !== this.operationToken) {
        audio.pause();
        return false;
      }

      this.isPlaying = true;
      this.usingSynth = false;
      this.playbackError = null;

      if (this.isCustom) {
        console.log('[CUSTOM_AUDIO_STARTED]', {
          src: newSrc,
          title: this.currentTrackTitle,
          artist: this.currentTrackArtist,
        });
      }

      this.notify();
      return true;
    } catch (err: unknown) {
      this.pendingPlayPromise = null;
      if (currentOp !== this.operationToken) return false;

      const error = err as Error;
      if (error && error.name === 'AbortError') {
        // Interrupted by another replace or pause, not a fatal failure
        return false;
      }

      console.error('[AUDIO_PLAYBACK_ERROR]', 'Audio play rejection for src:', newSrc, err);
      this.isPlaying = false;
      this.playbackError =
        'Không thể phát nhạc. Trình duyệt đã chặn tự động phát hoặc tệp bị hỏng. Hãy bấm nút Phát nhạc để thử lại.';
      this.notify();
      return false;
    }
  }

  /**
   * Reverts track to the permanent default music asset (/music/the-gioi-cua-anh.mp3)
   */
  public async revertToDefault(): Promise<boolean> {
    return this.replaceAudioTrack(
      BIRTHDAY_CONFIG.music.src,
      BIRTHDAY_CONFIG.music.title,
      BIRTHDAY_CONFIG.music.artist
    );
  }

  /**
   * Starts playing the active audio track.
   * If a custom track is loaded, it retains absolute priority over default music.
   */
  public async startAudio(mp3Src?: string): Promise<void> {
    // If a custom track is active and an outside caller passed the default src, keep custom track
    let targetSrc = mp3Src || this.currentTrackSrc;
    if (this.isCustom && mp3Src === BIRTHDAY_CONFIG.music.src) {
      targetSrc = this.currentTrackSrc;
    }

    // If source differs or audio element not initialized, route to replaceAudioTrack
    if (targetSrc !== this.currentTrackSrc || !this.audioElement) {
      await this.replaceAudioTrack(targetSrc, this.currentTrackTitle, this.currentTrackArtist);
      return;
    }

    if (this.isPlaying) return;

    this.initAudioContext();
    const currentOp = ++this.operationToken;

    // Ensure synth is stopped before resuming audio
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

      console.error('[AUDIO_PLAYBACK_ERROR]', 'Playback failed in startAudio():', err);

      // Rule 7: Do NOT automatically switch to synthesizer fallback after a custom MP3 is selected!
      if (!this.isCustom && BIRTHDAY_CONFIG.music.useSynthesizerFallback) {
        this.startSynth();
      } else {
        this.isPlaying = false;
        this.playbackError =
          'Không thể phát nhạc. Vui lòng bấm vào biểu tượng đĩa nhạc để cho phép trình duyệt phát.';
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
        // Ignore pause error
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

      if (!this.synthMasterGain) {
        this.synthMasterGain = this.audioCtx.createGain();
        this.synthMasterGain.connect(this.audioCtx.destination);
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

      // Warm low-pass filter
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
      filter.connect(this.synthMasterGain);

      // Track active oscillators for immediate cleanup
      const tracked1 = { osc, gain };
      const tracked2 = { osc: oscHarmonic, gain };
      this.activeOscillators.add(tracked1);
      this.activeOscillators.add(tracked2);

      osc.onended = () => {
        this.activeOscillators.delete(tracked1);
      };
      oscHarmonic.onended = () => {
        this.activeOscillators.delete(tracked2);
      };

      osc.start(now);
      oscHarmonic.start(now);
      if (freq > 300) {
        const tracked3 = { osc: oscSub, gain };
        this.activeOscillators.add(tracked3);
        oscSub.onended = () => {
          this.activeOscillators.delete(tracked3);
        };
        oscSub.start(now);
        oscSub.stop(now + duration + 0.1);
      }

      osc.stop(now + duration + 0.1);
      oscHarmonic.stop(now + duration + 0.1);
    } catch {
      // Ignore audio glitch
    }
  }

  private startSynth() {
    // Never start synth if custom track is active
    if (this.isCustom) return;

    this.initAudioContext();
    this.stopSynth();

    if (!this.audioCtx) return;

    this.synthMasterGain = this.audioCtx.createGain();
    this.synthMasterGain.connect(this.audioCtx.destination);

    this.usingSynth = true;
    this.isPlaying = true;
    this.notify();

    // Sweet romantic melody combining Happy Birthday motif with acoustic chords
    const melody = [
      // Section A: Romantic arpeggio
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

      // Section B: Happy Birthday Phrase
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
      if (!this.isPlaying || !this.usingSynth || this.isCustom) {
        this.stopSynth();
        return;
      }

      const note = melody[this.step % melody.length];
      const gain = note.bass ? 0.22 : 0.16;
      this.playChime(note.freq, note.dur, gain);

      this.step = (this.step + 1) % melody.length;
      this.synthTimer = window.setTimeout(tick, 480);
    };

    tick();
  }

  /**
   * Special celebration sound effects (envelope open, candle blow, chime, heart).
   * Routed through independent temporary nodes so background music is never touched.
   */
  public playSpecialEffect(type: 'sparkle' | 'blow' | 'heart' | 'envelope') {
    this.initAudioContext();
    if (!this.audioCtx || this.isMuted) return;

    try {
      const now = this.audioCtx.currentTime;

      if (type === 'sparkle') {
        const notes = [587.33, 783.99, 987.77, 1174.66, 1318.51];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playEffectChime(freq, 0.8, 0.12);
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
            this.playEffectChime(freq, 1.4, 0.15);
          }, i * 60);
        });
      }
    } catch {
      // Ignore
    }
  }

  private playEffectChime(freq: number, duration: number, gainValue = 0.15) {
    if (!this.audioCtx || this.isMuted) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainValue * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // Ignore
    }
  }
}

export const romanticAudio = new RomanticAudioEngine();
