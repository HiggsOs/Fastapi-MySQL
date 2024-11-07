from fastapi import APIRouter,HTTPException
from models.taxis import PlacasTB
from config.db import SessionLocal
from sqlalchemy import select
from schemas.data import Placa

placasRoute = APIRouter()



def get_placas():
    with SessionLocal() as session:
        # Consulta para obtener todas las placas
        stmt = select(PlacasTB.c.Placa)  # Selecciona solo la columna Placa
        result = session.execute(stmt).fetchall()
        # Convierte el resultado a una lista de placas
        placas = [row[0] for row in result] if result else []
        return placas
    

@placasRoute.get("/placa",tags=["Basic info from database"])
async def read_last_longitude():
    placas = get_placas()
    if placas is not None:
        return placas
    raise HTTPException(status_code=404, detail="No data found")


@placasRoute.post("/placa/add", tags=["Insert info to database"])
def funreceive_data(data: Placa ):
    new_data = {
        "Placa": data.placa
    }

    try:
        with SessionLocal() as session:
            session.execute(PlacasTB.insert().values(new_data))
            session.commit()
        return {"Status": "recibido"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
