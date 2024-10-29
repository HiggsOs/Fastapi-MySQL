from pydantic import BaseModel

class Data(BaseModel):
    latitud: str
    longitud: str
    dia: str
    hora: str
    RPM:str
    speed:str
    placa:str
