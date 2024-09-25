from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from routes.taxis import taxis
from routes.receive_data import receive_data
from routes.day import dayRoute
from routes.latitude import latitudeRoute
from routes.longitude import longitudeRoute
from routes.hour import hourRoute
from routes.historicsearch import historicSearch

app = FastAPI()

# Usar la carpeta 'static' para las plantillas HTML
templates = Jinja2Templates(directory="static")

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

