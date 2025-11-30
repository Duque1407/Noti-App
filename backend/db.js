// db.js - Configuración de SQLite
const Database = require('better-sqlite3');
const path = require('path');

// Crear conexión a la base de datos
const db = new Database(path.join(__dirname, 'notit.db'));

// Crear tabla si no existe
const initDB = () => {
  const createTable = `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      color TEXT DEFAULT '#ffd6a5',
      location TEXT,
      reminderDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.exec(createTable);
  console.log('✅ Base de datos inicializada');
};

// Inicializar al cargar el módulo
initDB();

module.exports = db;
