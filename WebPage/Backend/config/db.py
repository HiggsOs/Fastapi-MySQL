from sqlalchemy import create_engine,MetaData
from sqlalchemy.orm import sessionmaker
from credentials import db_credential

engine=create_engine(db_credential)
meta =MetaData()
conn = engine.connect()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



