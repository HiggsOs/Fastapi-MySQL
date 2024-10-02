from fastapi import APIRouter, HTTPException, Query
from models.taxis import taxisTB
from config.db import SessionLocal
from sqlalchemy import select
from datetime import datetime, timedelta
import logging

position = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_by_geo(lat_min, lat_max, long_min, long_max):
    try:
        with SessionLocal() as session:
            stmt = select(taxisTB).where(
                taxisTB.c.Latitude.between(lat_min, lat_max),
                taxisTB.c.Longitude.between(long_min, long_max)
            )
            result = session.execute(stmt).fetchall()
            logger.info(f"Resultados obtenidos: {result}")
            return [dict(row) for row in result]
    except Exception as e:
        logger.error(f"Error al obtener datos por geolocalización: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def agrupar_por_tiempo(resultados):
    if not resultados:
        return {}

    polilineas = {}
    polilinea_index = 1
    polilineas[f'poliline {polilinea_index}'] = []

    for resultado in resultados:
        logger.info(f"Hora original: {resultado['Hour']}, Día: {resultado['Day']}")

        try:
            # Combinar Day y Hour para crear un datetime
            fecha_str = f"{resultado['Day']} {resultado['Hour'].strip()}"
            resultado['datetime'] = datetime.strptime(fecha_str, '%Y-%m-%d %H:%M:%S.%f')
        except ValueError:
            try:
                # Si falla, intentar sin milisegundos
                fecha_str = f"{resultado['Day']} {resultado['Hour'].strip()}"
                resultado['datetime'] = datetime.strptime(fecha_str, '%Y-%m-%d %H:%M:%S')
            except Exception as e:
                logger.error(f"Error al convertir la hora: {resultado['Hour']} - {e}")
                raise HTTPException(status_code=500, detail=f"Error en el formato de hora: {resultado['Hour']}")

    # Agregar el primer resultado a la primera polilinea
    polilineas[f'poliline {polilinea_index}'].append(resultados[0])

    for i in range(1, len(resultados)):
        tiempo_diferencia = resultados[i]['datetime'] - resultados[i - 1]['datetime']

        if tiempo_diferencia <= timedelta(minutes=1):
            polilineas[f'poliline {polilinea_index}'].append(resultados[i])
        else:
            polilinea_index += 1
            polilineas[f'poliline {polilinea_index}'] = [resultados[i]]

    logger.info(f"Número de polilineas creadas: {len(polilineas)}")
    return polilineas

@position.get("/api/position", description="GET /api/position?lat_min=4.5&lat_max=4.7&long_min=-74.2&long_max=-74.0",tags=["Complex info from database"])
async def read_geo(lat_min: float = Query(..., description="Minimum latitude"),
                   lat_max: float = Query(..., description="Maximum latitude"),
                   long_min: float = Query(..., description="Minimum longitude"),
                   long_max: float = Query(..., description="Maximum longitude")):
    result = agrupar_por_tiempo(get_by_geo(lat_min=lat_min, lat_max=lat_max, long_min=long_min, long_max=long_max))
    if result:
        return {"resultados": result}
    raise HTTPException(status_code=404, detail="No data found for the geographic range requested")
