from pydantic import BaseModel

class Data(BaseModel):
    latitud: str
    longitud: str
    dia: str
    hora: str
    rpm:str
    speed:str
