import { BIRTHDAY_CONFIG } from '../config/birthdayConfig';
import {
  saveAudioToStorage,
  loadAudioFromStorage,
  clearAudioFromStorage,
  PersistedAudioTrack,
} from './audioStorage';

/**
 * Romantic Audio Engine:
 * - Single centralized audio controller for the entire application.
 * - Manages HTMLAudioElement playback with immediate, reliable track replacement.
 * - Uses IndexedDB to permanently persist uploaded custom MP3 Blobs across reloads.
 * - Restores custom track before initializing or starting default playback.
 * - Prevents falling back to default while asynchronous restoration is still running.
 * - Uploaded MP3 retains absolute priority over default music.
 * - Stops synthesizer and disconnects all oscillator nodes cleanly.
 * - Displays playback errors instead of silently switching or falling back to default music.
 * - Comprehensive debug logging for:
 *   [AUDIO_RESTORATION_START], [AUDIO_RESTORATION_COMPLETE],
 *   [MUSIC_SOURCE_CHANGED], [DEFAULT_AUDIO_STOPPED], [SYNTHESIZER_STOPPED],
 *   [CUSTOM_AUDIO_STARTED], [AUDIO_PLAYBACK_ERROR].
 */

const AUDIO_SETTINGS_KEY = 'romantic_birthday_audio_settings';

