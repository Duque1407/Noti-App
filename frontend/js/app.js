// Lógica principal de NotitApp
import * as API from './api.js';
import * as DB from './db.js';
import * as Notifications from './notifications.js';

// Estado global de la aplicación
let notes = [];
let currentNote = null;
let deferredPrompt = null; // Para instalación PWA

// Referencias DOM
const notesGrid = document.getElementById('notesGrid');
const emptyState = document.getElementById('emptyState');
const notesCount = document.getElementById('notesCount');
const noteModal = new bootstrap.Modal(document.getElementById('noteModal'));
const installBtn = document.getElementById('installBtn');

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', async () => {
  console.log('NotitApp iniciando...');
  
  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado:', registration);
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
    }
  }
  
  // Solicitar permisos de notificaciones
  await Notifications.requestNotificationPermission();
  
  // Cargar notas
  await loadNotes();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Programar recordatorios activos
  Notifications.scheduleAllReminders(notes);
  
  if (!localStorage.getItem('welcomeShown')) {
    setTimeout(() => {
      Notifications.showWelcomeNotification();
      localStorage.setItem('welcomeShown', 'true');
    }, 2000);
  }
  
  console.log('NotitApp lista!');
});

// Cargar notas (intenta desde servidor, si falla usa IndexedDB)
const loadNotes = async () => {
  try {
    // Intentar obtener del servidor
    const response = await API.fetchNotes();
    notes = response.data;
    
    // Sincronizar con IndexedDB
    await DB.syncNotesFromServer(notes);
    
    console.log(`${notes.length} notas cargadas desde servidor`);
  } catch (error) {
    console.warn('No se pudo conectar al servidor, usando datos offline');
    
    // Cargar desde IndexedDB
    notes = await DB.getAllNotesOffline();
    console.log(`${notes.length} notas cargadas desde IndexedDB`);
  }
  
  renderNotes();
  updateNotesCount();
};

