from fastapi import APIRouter,HTTPException
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select

Speed = APIRouter()



def get_last_Speed():
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.Speed]
       

@Speed.get("/speed",tags=["Basic info from database"])
async def read_last_Speed():
    last_Speed = get_last_Speed()
    if last_Speed is not None:
        return {"Speed": last_Speed}
    raise HTTPException(status_code=404, detail="No data found")
