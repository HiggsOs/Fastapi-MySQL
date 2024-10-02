from fastapi import APIRouter,HTTPException
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select
hourRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_hour():
    with SessionLocal() as session:
        stmt = select(taxisTB).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Hour]
        
        

@hourRoute.get("/hour",tags=["Basic info from database"])
async def read_last_hour():
    last_hour = get_last_hour()
    if last_hour is not None:
        return {"hour": last_hour}
    raise HTTPException(status_code=404, detail="No data found")
