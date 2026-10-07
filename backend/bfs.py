"""Breadth-first pathfinding for EscapeX mazes."""


from collections import deque
from collections.abc import Sequence
from typing import TypeAlias

Position: TypeAlias = tuple[int, int]
Grid: TypeAlias = Sequence[Sequence[int]]

def _position(value: object) -> Position | None:
    """Return a normalized position, or None for malformed input."""
    if isinstance(value, dict):
        row, col = value.get("row"), value.get("col")
    elif isinstance(value, (tuple, list)) and len(value) == 2:
        row, col = value
    else:
        return None

    if isinstance(row, bool) or isinstance(col, bool):
        return None
    if not isinstance(row, int) or not isinstance(col, int):
        return None
    return row, col


#This bfs
def _valid_grid(maze: object) -> tuple[int, int] | None:
    if not isinstance(maze, Sequence) or isinstance(maze, (str, bytes)) or not maze:
        return None
    if not all(isinstance(row, Sequence) and not isinstance(row, (str, bytes)) for row in maze):
        return None
    width = len(maze[0])
    if width == 0 or any(len(row) != width for row in maze):
        return None
    if any(
        isinstance(cell, bool) or cell not in (0, 1)
        for row in maze
        for cell in row
    ):
        return None
    return len(maze), width


def shortest_path(maze: Grid, start: object, target: object) -> list[Position]:
    """Return the shortest inclusive path, or [] when it is invalid/unreachable."""
    dimensions = _valid_grid(maze)
    start_position = _position(start)
    target_position = _position(target)
    if dimensions is None or start_position is None or target_position is None:
        return []

    rows, cols = dimensions

    def open_cell(position: Position) -> bool:
        row, col = position
        return 0 <= row < rows and 0 <= col < cols and maze[row][col] == 0

    if not open_cell(start_position) or not open_cell(target_position):
        return []

    queue: deque[Position] = deque([start_position])
    parents: dict[Position, Position | None] = {start_position: None}
    directions = ((-1, 0), (1, 0), (0, -1), (0, 1))

    while queue:
        current = queue.popleft()
        if current == target_position:
            path: list[Position] = []
            cursor: Position | None = current
            while cursor is not None:
                path.append(cursor)
                cursor = parents[cursor]
            path.reverse()
            return path

        for row_delta, col_delta in directions:
            neighbor = (current[0] + row_delta, current[1] + col_delta)
            if open_cell(neighbor) and neighbor not in parents:
                parents[neighbor] = current
                queue.append(neighbor)

    return []


def next_step(maze: Grid, start: object, target: object) -> Position | None:
    """Return one valid movement toward target, or None when no path exists."""
    path = shortest_path(maze, start, target)
    return path[1] if len(path) > 1 else None


# Short alias for callers that use the algorithm name directly.
bfs = shortest_path