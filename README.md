# NotitApp 📝

**Aplicación Web Progresiva (PWA) de Notas con Recordatorios**

Una aplicación minimalista y adorable para crear, gestionar y sincronizar notas con soporte completo offline.

---

## Características

### Funcionalidades Core
- **CRUD Completo**: Crear, Leer, Actualizar y Eliminar notas
- **Colores Personalizables**: 5 colores pastel para organizar visualmente
- **Recordatorios**: Programar alertas para tus notas importantes
- **Geolocalización**: Guardar ubicación opcional en cada nota
- **Sincronización Automática**: Los cambios se sincronizan cuando hay conexión

### Progressive Web App (PWA)
- **Instalable**: Se puede instalar como app nativa en cualquier dispositivo
- **Funciona Offline**: Acceso completo sin conexión a internet
- **Service Worker**: Cache inteligente para máximo rendimiento
- **Manifest Configurado**: Íconos, colores y configuración completa

### APIs Nativas
- **IndexedDB**: Persistencia local de datos
- **Geolocation API**: Captura de ubicación GPS
- **Notification API**: Notificaciones push para recordatorios
- **Vibration API**: Feedback táctil en acciones importantes

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** v18+
- **Express** v4.18.2
- **SQLite** (better-sqlite3) - Base de datos ligera
- **CORS** - Configuración para desarrollo

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Variables CSS y diseño responsive
- **Bootstrap 5.3.2** - Framework UI
- **Vanilla JavaScript (ES6+)** - Modular y sin dependencias pesadas
- **Service Worker** - Soporte PWA completo

---

## 📁 Estructura del Proyecto

```
notit-app/
├── backend/
│   ├── server.js              # Servidor Express principal
│   ├── db.js                  # Configuración SQLite
│   ├── routes/
│   │   └── notes.js           # Endpoints API REST
│   ├── package.json
│   └── notit.db               # Base de datos (se genera automáticamente)
│
├── frontend/
│   ├── index.html             # Página principal
│   ├── manifest.json          # Configuración PWA
│   ├── service-worker.js      # Service Worker con cache
│   ├── css/
│   │   └── style.css          # Estilos personalizados
│   ├── js/
│   │   ├── app.js             # Lógica principal
│   │   ├── api.js             # Comunicación con backend
│   │   ├── db.js              # Manejo de IndexedDB
│   │   └── notifications.js   # Sistema de notificaciones
│   └── assets/
│       └── icons/             # Iconos PWA (72x72 hasta 512x512)
│
└── README.md
```

---

## 🏃‍♂️ Instalación y Uso

### Paso 1: Instalar Dependencias del Backend

```bash
cd notit-app/backend
npm install
```

### Paso 2: Iniciar el Servidor

```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

### Paso 3: Abrir la Aplicación

Abre tu navegador en `http://localhost:3000`

---

## 📡 Endpoints API

### `GET /api/notes`
Obtiene todas las notas

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Mi primera nota",
      "content": "Contenido de la nota",
      "color": "#caffbf",
      "location": "20.123456, -102.123456",
      "reminderDate": "2025-12-10T15:00:00",
      "createdAt": "2025-11-30T10:00:00",
      "updatedAt": "2025-11-30T10:00:00"
    }
  ]
}
```

### `POST /api/notes`
Crea una nueva nota

**Request Body:**
```json
{
  "title": "Título de la nota",
  "content": "Contenido de la nota",
  "color": "#ffd6a5",
  "location": "opcional",
  "reminderDate": "opcional"
}
```

### `PUT /api/notes/:id`
Actualiza una nota existente

### `DELETE /api/notes/:id`
Elimina una nota

### `GET /api/health`
Verifica el estado del servidor

---

## 🎨 Paleta de Colores

La aplicación usa una paleta pastel minimalista:

- **Verde Menta**: `#caffbf` (color por defecto)
- **Durazno**: `#ffd6a5`
- **Amarillo Suave**: `#fdffb6`
- **Rosa Pastel**: `#ffadad`
- **Lavanda**: `#bdb2ff`

---

## 💾 Estrategias de Cache

