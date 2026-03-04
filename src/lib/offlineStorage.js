const DB_NAME = 'RomanceReaderOffline';
const DB_VERSION = 2;
const BOOKS_STORE = 'offlineBooks';
const PROGRESS_STORE = 'readingProgress';
const SETTINGS_STORE = 'userSettings';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'storyId' });
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, { keyPath: 'storyId' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
      }
    };
  });
}

// === SÁCH OFFLINE ===
export async function saveOfflineBook(storyData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    store.put({
      storyId: storyData.story.id,
      story: storyData.story,
      chapters: storyData.chapters,
      savedAt: new Date().toISOString()
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineBook(storyId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.get(storyId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineBooks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeOfflineBookLocal(storyId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    store.delete(storyId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function isBookOffline(storyId) {
  const book = await getOfflineBook(storyId);
  return !!book;
}

// === TIẾN ĐỘ ĐỌC (LƯU CỤC BỘ) ===
export async function saveOfflineProgress(storyId, lastChapter, scrollPosition) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, 'readwrite');
    const store = tx.objectStore(PROGRESS_STORE);
    store.put({
      storyId,
      lastChapter,
      scrollPosition: scrollPosition || 0,
      updatedAt: new Date().toISOString()
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineProgress(storyId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, 'readonly');
    const store = tx.objectStore(PROGRESS_STORE);
    const request = store.get(storyId);
    request.onsuccess = () => resolve(request.result || { lastChapter: 0, scrollPosition: 0 });
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineProgress() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, 'readonly');
    const store = tx.objectStore(PROGRESS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// === CÀI ĐẶT ĐỌC (LƯU CỤC BỘ) ===
export async function saveOfflineSettings(settings) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    const store = tx.objectStore(SETTINGS_STORE);
    store.put({ id: 'user_settings', ...settings });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineSettings() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readonly');
    const store = tx.objectStore(SETTINGS_STORE);
    const request = store.get('user_settings');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
