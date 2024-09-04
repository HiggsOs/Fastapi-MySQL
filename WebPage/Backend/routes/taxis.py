from fastapi import APIRouter
from models.taxis import taxisTB
from config.db import conn
taxis = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

@taxis.get("/taxis")
def get_from_taxis():
    results=conn.execute(taxisTB.select()).fetchall()
    # Convertir cada fila a un diccionario
    data = [dict(row) for row in results]
    return data

