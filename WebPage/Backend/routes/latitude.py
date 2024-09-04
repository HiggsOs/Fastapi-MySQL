from fastapi import APIRouter,HTTPException
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select
latitudeRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_latitude():
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Latitude]
        

@latitudeRoute.get("/latitude")
async def read_last_latitude():
    last_latitude = get_last_latitude()
    if last_latitude is not None:
        return {"latitude": last_latitude}
    raise HTTPException(status_code=404, detail="No data found")