from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from routes.taxis import taxis
from routes.receive_data import receive_data
from routes.day import dayRoute
from routes.latitude import latitudeRoute
from routes.longitude import longitudeRoute
from routes.hour import hourRoute
from routes.historicsearch import historicSearch
from routes.position import position
from routes.apiHistoricAndPosition import apiSearch_HAP
from routes.rpm import RPM
from routes.speed import Speed
from routes.name import apiName


from starlette.responses import FileResponse
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
app.include_router(position)
app.include_router(apiSearch_HAP)
app.include_router(apiName)
app.include_router(Speed)
app.include_router(RPM)

app.title="Host-Gps"
# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="./static"), name="static")

@app.get("/",tags=["Htmls in WebPage"])
async def read_index():
    return FileResponse("static/index.html")
@app.get("/position",tags=["Htmls in WebPage"])
async def read_index():
    return FileResponse("static/position.html")
@app.get("/historical",tags=["Htmls in WebPage"])
async def read_index():
    return FileResponse("static/historical.html")