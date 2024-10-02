from fastapi import APIRouter,HTTPException
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select
dayRoute = APIRouter()

# Imprime todos los valores que hay en la tabla taxisTB

def get_last_day():
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Day]
       
        

@dayRoute.get("/day",tags=["Basic info from database"])
async def read_last_day():
    last_day = get_last_day()
    if last_day is not None:
        return {"day": last_day}
    raise HTTPException(status_code=404, detail="No data found")