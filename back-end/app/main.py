import requests
from typing import Annotated, Dict, Any, Optional, Generator
from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Field, Session, SQLModel, create_engine, select, JSON, Column

# Define the Pokemon model with type hints
class Pokemon(SQLModel, table=True):
    name: str = Field(index=True, primary_key=True)
    detail: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

    # Needed for Column(JSON)
    class Config:
        arbitrary_types_allowed: bool = True

# Define database configuration
sqlite_file_name: str = "database.db"
sqlite_url: str = f"sqlite:///{sqlite_file_name}"

connect_args: Dict[str, bool] = {"check_same_thread": False}
engine: Any = create_engine(sqlite_url, connect_args=connect_args)

# Function to create database and tables
def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)

# Function to get a database session
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

# Define a dependency type for the session
SessionDep = Annotated[Session, Depends(get_session)]

# Initialize settings and FastAPI app
app: FastAPI = FastAPI()

# Event handler for startup
@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()

# Root endpoint
@app.get("/")
def read_root() -> Dict[str, str]:
    return {"Hello": "World"}

# Endpoint to fetch a Pokemon by name
@app.get("/pokemons/{pokemon_name}")
def read_pokemon(pokemon_name: str, session: SessionDep) -> Pokemon:
    statement = select(Pokemon).where(Pokemon.name == pokemon_name)
    results: Any = session.exec(statement)
    pokemon: Optional[Pokemon] = results.first()

    if pokemon:
        return pokemon

    url: str = f"https://pokeapi.co/api/v2/pokemon/{pokemon_name}"
    headers: Dict[str, str] = {
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)
    # Check if the request was successful
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    
    # Parse the JSON response
    data = response.json()
    new_pokemon = Pokemon(name=pokemon_name, detail=data)
    session.add(new_pokemon)
    session.commit()
    session.refresh(new_pokemon)
    return new_pokemon
