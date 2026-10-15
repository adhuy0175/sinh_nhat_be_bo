/**
 * Audio Storage Utility (IndexedDB):
 * - Persists uploaded custom audio files (Blob) across page reloads.
 * - Stores fileName, mimeType, custom title, and artist.
 * - Free of storage limits compared to sessionStorage/localStorage (which cannot store binary blobs).
 */

export interface PersistedAudioTrack {
  id: string; // 'active_custom_track'
  blob: Blob;
  fileName: string;
  mimeType: string;
  title: string;
  artist: string;
  updatedAt: number;
}

const DB_NAME = 'RomanticBirthdayAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_music';
const TRACK_KEY = 'active_custom_track';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not available in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };

    request.onblocked = () => {
      console.warn('[AUDIO_STORAGE] IndexedDB database open blocked');
    };
  });
}

/**
 * Saves uploaded audio blob and metadata to IndexedDB
 */
export async function saveAudioToStorage(
  blob: Blob,
  fileName: string,
  mimeType: string,
  title: string,
  artist: string
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record: PersistedAudioTrack = {
        id: TRACK_KEY,
        blob,
        fileName,
        mimeType: mimeType || blob.type || 'audio/mpeg',
        title,
        artist,
        updatedAt: Date.now(),
      };

      const request = store.put(record);

      request.onsuccess = () => {
        console.log('[AUDIO_STORAGE_SAVED]', {
          fileName,
          mimeType: record.mimeType,
          sizeBytes: blob.size,
          title,
        });
        resolve();
      };

      request.onerror = () => {
        console.error('[AUDIO_STORAGE_ERROR] Failed to save track to IndexedDB', request.error);
        reject(request.error);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    console.error('[AUDIO_STORAGE_ERROR] Exception saving audio track to IndexedDB:', err);
    throw err;
  }
}

/**
 * Retrieves the stored custom audio track from IndexedDB
 */
export async function loadAudioFromStorage(): Promise<PersistedAudioTrack | null> {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(TRACK_KEY);

      request.onsuccess = () => {
        const result = request.result as PersistedAudioTrack | undefined;
        resolve(result || null);
      };

      request.onerror = () => {
        console.error('[AUDIO_STORAGE_ERROR] Failed to load track from IndexedDB', request.error);
        reject(request.error);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    console.warn('[AUDIO_STORAGE_WARN] Could not retrieve audio from IndexedDB:', err);
    return null;
  }
}

/**
 * Removes the stored custom audio track from IndexedDB
 */
export async function clearAudioFromStorage(): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return;
    }
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(TRACK_KEY);

      request.onsuccess = () => {
        console.log('[AUDIO_STORAGE_CLEARED] Custom audio deleted from IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('[AUDIO_STORAGE_ERROR] Failed to delete track from IndexedDB', request.error);
        reject(request.error);
      };

      tx.oncomplete = () => {
        db.close();
      };
    });
  } catch (err) {
    console.warn('[AUDIO_STORAGE_WARN] Could not clear audio from IndexedDB:', err);
  }
}
