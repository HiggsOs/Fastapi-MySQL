from fastapi import FastAPI
from routes.taxis import taxis

app = FastAPI()
app.include_router(taxis)

