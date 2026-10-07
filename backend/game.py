"""Authoritative EscapeX game state and maze generation."""

from dataclasses import dataclass
import random
import uuid
from typing import Any

from .bfs import Position, shortest_path

LEVELS: tuple[dict[str, Any], ...] = (
    {"name": "AWAKENING", "subtitle": "THE HUNT BEGINS", "theme": "awakening", "rows": 15, "cols": 25, "enemy_delay": 620, "seed": 1001, "extra_openings": 8},
    {"name": "FIRST CONTACT", "subtitle": "THE HUNTER HAS AWAKENED", "theme": "first-contact", "rows": 15, "cols": 25, "enemy_delay": 590, "seed": 2037, "extra_openings": 9},
    {"name": "THE PURSUIT", "subtitle": "DISTANCE IS COLLAPSING", "theme": "pursuit", "rows": 15, "cols": 25, "enemy_delay": 560, "seed": 3019, "extra_openings": 10},
    {"name": "DEAD SIGNAL", "subtitle": "NO SIGNAL. NO HELP.", "theme": "dead-signal", "rows": 15, "cols": 25, "enemy_delay": 530, "seed": 4091, "extra_openings": 11},
    {"name": "INTO THE DARK", "subtitle": "VISIBILITY IS A LUXURY", "theme": "into-dark", "rows": 17, "cols": 27, "enemy_delay": 500, "seed": 5017, "extra_openings": 12},
    {"name": "HUNTER PROTOCOL", "subtitle": "THE AI IS LEARNING", "theme": "hunter-protocol", "rows": 17, "cols": 27, "enemy_delay": 470, "seed": 6073, "extra_openings": 13},
    {"name": "NO SAFE PATH", "subtitle": "EVERY ROUTE HAS A COST", "theme": "no-safe-path", "rows": 17, "cols": 27, "enemy_delay": 440, "seed": 7013, "extra_openings": 14},
    {"name": "THE MAZE REMEMBERS", "subtitle": "THE HUNTER REMEMBERS YOUR MOVES", "theme": "maze-remembers", "rows": 17, "cols": 27, "enemy_delay": 410, "seed": 8099, "extra_openings": 15},
    {"name": "CLOSING DISTANCE", "subtitle": "RUN FASTER", "theme": "closing-distance", "rows": 19, "cols": 29, "enemy_delay": 380, "seed": 9011, "extra_openings": 16},
    {"name": "PREDATOR MODE", "subtitle": "THE HUNTER IS NOW AGGRESSIVE", "theme": "predator-mode", "rows": 19, "cols": 29, "enemy_delay": 350, "seed": 10007, "extra_openings": 17},
    {"name": "CRITICAL ESCAPE", "subtitle": "EXIT WINDOW IS CLOSING", "theme": "critical-escape", "rows": 19, "cols": 29, "enemy_delay": 320, "seed": 11003, "extra_openings": 18},
    {"name": "ZERO VISIBILITY", "subtitle": "TRUST YOUR INSTINCT", "theme": "zero-visibility", "rows": 21, "cols": 31, "enemy_delay": 290, "seed": 12011, "extra_openings": 19},
    {"name": "THE LAST ROUTE", "subtitle": "THERE IS NOWHERE LEFT TO HIDE", "theme": "last-route", "rows": 21, "cols": 31, "enemy_delay": 260, "seed": 13007, "extra_openings": 20},
    {"name": "FINAL PURSUIT", "subtitle": "THE HUNTER IS BEHIND YOU", "theme": "final-pursuit", "rows": 21, "cols": 31, "enemy_delay": 230, "seed": 14009, "extra_openings": 21},
    {"name": "ESCAPEX: TERMINAL", "subtitle": "THE FINAL EXIT", "theme": "terminal", "rows": 21, "cols": 31, "enemy_delay": 190, "seed": 15013, "extra_openings": 23},
)


