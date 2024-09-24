from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes.taxis import taxis
from routes.receive_data import receive_data
from routes.day import dayRoute
from routes.latitude import latitudeRoute
from routes.longitude import longitudeRoute
from routes.hour import hourRoute
from routes.historicsearch import historicSearch



app = FastAPI()

# Incluir las rutas
app.include_router(taxis)
app.include_router(receive_data)
app.include_router(dayRoute)
app.include_router(latitudeRoute)
app.include_router(longitudeRoute)
app.include_router(hourRoute)
app.include_router(historicSearch)

# Montar archivos estáticos
app.mount("/", StaticFiles(directory="./static"), name="static")