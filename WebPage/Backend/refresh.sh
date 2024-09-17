#!/bin/bash

# Cambia al directorio del repositorio
cd /ruta/al/directorio/del/repositorio || { echo "No se pudo cambiar al directo>

# Ejecuta git pull para actualizar el repositorio
git pull origin main

# Verifica si el comando git pull fue exitoso
if [ $? -eq 0 ]; then
  echo "Repositorio actualizado correctamente."
else
  echo "Error al actualizar el repositorio."
  exit 1
fi
