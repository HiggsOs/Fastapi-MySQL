from fastapi import APIRouter,HTTPException,Query
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select

longitudeRoute = APIRouter()



def get_last_longitude(placa:str):
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).where(taxisTB.c.Placas == placa).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Longitude]
       

@longitudeRoute.get("/longitude",tags=["Basic info from database"])
async def read_last_longitude(placa: str = Query(..., description="Placa del vehículo")):
    last_longitude = get_last_longitude(placa)
    if last_longitude is not None:
        return {"longitude": last_longitude}
    raise HTTPException(status_code=404, detail="No data found")