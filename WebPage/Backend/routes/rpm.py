from fastapi import APIRouter,HTTPException
from models.taxis import taxisTB
from config.db import conn,SessionLocal
from sqlalchemy import select

RPM = APIRouter()



def get_last_RPM():
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(taxisTB).order_by(taxisTB.c.id.desc()).limit(1)
        result = session.execute(stmt).fetchone()
        if result:
            return result[taxisTB.c.RPM]
       

@RPM.get("/RPM",tags=["Basic info from database"])
async def read_last_RPM():
    last_RPM = get_last_RPM()
    if last_RPM is not None:
        return {"RPM": last_RPM}
    raise HTTPException(status_code=404, detail="No data found")