from fastapi import APIRouter,HTTPException,Query
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select

dayRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_day(placa: str):
    with SessionLocal() as session:
        # Consulta para obtener el último registro de una placa específica
        stmt = (
            select(taxisTB.c.Day)
            .where(taxisTB.c.Placas == placa)
            .order_by(taxisTB.c.id.desc())
            .limit(1)
        )
        result = session.execute(stmt).fetchone()
        if result:
            return result[0]  # `Day` es la primera columna seleccionada
        return None

@dayRoute.get("/day", tags=["Basic info from database"])
async def read_last_day(placa: str = Query(..., description="Placa del vehículo")):
    last_day = get_last_day(placa)
    if last_day is not None:
        return {"day": last_day}
    raise HTTPException(status_code=404, detail="No data found")