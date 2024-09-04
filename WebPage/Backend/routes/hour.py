from fastapi import APIRouter,HTTPException
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select
hourRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_hour():
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Hour]
        else:
            return None
        

@hourRoute.get("/hour")
async def read_last_hour():
    last_hour = get_last_hour()
    if last_hour is not None:
        return {"last_latitude": last_hour}
    else:
        raise HTTPException(status_code=404, detail="No data found")
    