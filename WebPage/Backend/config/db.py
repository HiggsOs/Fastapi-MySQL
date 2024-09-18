from sqlalchemy import create_engine,MetaData
from sqlalchemy.orm import sessionmaker
import os
db_credential = os.getenv('keyDB')

engine=create_engine(db_credential)
meta =MetaData()
conn = engine.connect()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



