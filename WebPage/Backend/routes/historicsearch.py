from fastapi import APIRouter, HTTPException, Query
from models.taxis import taxisTB
from config.db import conn, SessionLocal
from sqlalchemy import select

historicSearch = APIRouter()

# Función para obtener registros entre un rango de días
def get_Days(start_day, end_day):
    with SessionLocal() as session:
        stmt = select(taxisTB).where(taxisTB.c.Day.between(start_day, end_day))
        result = session.execute(stmt).fetchall()  # Usamos fetchall() para obtener todos los resultados
        return result if result else None

# Ruta para consultar registros por un rango de días
@historicSearch.get("/search_days/")
async def read_Days(start_day: str = Query(..., description="El día de inicio en formato YYYY-MM-DD"),
                    end_day: str = Query(..., description="El día de fin en formato YYYY-MM-DD")):
    result = get_Days(start_day=start_day, end_day=end_day)
    if result is not None:
        return {"resultados": result}
    raise HTTPException(status_code=404, detail="No se encontraron datos para el rango de días solicitado")
