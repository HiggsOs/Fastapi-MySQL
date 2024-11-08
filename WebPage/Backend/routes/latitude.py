from fastapi import APIRouter,HTTPException,Query
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select
latitudeRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_latitude(placa:str):
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).where(taxisTB.c.Placas == placa).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Latitude]
        

@latitudeRoute.get("/latitude",tags=["Basic info from database"])
async def read_last_latitude(placa: str = Query(..., description="Placa del vehículo")):
    last_latitude = get_last_latitude(placa)
    if last_latitude is not None:
        return {"latitude": last_latitude}
    raise HTTPException(status_code=404, detail="No data found")