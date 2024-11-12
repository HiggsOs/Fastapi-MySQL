from fastapi import APIRouter, HTTPException, Query
from models.taxis import taxisTB
from config.db import conn, SessionLocal
from sqlalchemy import select,and_,func
from routes.position import agrupar_por_tiempo

apiSearch_HAP = APIRouter()


def get_DH_Pos(start_day, end_day, start_hour, end_hour,lat_min,lat_max,long_min,long_max,placa):
   with SessionLocal() as session:
    # Convertir el día y la hora en un solo campo de fecha/hora
    stmt = select(taxisTB).where(
        and_(
            func.concat(taxisTB.c.Day, ' ', taxisTB.c.Hour).between(
                f'{start_day} {start_hour}',
                f'{end_day} {end_hour}',
                taxisTB.c.Placas == placa
            )
        )
        ,taxisTB.c.Latitude.between(lat_min, lat_max),
        taxisTB.c.Longitude.between(long_min, long_max)
    )
    result = session.execute(stmt).fetchall()
    return [dict(row) for row in result]
    

@apiSearch_HAP.get("/apisearch",tags=["Complex info from database"],description="/apisearch?start_day=2024-09-10&end_day=2024-09-12&start_hour=00%3A00&end_hour=00%3A00&lat_min=10.9221615&lat_max=10.9221666&long_min=-75&long_max=-74")
async def epsearch(
    start_day: str = Query(..., description="start day in format YYYY-MM-DD"),
    end_day: str = Query(..., description="End day in format YYYY-MM-DD"),
    start_hour: str = Query(..., description="Start hour in format HH:MM"),
    end_hour: str = Query(..., description="End Hour in format HH:MM"),
    lat_min: float = Query(..., description="Minimum latitude"),
    lat_max: float = Query(..., description="Maximum latitude"),
    long_min: float = Query(..., description="Minimum longitude"),
    long_max: float = Query(..., description="Maximum longitude"),
    placa:str=Query(...,"Placa del vehiculo")
):
    result = agrupar_por_tiempo(get_DH_Pos(start_day=start_day,end_day=end_day,start_hour=start_hour,end_hour=end_hour,lat_min=lat_min, lat_max=lat_max, long_min=long_min, long_max=long_max,placa=placa))
    if result:
        return {"resultados": result}
    raise HTTPException(status_code=404, detail="No data found for the geographic range requested")
