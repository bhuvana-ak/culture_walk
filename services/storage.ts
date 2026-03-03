import { GeneratedStory } from '../types';
import { db, storage } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const DB_NAME = 'CultureWalkDB';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

// --- IndexedDB Helpers ---

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME); // Key is the string provided by caller
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const dbPut = async (key: string, value: any): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const dbGet = async <T>(key: string): Promise<T | null> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const dbDelete = async (key: string): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const dbGetAllKeys = async (): Promise<IDBValidKey[]> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Application Logic ---

export interface CustomStoryData {
  title: string;
  content: string;
  audioBase64?: string;
  customAudioType?: string;
  lastUpdated: number;
}

// 1. Custom Story Methods (Admin)
// Keys for custom stories will be prefixed to avoid collision with cache, 
// though currently we use "communityId" for custom and "story_v2_..." for cache.
// Let's stick to using raw communityId for custom stories as per previous logic, 
// but it's safer to prefix if we want to mix types. 
// However, to maintain backward compat with the logic requested, we will use 'custom_' prefix internally
// or just rely on the ID. Let's use 'custom_' prefix for clarity in DB.

const CUSTOM_PREFIX = 'custom_';
const CACHE_PREFIX = 'cache_v2_';

export const getCustomStory = async (communityId: string): Promise<CustomStoryData | null> => {
  try {
    return await dbGet<CustomStoryData>(`${CUSTOM_PREFIX}${communityId}`);
  } catch (e) {
    console.error("Failed to load custom story", e);
    return null;
  }
};

export const saveCustomStory = async (communityId: string, data: Omit<CustomStoryData, 'lastUpdated'>) => {
  try {
    const payload = {
      ...data,
      lastUpdated: Date.now()
    };
    await dbPut(`${CUSTOM_PREFIX}${communityId}`, payload);
  } catch (e) {
    console.error("Failed to save custom story", e);
    throw new Error("Storage quota exceeded or error occurred.");
  }
};

export const deleteCustomStory = async (communityId: string) => {
  try {
    await dbDelete(`${CUSTOM_PREFIX}${communityId}`);
  } catch (e) {
    console.error("Failed to delete custom story", e);
  }
};

export const getAllCustomStoryIds = async (): Promise<string[]> => {
  try {
    const keys = await dbGetAllKeys();
    // Filter keys that start with CUSTOM_PREFIX and strip it
    return keys
      .map(k => String(k))
      .filter(k => k.startsWith(CUSTOM_PREFIX))
      .map(k => k.replace(CUSTOM_PREFIX, ''));
  } catch (e) {
    return [];
  }
};

// 2. Cache Methods (StoryView)
export const getStoryFromCache = async (communityId: string): Promise<GeneratedStory | null> => {
  try {
    return await dbGet<GeneratedStory>(`${CACHE_PREFIX}${communityId}`);
  } catch (e) {
    return null;
  }
};

export const saveStoryToCache = async (communityId: string, story: GeneratedStory) => {
  try {
    await dbPut(`${CACHE_PREFIX}${communityId}`, story);
  } catch (e) {
    console.warn("Failed to cache story", e);
  }
};

export const clearStoryCache = async (communityId: string) => {
  try {
    await dbDelete(`${CACHE_PREFIX}${communityId}`);
  } catch (e) { }
};

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g., "data:audio/mpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// =============================================================================
// 3. CLOUD STORAGE (Firebase Firestore + Storage)
//    These functions store data shared across ALL users/devices.
// =============================================================================

const CLOUD_COLLECTION = 'customStories';
const CLOUD_AUDIO_FOLDER = 'audio';

export interface CloudCustomStoryData {
  title: string;
  content: string;
  audioUrl?: string;       // Firebase Storage HTTPS download URL
  customAudioType?: string;
  lastUpdated: number;
}

/**
 * Save a custom story (and optionally an audio file) to Firebase.
 * The audio file is uploaded to Firebase Storage; all other data goes to Firestore.
 */
export const saveCustomStoryToCloud = async (
  communityId: string,
  data: { title: string; content: string; customAudioType?: string },
  audioFile?: File | null,
  keepExistingAudioUrl?: string | null,
): Promise<void> => {
  let audioUrl: string | undefined = keepExistingAudioUrl ?? undefined;

  if (audioFile) {
    const audioRef = ref(storage, `${CLOUD_AUDIO_FOLDER}/${communityId}`);
    await uploadBytes(audioRef, audioFile);
    audioUrl = await getDownloadURL(audioRef);
  }

  const docRef = doc(db, CLOUD_COLLECTION, communityId);
  await setDoc(docRef, {
    title: data.title,
    content: data.content,
    audioUrl: audioUrl ?? null,
    customAudioType: data.customAudioType ?? null,
    lastUpdated: Date.now(),
  });
};

/**
 * Fetch a custom story from Firestore for a given community ID.
 * Returns null if no custom story exists.
 */
export const getCustomStoryFromCloud = async (
  communityId: string,
): Promise<CloudCustomStoryData | null> => {
  try {
    const docRef = doc(db, CLOUD_COLLECTION, communityId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as CloudCustomStoryData;
  } catch (e) {
    console.error('Failed to fetch custom story from cloud', e);
    return null;
  }
};

/**
 * Delete a custom story document from Firestore and its audio from Storage.
 */
export const deleteCustomStoryFromCloud = async (
  communityId: string,
): Promise<void> => {
  try {
    // Delete Firestore document
    await deleteDoc(doc(db, CLOUD_COLLECTION, communityId));
  } catch (e) {
    console.error('Failed to delete Firestore doc', e);
  }
  try {
    // Delete audio file from Storage (may not exist — ignore error)
    const audioRef = ref(storage, `${CLOUD_AUDIO_FOLDER}/${communityId}`);
    await deleteObject(audioRef);
  } catch (_) {
    // File may not exist — that's fine
  }
};

/**
 * Get all community IDs that have a custom cloud story.
 */
export const getAllCustomStoryIdsFromCloud = async (): Promise<string[]> => {
  try {
    const snap = await getDocs(collection(db, CLOUD_COLLECTION));
    return snap.docs.map(d => d.id);
  } catch (e) {
    console.error('Failed to list cloud custom stories', e);
    return [];
  }
};