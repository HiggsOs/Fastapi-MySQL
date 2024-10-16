from fastapi import APIRouter
apiName = APIRouter()


import os
name = os.getenv('NAME')

@apiName.get("/name")
async def namefun():
    print(name)
    return {"variable":name}