from fastapi import APIRouter
from models.taxis import taxisTB
from config.db import conn
from schemas.data import Data
receive_data = APIRouter()

@receive_data.post("/receive_data")
def receive_data(data:Data):
    new_data={"Latitude":data.latitud,
              "Longitude":data.longitud,
              "Day":data.dia,"Hour":data.hora}

    conn.execute(taxisTB.insert().values(new_data))
    return "recibido"


    