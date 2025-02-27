from typing import Annotated, Union
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select, JSON, Column
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

class Pokemon(SQLModel, table=True):
    name: str = Field(index=True, primary_key=True)
    detail: dict = Field(default_factory=dict, sa_column=Column(JSON))

    # Needed for Column(JSON)
    class Config:
        arbitrary_types_allowed = True


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
settings = Settings()
app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/pokemons/{pokemon_name}")
def read_hero(pokemon_name: str, session: SessionDep) -> Pokemon:
    statement = select(Pokemon).where(Pokemon.name == pokemon_name)
    results = session.exec(statement)
    pokemon = results.first()
    if not pokemon:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    return pokemon