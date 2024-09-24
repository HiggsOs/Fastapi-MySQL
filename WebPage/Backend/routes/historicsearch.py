from fastapi import APIRouter, HTTPException, Query
from models.taxis import taxisTB
from config.db import conn, SessionLocal
from sqlalchemy import select,and_

historicSearch = APIRouter()

# Funtion to obtain registers between a range of days.
def get_Days(start_day, end_day):
    with SessionLocal() as session:
        stmt = select(taxisTB).where(taxisTB.c.Day.between(start_day, end_day))
        result = session.execute(stmt).fetchall()  
        return result if result else None

#Query by days and by hour
def get_Days_Hours(start_day, end_day, start_hour, end_hour):
    with SessionLocal() as session:
        # Filter by range of days y hours
        stmt = select(taxisTB).where(
            and_(
                taxisTB.c.Day.between(start_day, end_day),
                taxisTB.c.Hour.between(start_hour, end_hour)
            )
        )
        result = session.execute(stmt).fetchall()  
        return result if result else None


# Search a range with 2 parameters start_day, end_day.
@historicSearch.get("/search_days")
async def read_Days(start_day: str = Query(..., description="start day in format YYYY-MM-DD"),
                    end_day: str = Query(..., description="End day in format YYYY-MM-DD")):
    result = get_Days(start_day=start_day, end_day=end_day)
    if result is not None:
        return {"resultados": result}
    raise HTTPException(status_code=404, detail="No data was found for the range requested")

#Search a range with 4 parameters start_day, end_day start_hour, end_hour__.


@historicSearch.get("/days-hours/",description="GET /days-hours/?start_day=2024-09-01&end_day=2024-09-05&start_hour=08:00&end_hour=18:00")
async def read_Days_Hours(
    start_day: str = Query(..., description="start day in format YYYY-MM-DD"),
    end_day: str = Query(..., description="End day in format YYYY-MM-DD"),
    start_hour: str = Query(..., description="Start hour in format HH:MM"),
    end_hour: str = Query(..., description="End Hour in format HH:MM")
):
    result = get_Days_Hours(start_day=start_day, end_day=end_day, start_hour=start_hour, end_hour=end_hour)
    if result is not None:
        return {"results": result}
    raise HTTPException(status_code=404, detail="No data was found for the range requested")
