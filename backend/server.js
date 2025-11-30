// Servidor Express principal
const express = require('express');
const cors = require('cors');
const path = require('path');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permitir CORS para el frontend
app.use(express.json()); // Parsear JSON en requests
app.use(express.static(path.join(__dirname, '../frontend'))); // Servir archivos estáticos del frontend

// Rutas API
app.use('/api/notes', notesRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'NotitApp API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta principal (servir index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`);
});

module.exports = app;
