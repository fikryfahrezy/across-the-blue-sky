import requests
import random
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

pokemon_api_url: str = "https://pokeapi.co/api/v2/pokemon"

def get_pokemon_from_api(path: str) -> Optional[Dict[str, Any]]:
    path = path.replace(pokemon_api_url, "")
    url: str = f"{pokemon_api_url}{path}"
    headers: Dict[str, str] = {
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)
    # Check if the request was successful
    if response.status_code != 200:
        return None

    # Parse the JSON response and return
    return response.json()

def get_pokemon_from_database(session: Any, pokemon_name: str) -> Optional[Pokemon]:
    statement = select(Pokemon).where(Pokemon.name == pokemon_name)
    results: Any = session.exec(statement)
    pokemon: Optional[Pokemon] = results.first()
    return pokemon

def save_pokemon_to_database(session: Any, pokemon: Pokemon) -> Optional[Pokemon]:
    session.add(pokemon)
    session.commit()
    session.refresh(pokemon)
    return pokemon

# Event handler for startup
@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()

# Root endpoint
@app.get("/")
def read_root() -> Dict[str, str]:
    return {"Hello": "World"}


# Endpoint to fetch a random Pokemon
@app.get("/pokemon")
def read_pokemon(session: SessionDep) -> Pokemon:
    path = "?limit=100000&offset=0"
    pokemon_list = get_pokemon_from_api(path)
    pokemon = random.choice(pokemon_list["results"])

    pokemon_from_db = get_pokemon_from_database(session, pokemon_name=pokemon["name"])
    if pokemon_from_db:
        return pokemon_from_db

    pokemon_detail = get_pokemon_from_api(pokemon["url"])
    if not pokemon_detail:
        raise HTTPException(status_code=404, detail="Pokemon not found")

    new_pokemon = Pokemon(name=pokemon["name"], detail=pokemon_detail)
    save_pokemon_to_database(session, new_pokemon)
    return new_pokemon


# Endpoint to fetch a Pokemon by name
@app.get("/pokemon/{pokemon_name}")
def read_pokemon(pokemon_name: str, session: SessionDep) -> Pokemon:
    pokemon = get_pokemon_from_database(session, pokemon_name=pokemon_name)
    if pokemon:
        return pokemon

    path = f"/{pokemon_name}"
    pokemon_detail = get_pokemon_from_api(path)
    if not pokemon_detail:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    
    new_pokemon = Pokemon(name=pokemon_name, detail=pokemon_detail)
    save_pokemon_to_database(session, new_pokemon)
    return new_pokemon