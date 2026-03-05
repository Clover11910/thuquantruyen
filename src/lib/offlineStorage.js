const DB_NAME = 'RomanceReaderV3';
const DB_VERSION = 1;
const BOOKS_STORE = 'offlineBooks';
const PROGRESS_STORE = 'readingProgress';
const SETTINGS_STORE = 'userSettings';

function openDB() {
  return new Promise(function(resolve, reject) {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    var request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = function() {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onsuccess = function() {
      console.log('IndexedDB opened OK');
      resolve(request.result);
    };

    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      console.log('IndexedDB upgrade needed, creating stores...');

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

export async function saveOfflineBook(storyData) {
  console.log('saveOfflineBook called, storyId:', storyData.story.id);
  var db = await openDB();
  return new Promise(function(resolve, reject) {
    var tx = db.transaction(BOOKS_STORE, 'readwrite');
    var store = tx.objectStore(BOOKS_STORE);

    var record = {
      storyId: storyData.story.id,
      story: storyData.story,
      chapters: storyData.chapters,
      savedAt: new Date().toISOString()
    };

    store.put(record);

    tx.oncomplete = function() {
      console.log('saveOfflineBook SUCCESS, chapters:', record.chapters.length);
      resolve(true);
    };
    tx.onerror = function() {
      console.error('saveOfflineBook ERROR:', tx.error);
      reject(tx.error);
    };
  });
}

export async function getOfflineBook(storyId) {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(BOOKS_STORE, 'readonly');
      var store = tx.objectStore(BOOKS_STORE);
      var req = store.get(storyId);
      req.onsuccess = function() { resolve(req.result || null); };
      req.onerror = function() { reject(req.error); };
    });
  } catch (e) {
    console.error('getOfflineBook error:', e);
    return null;
  }
}

export async function getAllOfflineBooks() {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(BOOKS_STORE, 'readonly');
      var store = tx.objectStore(BOOKS_STORE);
      var req = store.getAll();
      req.onsuccess = function() {
        console.log('getAllOfflineBooks:', (req.result || []).length, 'books');
        resolve(req.result || []);
      };
      req.onerror = function() { reject(req.error); };
    });
  } catch (e) {
    console.error('getAllOfflineBooks error:', e);
    return [];
  }
}

export async function removeOfflineBookLocal(storyId) {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(BOOKS_STORE, 'readwrite');
      var store = tx.objectStore(BOOKS_STORE);
      store.delete(storyId);
      tx.oncomplete = function() { resolve(true); };
      tx.onerror = function() { reject(tx.error); };
    });
  } catch (e) {
    return false;
  }
}

export async function isBookOffline(storyId) {
  var book = await getOfflineBook(storyId);
  return !!book;
}

export async function saveOfflineProgress(storyId, lastChapter, scrollPosition) {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(PROGRESS_STORE, 'readwrite');
      var store = tx.objectStore(PROGRESS_STORE);
      store.put({
        storyId: storyId,
        lastChapter: lastChapter,
        scrollPosition: scrollPosition || 0,
        updatedAt: new Date().toISOString()
      });
      tx.oncomplete = function() { resolve(true); };
      tx.onerror = function() { reject(tx.error); };
    });
  } catch (e) {
    return false;
  }
}

export async function getOfflineProgress(storyId) {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(PROGRESS_STORE, 'readonly');
      var store = tx.objectStore(PROGRESS_STORE);
      var req = store.get(storyId);
      req.onsuccess = function() { resolve(req.result || { lastChapter: 0, scrollPosition: 0 }); };
      req.onerror = function() { reject(req.error); };
    });
  } catch (e) {
    return { lastChapter: 0, scrollPosition: 0 };
  }
}

export async function getAllOfflineProgress() {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(PROGRESS_STORE, 'readonly');
      var store = tx.objectStore(PROGRESS_STORE);
      var req = store.getAll();
      req.onsuccess = function() { resolve(req.result || []); };
      req.onerror = function() { reject(req.error); };
    });
  } catch (e) {
    return [];
  }
}

export async function saveOfflineSettings(settings) {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(SETTINGS_STORE, 'readwrite');
      var store = tx.objectStore(SETTINGS_STORE);
      store.put({ id: 'user_settings', fontSize: settings.fontSize, fontFamily: settings.fontFamily, bgColor: settings.bgColor, textColor: settings.textColor, lineHeight: settings.lineHeight });
      tx.oncomplete = function() { resolve(true); };
      tx.onerror = function() { reject(tx.error); };
    });
  } catch (e) {
    return false;
  }
}

export async function getOfflineSettings() {
  try {
    var db = await openDB();
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(SETTINGS_STORE, 'readonly');
      var store = tx.objectStore(SETTINGS_STORE);
      var req = store.get('user_settings');
      req.onsuccess = function() { resolve(req.result || null); };
      req.onerror = function() { reject(req.error); };
    });
  } catch (e) {
    return null;
  }
}
