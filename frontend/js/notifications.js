// Manejo de notificaciones push y recordatorios

// Solicitar permiso para notificaciones
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Mostrar notificación
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      ...options,
    });
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => notification.close(), 5000);
    
    return notification;
  }
  return null;
};

// Mostrar toast en la UI
export const showToast = (message, type = 'info') => {
  const toastElement = document.getElementById('notificationToast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (toastElement && toastMessage) {
    toastMessage.textContent = message;
    
    // Cambiar color según tipo
    const toastHeader = toastElement.querySelector('.toast-header');
    toastHeader.className = 'toast-header';
    
    switch (type) {
      case 'success':
        toastHeader.classList.add('bg-success', 'text-white');
        break;
      case 'error':
        toastHeader.classList.add('bg-danger', 'text-white');
        break;
      case 'warning':
        toastHeader.classList.add('bg-warning');
        break;
      default:
        toastHeader.classList.add('bg-info', 'text-white');
    }
    
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
};

// Programar recordatorio para una nota
export const scheduleReminder = (note) => {
  if (!note.reminderDate) return;
  
  const reminderTime = new Date(note.reminderDate).getTime();
  const now = Date.now();
  const timeUntilReminder = reminderTime - now;
  
  if (timeUntilReminder > 0) {
    setTimeout(() => {
      // Vibrar dispositivo si está disponible
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      
      // Mostrar notificación
      showNotification('Recordatorio: ' + note.title, {
        body: note.content.substring(0, 100) + '...',
        tag: `reminder-${note.id}`,
        requireInteraction: true,
      });
      
      // También mostrar toast
      showToast(`Recordatorio: ${note.title}`, 'warning');
    }, timeUntilReminder);
    
    console.log(`Recordatorio programado para: ${note.title}`);
  }
};

// Programar todos los recordatorios activos
export const scheduleAllReminders = (notes) => {
  notes.forEach(note => {
    if (note.reminderDate) {
      scheduleReminder(note);
    }
  });
};

// Notificación de bienvenida
export const showWelcomeNotification = async () => {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    showNotification('¡Bienvenido a NotitApp!', {
      body: 'Tus notas están seguras y disponibles offline',
      tag: 'welcome',
    });
  }
};

// Notificación cuando se crea una nota
export const notifyNoteCreated = (noteTitle) => {
  // Vibrar dispositivo
  if ('vibrate' in navigator) {
    navigator.vibrate(200);
  }
  
  showToast(`Nota "${noteTitle}" creada exitosamente`, 'success');
};

// Notificación cuando se actualiza una nota
export const notifyNoteUpdated = (noteTitle) => {
  // Vibrar dispositivo
  if ('vibrate' in navigator) {
    navigator.vibrate(100);
  }
  
  showToast(`Nota "${noteTitle}" actualizada`, 'success');
};

// Notificación cuando se elimina una nota
export const notifyNoteDeleted = (noteTitle) => {
  // Vibrar dispositivo
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
  
  showToast(`Nota "${noteTitle}" eliminada`, 'warning');
};

// Notificación de sincronización
export const notifySyncComplete = () => {
  showToast('Notas sincronizadas correctamente', 'success');
};

export const notifySyncError = () => {
  showToast('Error al sincronizar. Trabajando offline.', 'error');
};
