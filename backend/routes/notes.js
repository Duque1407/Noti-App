// routes/notes.js - Rutas para operaciones CRUD de notas
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/notes - Obtener todas las notas
router.get('/', (req, res) => {
  try {
    const notes = db.prepare('SELECT * FROM notes ORDER BY updatedAt DESC').all();
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/notes/:id - Obtener una nota específica
router.get('/:id', (req, res) => {
  try {
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Nota no encontrada' });
    }
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/notes - Crear nueva nota
router.post('/', (req, res) => {
  try {
    const { title, content, color, location, reminderDate } = req.body;
    
    // Validar campos requeridos
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Título y contenido son requeridos' 
      });
    }

    const insert = db.prepare(`
      INSERT INTO notes (title, content, color, location, reminderDate)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      title, 
      content, 
      color || '#ffd6a5', 
      location || null, 
      reminderDate || null
    );
    
    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/notes/:id - Actualizar nota existente
router.put('/:id', (req, res) => {
  try {
    const { title, content, color, location, reminderDate } = req.body;
    
    const update = db.prepare(`
      UPDATE notes 
      SET title = ?, content = ?, color = ?, location = ?, reminderDate = ?, 
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(title, content, color, location, reminderDate, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Nota no encontrada' });
    }
    
    const updatedNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/notes/:id - Eliminar nota
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM notes WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Nota no encontrada' });
    }
    
    res.json({ success: true, message: 'Nota eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