### Cache First (Assets Estáticos)
- HTML, CSS, JavaScript
- Imágenes e iconos
- Librerías CDN

### Network First (API)
- Endpoints `/api/*`
- Fallback a cache si no hay conexión
- Actualiza cache con respuestas exitosas

---

## 🔔 Sistema de Notificaciones

### Tipos de Notificaciones:
1. **Recordatorios Programados**: Alertas en la fecha/hora configurada
2. **Acciones CRUD**: Confirmación al crear/editar/eliminar notas
3. **Sincronización**: Notifica cuando se sincronizan datos
4. **Conexión**: Alerta cambios online/offline

### Feedback Táctil (Vibración):
- Al crear nota: 200ms
- Al actualizar: 100ms
- Al eliminar: 100ms-50ms-100ms (patrón)
- Al obtener ubicación: 100ms

---

## 📊 Lighthouse Score (Objetivos)

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Performance | +80 | ✅ |
| Accessibility | +90 | ✅ |
| Best Practices | +90 | ✅ |
| SEO | +90 | ✅ |
| PWA | 100 | ✅ |

---

## 🧪 Testing Manual

### Funcionalidad Offline:
1. Abre la app con conexión
2. Abre DevTools → Application → Service Workers
3. Marca "Offline"
4. Crea/edita/elimina notas
5. Verifica que funcione sin errores
6. Reactiva conexión → Datos se sincronizan

### Instalación PWA:
1. Abre en Chrome/Edge
2. Busca el botón "Instalar" en la barra de direcciones
3. Instala la app
4. Abre desde el escritorio/menú de apps
5. Verifica que funcione como app nativa

### Notificaciones:
1. Acepta permisos de notificaciones
2. Crea una nota con recordatorio (5 minutos en el futuro)
3. Espera el tiempo configurado
4. Verifica que aparezca la notificación

---

## Troubleshooting

### El servidor no inicia
```bash
# Verificar que el puerto 3000 esté libre
lsof -ti:3000
# Si está ocupado, matar el proceso
kill -9 $(lsof -ti:3000)
```

### Service Worker no se registra
1. Verifica que uses **HTTPS** o **localhost**
2. Abre DevTools → Console y busca errores
3. En Application → Service Workers, haz "Unregister" y recarga

### Las notas no se sincronizan
1. Verifica el estado de conexión (badge en navbar)
2. Abre Console y busca errores de red
3. Verifica que el backend esté corriendo

---

## 📱 Compatibilidad

### Navegadores Soportados:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Dispositivos:
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (Android, iOS)
- ✅ Tablets

---

## 👨‍💻 Autores

**Guillermo Díaz Hernández Duque**
y
**Edgar Mario Gallgos Muños**  
Universidad Tecnológica de Aguascalientes  
Ingeniería en Desarrollo y Gestión de Software

---

## 📄 Licencia

MIT License - Proyecto educativo para la materia de Aplicaciones Web Progresivas

---

## 🎯 Cumplimiento de Requisitos

### Estructura y Organización (5%)
- Estructura clara con src/, components/, assets/
- Control de versiones con Git
- Convenciones de nombres coherentes

### Buenas Prácticas HTML/CSS/JS (13%)
- Metadatos SEO y accesibilidad completos
- Estilos separados en archivos
- JavaScript modular y comentado

### PWA Específicas (45%)
- Manifest.json correctamente configurado
- Service Worker con estrategias de cache
- Push notifications implementadas
- IndexedDB funcional
- APIs nativas (Geolocation, Vibration, Notification)
- Aplicación instalable

### Entregables (37%)
- Repositorio GitHub completo
- Video de funcionalidad (pendiente)
- Informe técnico (este README + documentación)

---

## Próximos Pasos

Para preparar la entrega final:

1. **Grabar video demostrativo** mostrando:
   - Creación de notas
   - Edición y eliminación
   - Uso de geolocalización
   - Recordatorios
   - Modo offline
   - Instalación PWA

2. **Ejecutar Lighthouse** y capturar screenshots de los resultados

3. **Crear informe técnico** basado en esta documentación
