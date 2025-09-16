#!/bin/bash

echo "🔄 Reiniciando servidor..."

# Matar procesos de Node.js
pkill -f "node.*src/index.js" || true
pkill -f "nodemon" || true

# Esperar un momento
sleep 2

# Iniciar el servidor
echo "🚀 Iniciando servidor..."
npm start
