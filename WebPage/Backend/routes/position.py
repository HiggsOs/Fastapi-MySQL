from fastapi import APIRouter, HTTPException, Query
from models.taxis import taxisTB
from config.db import  SessionLocal
from sqlalchemy import select

position = APIRouter()

# Consulta que filtra por rango de latitud y longitud
def get_by_geo(lat_min, lat_max, long_min, long_max):
    with SessionLocal() as session:
        stmt = select(taxisTB).where(
            taxisTB.c.Latitude.between(lat_min, lat_max),
            taxisTB.c.Longitude.between(long_min, long_max)
        )
        result = session.execute(stmt).fetchall()  
        return [dict(row) for row in result] if result else None

@position.get("/api/position", description="GET /api/position?lat_min=4.5&lat_max=4.7&long_min=-74.2&long_max=-74.0")
async def read_geo(lat_min: float = Query(..., description="Minimum latitude"),
                   lat_max: float = Query(..., description="Maximum latitude"),
                   long_min: float = Query(..., description="Minimum longitude"),
                   long_max: float = Query(..., description="Maximum longitude")):
    result = get_by_geo(lat_min=lat_min, lat_max=lat_max, long_min=long_min, long_max=long_max)
    if result is not None:
        return {"resultados": result}
    raise HTTPException(status_code=404, detail="No data found for the geographic range requested")
