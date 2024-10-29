from sqlalchemy import Table,Column
from sqlalchemy.sql.sqltypes import INTEGER,String
from config.db import meta,engine

taxisTB=Table("Taxis",meta,
            Column("id",INTEGER,primary_key=True),
            Column("Latitude",String(100)),
            Column("Longitude",String(100)),
            Column("Day",String(100)),
            Column("Hour",String(100)),
            Column("RPM",String(100)),
            Column("Speed",String(100)),
            Column("Placas",String(100))
            )

meta.create_all(engine)


