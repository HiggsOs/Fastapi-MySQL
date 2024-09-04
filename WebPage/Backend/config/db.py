from sqlalchemy import create_engine,MetaData
from sqlalchemy.orm import sessionmaker

engine=create_engine("mysql+pymysql://root:Admin_1234@localhost:3306/gps2")
meta =MetaData()
conn = engine.connect()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
