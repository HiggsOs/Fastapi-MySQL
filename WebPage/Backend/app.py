from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes.taxis import taxis
from routes.receive_data import receive_data
from routes.day import dayRoute
from routes.latitude import latitudeRoute
from routes.longitude import longitudeRoute
from routes.hour import hourRoute
import uvicorn

app = FastAPI()
app.include_router(taxis)
app.include_router(receive_data)
app.include_router(dayRoute)
app.include_router(latitudeRoute)
app.include_router(longitudeRoute)
app.include_router(hourRoute)

app.mount("/", StaticFiles(directory="./static"), name="static")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=80, log_level="info")