// api.js - Módulo para llamadas al backend API
const API_BASE_URL = '/api';

// Estado de conexión
let isOnline = navigator.onLine;

// Actualizar estado de conexión
window.addEventListener('online', () => {
  isOnline = true;
  updateConnectionStatus(true);
});

window.addEventListener('offline', () => {
  isOnline = false;
  updateConnectionStatus(false);
});

// Actualizar badge de conexión en UI
const updateConnectionStatus = (online) => {
  const statusBadge = document.getElementById('connectionStatus');
  if (statusBadge) {
    if (online) {
      statusBadge.innerHTML = '<i class="bi bi-wifi"></i> Online';
      statusBadge.className = 'badge bg-success';
    } else {
      statusBadge.innerHTML = '<i class="bi bi-wifi-off"></i> Offline';
      statusBadge.className = 'badge bg-danger';
    }
  }
};

// Función helper para fetch con manejo de errores
const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetch:', error);
    throw error;
  }
};

// Obtener todas las notas
export const fetchNotes = async () => {
  if (!isOnline) {
    throw new Error('Sin conexión a internet');
  }
  return await fetchAPI(`${API_BASE_URL}/notes`);
};

// Obtener una nota específica
export const fetchNote = async (id) => {
  if (!isOnline) {
    throw new Error('Sin conexión a internet');
  }
  return await fetchAPI(`${API_BASE_URL}/notes/${id}`);
};

// Crear nueva nota
export const createNote = async (noteData) => {
  if (!isOnline) {
    throw new Error('Sin conexión a internet');
  }
  return await fetchAPI(`${API_BASE_URL}/notes`, {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
};

// Actualizar nota existente
export const updateNote = async (id, noteData) => {
  if (!isOnline) {
    throw new Error('Sin conexión a internet');
  }
  return await fetchAPI(`${API_BASE_URL}/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  });
};

// Eliminar nota
export const deleteNote = async (id) => {
  if (!isOnline) {
    throw new Error('Sin conexión a internet');
  }
  return await fetchAPI(`${API_BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });
};

// Check de salud del API
export const checkAPIHealth = async () => {
  try {
    const response = await fetchAPI(`${API_BASE_URL}/health`);
    return response.success;
  } catch (error) {
    return false;
  }
};

// Exportar estado de conexión
export const getConnectionStatus = () => isOnline;
