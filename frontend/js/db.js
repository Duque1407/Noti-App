// db.js - Manejo de IndexedDB para persistencia offline
const DB_NAME = 'NotitAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

// Abrir/crear base de datos
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Crear object store si no existe
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        console.log('✅ Object Store creado');
      }
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Guardar nota en IndexedDB
export const saveNoteOffline = async (note) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(note);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Obtener todas las notas de IndexedDB
export const getAllNotesOffline = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Obtener una nota específica
export const getNoteOffline = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Eliminar nota de IndexedDB
export const deleteNoteOffline = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Limpiar todas las notas (útil para sincronización)
export const clearAllNotesOffline = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Sincronizar notas del servidor a IndexedDB
export const syncNotesFromServer = async (serverNotes) => {
  try {
    // Limpiar notas locales
    await clearAllNotesOffline();
    
    // Guardar cada nota del servidor
    for (const note of serverNotes) {
      await saveNoteOffline(note);
    }
    
    console.log('✅ Notas sincronizadas con IndexedDB');
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar:', error);
    return false;
  }
};
