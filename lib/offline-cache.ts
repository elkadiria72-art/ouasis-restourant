'use client';

export interface CachedDataset<T> {
  key: string;
  data: T;
  updatedAt: string;
}

const DB_NAME = 'elkahmed-admin-offline';
const STORE_NAME = 'datasets';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('INDEXEDDB_UNAVAILABLE'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('INDEXEDDB_OPEN_FAILED'));
  });
}

function notifyCacheUpdated(updatedAt: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin-cache-updated', { detail: { updatedAt } }));
  }
}

export function isOnline() {
  return typeof navigator === 'undefined' || navigator.onLine;
}

export async function readCachedDataset<T>(key: string): Promise<CachedDataset<T> | null> {
  try {
    const database = await openDatabase();
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve((request.result as CachedDataset<T> | undefined) || null);
      request.onerror = () => reject(request.error || new Error('INDEXEDDB_READ_FAILED'));
      transaction.oncomplete = () => database.close();
    });
  } catch {
    return null;
  }
}

export async function writeCachedDataset<T>(key: string, data: T): Promise<CachedDataset<T>> {
  const record: CachedDataset<T> = { key, data, updatedAt: new Date().toISOString() };

  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('INDEXEDDB_WRITE_FAILED'));
      transaction.onabort = () => reject(transaction.error || new Error('INDEXEDDB_WRITE_ABORTED'));
    });
    database.close();
    notifyCacheUpdated(record.updatedAt);
  } catch {
    // IndexedDB is an enhancement; a storage failure must not break the Admin UI.
  }

  return record;
}

export class OfflineCacheMissError extends Error {
  constructor() {
    super('لا توجد بيانات محفوظة على هذا الجهاز. اتصل بالإنترنت مرة واحدة لتحميل البيانات.');
    this.name = 'OfflineCacheMissError';
  }
}

/**
 * Shows valid cached data first, then refreshes it from the existing server action
 * when connectivity is available. Failed requests never replace cached data.
 */
export async function loadCachedDataset<T>(
  key: string,
  fetcher: () => Promise<T>,
  onCached?: (cached: CachedDataset<T>) => void
): Promise<CachedDataset<T>> {
  const cached = await readCachedDataset<T>(key);

  if (cached) {
    onCached?.(cached);
  }

  if (!isOnline()) {
    if (cached) return cached;
    throw new OfflineCacheMissError();
  }

  try {
    const fresh = await fetcher();
    return writeCachedDataset(key, fresh);
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}
