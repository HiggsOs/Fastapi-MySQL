from fastapi import APIRouter,HTTPException,Query
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select
hourRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_hour(placa: str):
    with SessionLocal() as session:
        # Consulta para obtener la última hora de una placa específica
        stmt = (
            select(taxisTB.c.Hour)
            .where(taxisTB.c.Placas == placa)
            .order_by(taxisTB.c.id.desc())
            .limit(1)
        )
        result = session.execute(stmt).fetchone()
        if result:
            return result[0]  # `Hour` es la primera columna seleccionada
        return None

@hourRoute.get("/hour", tags=["Basic info from database"])
async def read_last_hour(placa: str = Query(..., description="Placa del vehículo")):
    last_hour = get_last_hour(placa)
    if last_hour is not None:
        return {"hour": last_hour}
    raise HTTPException(status_code=404, detail="No data found")