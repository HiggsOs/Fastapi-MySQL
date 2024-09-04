from fastapi import FastAPI
from routes.taxis import taxis
from routes.receive_data import receive_data

app = FastAPI()
app.include_router(taxis)
app.include_router(receive_data)
