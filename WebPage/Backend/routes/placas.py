from fastapi import APIRouter,HTTPException
from models.taxis import PlacasTB
from config.db import SessionLocal
from sqlalchemy import select
from schemas.data import Placa

placasRoute = APIRouter()



def get_placas():
    with SessionLocal() as session:
        # Consulta para obtener el último registro basado en el campo 'id'
        stmt = select(PlacasTB)
        result = session.execute(stmt).fetchone()
        if result:
            return result[PlacasTB.c.Placa]
       

@placasRoute.get("/placa",tags=["Basic info from database"])
async def read_last_longitude():
    placas = get_placas()
    if placas is not None:
        return [placas]
    raise HTTPException(status_code=404, detail="No data found")


@placasRoute.post("/placa/add", tags=["Insert info to database"])
def funreceive_data(data: Placa ):
    new_data = {
        "Placas": data.placa
    }

    try:
        with SessionLocal() as session:
            session.execute(PlacasTB.insert().values(new_data))
            session.commit()
        return {"Status": "recibido"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
