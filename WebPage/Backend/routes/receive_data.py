from fastapi import APIRouter
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from schemas.data import Data

receive_data = APIRouter()

@receive_data.post("/receive_data",tags=["Insert info to database"])
def funreceive_data(data:Data):
    new_data={"Latitude":data.latitud,
              "Longitude":data.longitud,
              "Day":data.dia,"Hour":data.hora,
              "RPM":data.RPM,"Speed":data.speed}

    with SessionLocal() as session:
        session.execute(taxisTB.insert().values(new_data))
        session.commit()
    return {"Status":"recibido"}




    