// Renderizar notas en el grid
const renderNotes = () => {
  if (notes.length === 0) {
    notesGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  notesGrid.style.display = 'flex';
  emptyState.style.display = 'none';
  
  notesGrid.innerHTML = notes.map(note => `
    <div class="col">
      <div class="card note-card h-100" style="background-color: ${note.color};" data-note-id="${note.id}">
        <div class="card-body">
          <div class="note-actions">
            <button class="btn btn-edit" onclick="window.editNote(${note.id})" title="Editar">
              <i class="bi bi-pencil-fill text-primary"></i>
            </button>
            <button class="btn btn-delete" onclick="window.deleteNoteHandler(${note.id})" title="Eliminar">
              <i class="bi bi-trash-fill text-danger"></i>
            </button>
          </div>
          
          <h5 class="note-card-title">${escapeHtml(note.title)}</h5>
          <p class="note-card-text">${escapeHtml(note.content)}</p>
          
          <div class="note-metadata">
            ${note.reminderDate ? `
              <div class="mb-1">
                <i class="bi bi-alarm text-warning"></i>
                <small>${formatDate(note.reminderDate)}</small>
              </div>
            ` : ''}
            ${note.location ? `
              <div class="mb-1">
                <i class="bi bi-geo-alt-fill text-danger"></i>
                <small>${escapeHtml(note.location)}</small>
              </div>
            ` : ''}
            <div>
              <i class="bi bi-clock"></i>
              <small>${formatDate(note.updatedAt)}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
};

// Actualizar contador de notas
const updateNotesCount = () => {
  const count = notes.length;
  notesCount.textContent = count === 0 
    ? 'No tienes notas guardadas' 
    : `Tienes ${count} nota${count !== 1 ? 's' : ''} guardada${count !== 1 ? 's' : ''}`;
};

// Configurar event listeners
const setupEventListeners = () => {
  // Botón nueva nota
  document.getElementById('newNoteBtn').addEventListener('click', () => {
    currentNote = null;
    clearForm();
    document.getElementById('noteModalLabel').innerHTML = '<i class="bi bi-journal-plus"></i> Nueva Nota';
  });
  
  // Botón guardar nota
  document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
  
  // Botón obtener ubicación
  document.getElementById('getLocationBtn').addEventListener('click', getLocation);
  
  // Capturar evento de instalación PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
  });
  
  // Botón instalar PWA
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
      deferredPrompt = null;
      installBtn.style.display = 'none';
    }
  });
};

// Guardar nota (crear o actualizar)
const saveNote = async () => {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  const color = document.querySelector('input[name="noteColor"]:checked').value;
  const reminderDate = document.getElementById('reminderDate').value;
  const location = document.getElementById('noteLocation').value;
  
  if (!title || !content) {
    Notifications.showToast('Título y contenido son obligatorios', 'warning');
    return;
  }
  
  const noteData = {
    title,
    content,
    color,
    location,
    reminderDate: reminderDate || null,
  };
  
  try {
    let savedNote;
    
    if (currentNote) {
      // Actualizar nota existente
      const response = await API.updateNote(currentNote.id, noteData);
      savedNote = response.data;
      Notifications.notifyNoteUpdated(title);
    } else {
      // Crear nueva nota
      const response = await API.createNote(noteData);
      savedNote = response.data;
      Notifications.notifyNoteCreated(title);
    }
    
    // Guardar en IndexedDB
    await DB.saveNoteOffline(savedNote);
    
    // Programar recordatorio si existe
    if (savedNote.reminderDate) {
      Notifications.scheduleReminder(savedNote);
    }
    
    // Recargar notas
    await loadNotes();
    
    // Cerrar modal
    noteModal.hide();
    clearForm();
    
  } catch (error) {
    console.error('Error al guardar nota:', error);
    
    // Si estamos offline, guardar solo en IndexedDB
    if (!API.getConnectionStatus()) {
      const offlineNote = {
        id: currentNote ? currentNote.id : Date.now(),
        ...noteData,
        createdAt: currentNote ? currentNote.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await DB.saveNoteOffline(offlineNote);
      await loadNotes();
      noteModal.hide();
      clearForm();
      
      Notifications.showToast('Nota guardada offline. Se sincronizará cuando haya conexión.', 'info');
    } else {
      Notifications.showToast('Error al guardar la nota', 'error');
    }
  }
};

// Editar nota
window.editNote = async (id) => {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  
  currentNote = note;
  
  // Llenar formulario
  document.getElementById('noteId').value = note.id;
  document.getElementById('noteTitle').value = note.title;
  document.getElementById('noteContent').value = note.content;
  document.querySelector(`input[value="${note.color}"]`).checked = true;
  document.getElementById('noteLocation').value = note.location || '';
  
  if (note.reminderDate) {
    // Formatear fecha para input datetime-local
    const date = new Date(note.reminderDate);
    const formatted = date.toISOString().slice(0, 16);
    document.getElementById('reminderDate').value = formatted;
  }
  
  document.getElementById('noteModalLabel').innerHTML = '<i class="bi bi-pencil-square"></i> Editar Nota';
  noteModal.show();
};

// Eliminar nota
window.deleteNoteHandler = async (id) => {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  
  if (!confirm(`¿Estás seguro de eliminar "${note.title}"?`)) {
    return;
  }
  
  try {
    await API.deleteNote(id);
    await DB.deleteNoteOffline(id);
    Notifications.notifyNoteDeleted(note.title);
    await loadNotes();
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    
    // Si estamos offline, eliminar solo de IndexedDB
    if (!API.getConnectionStatus()) {
      await DB.deleteNoteOffline(id);
      await loadNotes();
      Notifications.showToast('Nota eliminada offline', 'warning');
    } else {
      Notifications.showToast('Error al eliminar la nota', 'error');
    }
  }
};

// Obtener ubicación con Geolocation API
const getLocation = () => {
  if (!navigator.geolocation) {
    Notifications.showToast('Tu navegador no soporta geolocalización', 'warning');
    return;
  }
  
  Notifications.showToast('Obteniendo ubicación...', 'info');
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      document.getElementById('noteLocation').value = locationString;
      Notifications.showToast('Ubicación obtenida', 'success');
      
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    },
    (error) => {
      console.error('Error al obtener ubicación:', error);
      Notifications.showToast('No se pudo obtener la ubicación', 'error');
    }
  );
};

// Limpiar formulario
const clearForm = () => {
  document.getElementById('noteId').value = '';
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').value = '';
  document.getElementById('reminderDate').value = '';
  document.getElementById('noteLocation').value = '';
  document.querySelector('input[name="noteColor"][value="#caffbf"]').checked = true;
  currentNote = null;
};

// Utilidades
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