interface AudioSettings {
  volume: number;
  isMuted: boolean;
}

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

  // Track state
  private currentTrackSrc: string = BIRTHDAY_CONFIG.music.src;
  private currentTrackTitle: string = BIRTHDAY_CONFIG.music.title;
  private currentTrackArtist: string = BIRTHDAY_CONFIG.music.artist;
  private isCustom = false;
  private currentBlobUrl: string | null = null;
  private currentFileName: string | null = null;
  private currentMimeType: string | null = null;
  private playbackError: string | null = null;

  // Asynchronous restoration tracking
  private isRestoring = true;
  private restorationPromise: Promise<void> | null = null;

  // Race condition protection
  private operationToken = 0;
  private pendingPlayPromise: Promise<void> | null = null;

  constructor() {
    this.restoreSettings();
    this.restorationPromise = this.restoreFromIndexedDB();
  }

  /**
   * Restores user volume and mute preference from localStorage
   */
  private restoreSettings() {
    try {
      if (typeof window === 'undefined') return;
      const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (saved) {
        const parsed: AudioSettings = JSON.parse(saved);
        if (typeof parsed.volume === 'number') {
          this.volume = Math.max(0, Math.min(1, parsed.volume));
        }
        if (typeof parsed.isMuted === 'boolean') {
          this.isMuted = parsed.isMuted;
        }
      }
    } catch {
      // Ignore settings read error
    }
  }

  private saveSettings() {
    try {
      if (typeof window === 'undefined') return;
      const settings: AudioSettings = {
        volume: this.volume,
        isMuted: this.isMuted,
      };
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore settings save error
    }
  }

  /**
   * Asynchronously restores the custom uploaded track from IndexedDB.
   * Ensures that no default audio is started while restoration is running.
   */
  private async restoreFromIndexedDB(): Promise<void> {
    console.log('[AUDIO_RESTORATION_START] Checking IndexedDB for persisted custom audio track...');
    this.isRestoring = true;

    try {
      const storedTrack: PersistedAudioTrack | null = await loadAudioFromStorage();

      if (storedTrack && storedTrack.blob && storedTrack.blob.size > 0) {
        // Recreate a fresh object URL from the persisted Blob
        const blobUrl = URL.createObjectURL(storedTrack.blob);
        this.currentTrackSrc = blobUrl;
        this.currentBlobUrl = blobUrl;
        this.currentFileName = storedTrack.fileName;
        this.currentMimeType = storedTrack.mimeType;
        this.currentTrackTitle = storedTrack.title || storedTrack.fileName;
        this.currentTrackArtist = storedTrack.artist || 'Tệp MP3 bạn đã tải lên';
        this.isCustom = true;

        console.log('[AUDIO_RESTORATION_COMPLETE] Successfully restored custom track from IndexedDB:', {
          fileName: storedTrack.fileName,
          sizeBytes: storedTrack.blob.size,
          mimeType: storedTrack.mimeType,
          title: this.currentTrackTitle,
          blobUrl,
        });
      } else {
        console.log('[AUDIO_RESTORATION_COMPLETE] No custom track in IndexedDB. Using default music source:', {
          src: BIRTHDAY_CONFIG.music.src,
          title: BIRTHDAY_CONFIG.music.title,
        });
      }
    } catch (err) {
      console.error('[AUDIO_RESTORATION_ERROR] Error restoring track from IndexedDB:', err);
    } finally {
      this.isRestoring = false;
      this.notify();
    }
  }

  /**
   * Returns a promise that resolves once startup restoration is complete.
   */
  public async waitForRestoration(): Promise<void> {
    if (this.restorationPromise) {
      await this.restorationPromise;
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

  public getCurrentFileName(): string | null {
    return this.currentFileName;
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

  public isRestoringTrack(): boolean {
    return this.isRestoring;
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
   * Uploads and sets a new custom audio file (File or Blob).
   * - Persists the binary Blob in IndexedDB.
   * - Immediately replaces the active track and starts playing.
   */
  public async setUploadedTrack(
    fileOrBlob: File | Blob,
    customTitle?: string,
    customArtist?: string
  ): Promise<boolean> {
    await this.waitForRestoration();

    const fileName = (fileOrBlob as File).name || 'custom-music.mp3';
    const mimeType = fileOrBlob.type || 'audio/mpeg';
    const title = customTitle || fileName.replace(/\.[^/.]+$/, '');
    const artist = customArtist || 'Tệp MP3 bạn tải lên';

    // 1. Create a fresh object URL for playback
    const newBlobUrl = URL.createObjectURL(fileOrBlob);

    // 2. Persist to IndexedDB immediately
    try {
      await saveAudioToStorage(fileOrBlob, fileName, mimeType, title, artist);
    } catch (dbErr) {
      console.error('[AUDIO_STORAGE_ERROR] Could not persist to IndexedDB:', dbErr);
    }

    this.currentFileName = fileName;
    this.currentMimeType = mimeType;

    // 3. Replace the active audio track
    return this.replaceAudioTrack(newBlobUrl, title, artist, true);
  }

  /**
   * Dedicated method to safely replace the active audio track with a new source.
   * - Waits for any ongoing restoration to complete.
   * - Stops default audio and synthesizer.
   * - Disconnects all oscillators and cancels timeouts.
   * - Cleans up old blob URLs.
   * - Creates a clean HTMLAudioElement instance.
   * - Starts playback with race-condition prevention.
   */
  public async replaceAudioTrack(
    newSrc: string,
    title?: string,
    artist?: string,
    markAsCustom?: boolean
  ): Promise<boolean> {
    await this.waitForRestoration();

    const currentOp = ++this.operationToken;
    this.playbackError = null;

    const previousSrc = this.currentTrackSrc;
    const isNewCustom =
      markAsCustom !== undefined
        ? markAsCustom
        : newSrc.startsWith('blob:') || newSrc !== BIRTHDAY_CONFIG.music.src;

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

    // 4. Update track info
    this.currentTrackSrc = newSrc;
    this.currentTrackTitle =
      title || (isNewCustom ? 'Bản nhạc bạn chọn' : BIRTHDAY_CONFIG.music.title);
    this.currentTrackArtist =
      artist || (isNewCustom ? 'Tệp MP3 tải lên' : BIRTHDAY_CONFIG.music.artist);
    this.isCustom = isNewCustom;

    // 5. Ensure audio context is ready
    this.initAudioContext();

    // 6. Create a brand new clean HTMLAudioElement
    const audio = new Audio();
    audio.loop = true;
    audio.volume = this.volume;
    audio.muted = this.isMuted;
    audio.preload = 'auto';

    audio.onended = () => {
      if (currentOp !== this.operationToken) return;
      this.isPlaying = false;
      this.notify();
    };

    audio.onerror = () => {
      if (currentOp !== this.operationToken) return;
      console.error('[AUDIO_PLAYBACK_ERROR]', 'Audio element error event for src:', newSrc);
      this.isPlaying = false;
      this.playbackError =
        'Không thể phát tệp âm thanh này. Vui lòng thử lại với một file MP3 hợp lệ.';
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
        'Trình duyệt yêu cầu tương tác hoặc tệp âm thanh bị lỗi. Hãy bấm "Phát nhạc" để nghe bài hát.';
      this.notify();
      return false;
    }
  }

  /**
   * Reverts track to the permanent default music asset (/music/the-gioi-cua-anh.mp3)
   * and clears the stored custom track from IndexedDB.
   */
  public async revertToDefault(): Promise<boolean> {
    await this.waitForRestoration();

    console.log('[MUSIC_SOURCE_CHANGED] User requested revert to default music');

    // 1. Remove custom track from IndexedDB
    await clearAudioFromStorage();
    this.currentFileName = null;
    this.currentMimeType = null;

    // 2. Switch back to default track
    return this.replaceAudioTrack(
      BIRTHDAY_CONFIG.music.src,
      BIRTHDAY_CONFIG.music.title,
      BIRTHDAY_CONFIG.music.artist,
      false
    );
  }

  /**
   * Starts playing the active audio track.
   * If a custom track is loaded, it retains absolute priority over default music.
   * Waits for any initial IndexedDB restoration before taking action.
   */
  public async startAudio(mp3Src?: string): Promise<void> {
    await this.waitForRestoration();

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

      // Do not automatically switch to synthesizer fallback or fall back to default
      this.isPlaying = false;
      this.playbackError =
        'Không thể phát nhạc tự động do chính sách trình duyệt. Vui lòng bấm vào biểu tượng đĩa nhạc để nghe.';
      this.notify();
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

  public async resume(mp3Src?: string): Promise<void> {
    if (this.isPlaying) return;
    await this.startAudio(mp3Src || this.currentTrackSrc);
  }

  public async toggle(mp3Src?: string): Promise<void> {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.startAudio(mp3Src || this.currentTrackSrc);
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
    }
    this.saveSettings();
    this.notify();
  }

  public setVolume(newVol: number): void {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    this.saveSettings();
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