def _generate_maze(rows: int, cols: int, seed: int, extra_openings: int) -> list[list[int]]:
    rng = random.Random(seed)
    grid = [[1] * cols for _ in range(rows)]
    stack = [(1, 1)]
    grid[1][1] = 0
    directions = [(-2, 0), (2, 0), (0, -2), (0, 2)]
    while stack:
        row, col = stack[-1]
        possible = [(dr, dc) for dr, dc in directions
                    if 0 < row + dr < rows - 1 and 0 < col + dc < cols - 1
                    and grid[row + dr][col + dc] == 1]
        if not possible:
            stack.pop()
            continue
        dr, dc = rng.choice(possible)
        grid[row + dr // 2][col + dc // 2] = 0
        grid[row + dr][col + dc] = 0
        stack.append((row + dr, col + dc))



    candidates = []
    for row in range(1, rows - 1):
        for col in range(1, cols - 1):
            if grid[row][col] == 1 and sum(
                grid[row + dr][col + dc] == 0
                for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1))
            ) >= 2:
                candidates.append((row, col))
    rng.shuffle(candidates)
    for row, col in candidates[:extra_openings]:
        grid[row][col] = 0
    return grid


def _distance_map(maze: list[list[int]], start: Position) -> dict[Position, int]:
    distances = {start: 0}
    frontier = [start]
    rows, cols = len(maze), len(maze[0])
    while frontier:
        current = frontier.pop(0)
        for neighbor in ((current[0] - 1, current[1]), (current[0] + 1, current[1]),
                         (current[0], current[1] - 1), (current[0], current[1] + 1)):
            row, col = neighbor
            if (neighbor not in distances and 0 <= row < rows and 0 <= col < cols
                    and maze[row][col] == 0):
                distances[neighbor] = distances[current] + 1
                frontier.append(neighbor)
    return distances


@dataclass
class GameState:
    session_id: str
    level: int
    maze: list[list[int]]
    player: Position
    enemy: Position
    exit: Position
    status: str = "playing"

    def as_dict(self) -> dict[str, Any]:
        level = LEVELS[self.level - 1]
        return {
            "session_id": self.session_id, "level": self.level,
            "name": level["name"], "subtitle": level["subtitle"], "theme": level["theme"],
            "maze": self.maze,
            "player": {"row": self.player[0], "col": self.player[1]},
            "enemy": {"row": self.enemy[0], "col": self.enemy[1]},
            "exit": {"row": self.exit[0], "col": self.exit[1]}, "status": self.status,
        }


def _new_state(level_number: int, session_id: str | None = None) -> GameState:
    if not 1 <= level_number <= len(LEVELS):
        raise ValueError("Invalid level")
    level = LEVELS[level_number - 1]
    maze = _generate_maze(level["rows"], level["cols"], level["seed"], level["extra_openings"])
    player = (1, 1)
    distances = _distance_map(maze, player)
    exit_position = max(distances, key=distances.get)
    exit_distances = _distance_map(maze, exit_position)
    candidates = [(position, distance * 0.72 + exit_distances.get(position, 0) * 0.28)
                  for position, distance in distances.items() if distance >= 8]
    enemy = max(candidates, key=lambda item: item[1])[0] if candidates else (level["rows"] - 2, level["cols"] - 2)
    return GameState(session_id or str(uuid.uuid4()), level_number, maze, player, enemy, exit_position)


class GameManager:
    def __init__(self) -> None:
        self._games: dict[str, GameState] = {}

    def start(self, level: int) -> GameState:
        state = _new_state(level)
        self._games[state.session_id] = state
        return state

    def get(self, session_id: str) -> GameState:
        try:
            return self._games[session_id]
        except KeyError as exc:
            raise KeyError("Unknown game session") from exc

    def restart(self, session_id: str) -> GameState:
        current = self.get(session_id)
        state = _new_state(current.level, session_id)
        self._games[session_id] = state
        return state

    def move_player(self, session_id: str, row_delta: int, col_delta: int) -> GameState:
        state = self.get(session_id)
        if state.status != "playing":
            return state
        if abs(row_delta) + abs(col_delta) != 1:
            raise ValueError("Movement must be one cardinal step")
        target = (state.player[0] + row_delta, state.player[1] + col_delta)
        if not shortest_path(state.maze, state.player, target):
            raise ValueError("Player cannot move into that cell")
        state.player = target
        if state.player == state.exit:
            state.status = "won"
        elif state.player == state.enemy:
            state.status = "caught"
        return state

    def enemy_next_move(self, session_id: str) -> GameState:
        state = self.get(session_id)
        if state.status != "playing":
            return state
        path = shortest_path(state.maze, state.enemy, state.player)
        if len(path) <= 1:
            state.status = "caught"
            return state
        state.enemy = path[1]
        if state.enemy == state.player:
            state.status = "caught"
        return state
