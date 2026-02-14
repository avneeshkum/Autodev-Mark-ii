// src/lib/persistence.js

const DB_NAME = 'AutoDev_Storage';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

/**
 * Open the Database
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

/**
 * Save files to IndexedDB
 * @param {Object} files - The file tree object
 */
export const saveToDB = async (files) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // 'last_session' key par pura object save kar rahe hain
    store.put(files, 'last_session');
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        // console.log("💾 Auto-saved to DB"); // Debugging ke liye on rakh sakte ho
        resolve(true);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Save to DB failed:", error);
  }
};

/**
 * Get files from IndexedDB
 * @returns {Object|null} - The file tree or null
 */
export const getFromDB = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('last_session');

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error("Load from DB failed:", error);
    return null;
  }
};

/**
 * Clear the Database (Optional utility)
 */
export const clearDB = async () => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
};