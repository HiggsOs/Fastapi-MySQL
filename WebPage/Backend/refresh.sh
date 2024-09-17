#!/bin/bash


# Ejecuta git pull para actualizar el repositorio
git pull 

# Verifica si el comando git pull fue exitoso
if [ $? -eq 0 ]; then
  echo "Repositorio actualizado correctamente."
else
  echo "Error al actualizar el repositorio."
  exit 1
fi
