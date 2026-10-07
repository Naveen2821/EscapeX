"""FastAPI application for the EscapeX game backend."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .game import LEVELS, GameManager

app = FastAPI(title="EscapeX", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

games = GameManager()


class StartRequest(BaseModel):
    level: int = Field(default=1, ge=1, le=len(LEVELS))


class SessionRequest(BaseModel):
    session_id: str = Field(min_length=1)


class MoveRequest(SessionRequest):
    row_delta: int = Field(ge=-1, le=1)
    col_delta: int = Field(ge=-1, le=1)


def _state_or_404(session_id: str):
    try:
        return games.get(session_id)
    except KeyError as exc:
        raise HTTPException(
            status_code=404,
            detail="Unknown game session",
        ) from exc


@app.get("/")
def home():
    return {
        "game": "EscapeX",
        "status": "online",
        "message": "EscapeX backend is running!",
    }


@app.get("/api/levels")
def levels():
    return [
        {
            key: value
            for key, value in level.items()
            if key not in {"seed", "extra_openings"}
        }
        for level in LEVELS
    ]


@app.get("/api/levels/{level_number}")
def level_details(level_number: int):
    if not 1 <= level_number <= len(LEVELS):
        raise HTTPException(
            status_code=404,
            detail="Level must be between 1 and 15",
        )

    level = LEVELS[level_number - 1]

    return {
        "level": level_number,
        **{
            key: value
            for key, value in level.items()
            if key not in {"seed", "extra_openings"}
        },
    }


@app.post("/api/game/start")
def start_game(request: StartRequest):
    return games.start(request.level).as_dict()


@app.post("/api/game/move")
def move_player(request: MoveRequest):
    _state_or_404(request.session_id)

    try:
        return games.move_player(
            request.session_id,
            request.row_delta,
            request.col_delta,
        ).as_dict()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/enemy/next-move")
def enemy_next_move(request: SessionRequest):
    _state_or_404(request.session_id)
    return games.enemy_next_move(request.session_id).as_dict()


@app.post("/api/game/restart")
def restart_game(request: SessionRequest):
    _state_or_404(request.session_id)
    return games.restart(request.session_id).as_dict()


