from fastapi import APIRouter,HTTPException
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select
dayRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_plate():
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Placas]
       
        

@dayRoute.get("/placa",tags=["Basic info from database"])
async def read_last_plate():
    last_plate = get_last_plate()
    if last_plate is not None:
        return {"plate": last_plate}
    raise HTTPException(status_code=404, detail="No data found")