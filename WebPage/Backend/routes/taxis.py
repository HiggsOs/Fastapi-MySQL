from fastapi import APIRouter
from models.taxis import taxisTB
from config.db import conn
taxis = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

@taxis.get("/taxis")
def get_from_taxis():
    return conn.execute(taxisTB.select()).fetchall()


