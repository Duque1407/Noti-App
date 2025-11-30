#!/bin/bash

echo "╔═══════════════════════════════════╗"
echo "║     🚀 NotitApp - Inicio Rápido  ║"
echo "╚═══════════════════════════════════╝"
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -d "backend" ]; then
  echo "❌ Error: Debes ejecutar este script desde la raíz del proyecto notit-app"
  exit 1
fi

# Instalar dependencias si no existen
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Instalando dependencias del backend..."
  cd backend
  npm install
  cd ..
  echo "✅ Dependencias instaladas"
else
  echo "✅ Dependencias ya instaladas"
fi

echo ""
echo "🚀 Iniciando servidor..."
echo ""
echo "La aplicación estará disponible en:"
echo "   👉 http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

cd backend
npm start
