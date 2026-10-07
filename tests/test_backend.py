from fastapi.testclient import TestClient

from backend.bfs import next_step, shortest_path
from backend.game import GameManager
from backend.main import app


def test_bfs_finds_shortest_path():
    maze = [[0, 0, 1], [1, 0, 1], [1, 0, 0]]
    assert shortest_path(maze, (0, 0), (2, 2)) == [(0, 0), (0, 1), (1, 1), (2, 1), (2, 2)]
    assert next_step(maze, (0, 0), (2, 2)) == (0, 1)


def test_bfs_handles_blocked_and_invalid_positions():
    maze = [[0, 1], [1, 0]]
    assert shortest_path(maze, (0, 0), (1, 1)) == []
    assert shortest_path(maze, (-1, 0), (1, 1)) == []
    assert shortest_path([], (0, 0), (0, 0)) == []


def test_game_enemy_move_is_valid_and_restart_works():
    manager = GameManager()
    state = manager.start(1)
    old_session = state.session_id
    before = state.enemy
    moved = manager.enemy_next_move(old_session)
    assert moved.enemy != before
    assert shortest_path(moved.maze, before, moved.enemy)
    restarted = manager.restart(old_session)
    assert restarted.session_id == old_session
    assert restarted.level == 1
    assert restarted.player == (1, 1)


def test_all_levels_load():
    manager = GameManager()
    for level in range(1, 16):
        state = manager.start(level)
        assert len(state.maze) == state.maze.__len__()
        assert state.maze[1][1] == 0
        assert state.player != state.exit


def test_api_endpoints_and_player_move():
    client = TestClient(app)
    assert client.get("/").status_code == 200
    levels = client.get("/api/levels")
    assert levels.status_code == 200
    assert len(levels.json()) == 15
    assert client.get("/api/levels/99").status_code == 404

    started = client.post("/api/game/start", json={"level": 1})
    assert started.status_code == 200
    state = started.json()
    session_id = state["session_id"]
    move = next(
        {"row_delta": row_delta, "col_delta": col_delta}
        for row_delta, col_delta in ((-1, 0), (1, 0), (0, -1), (0, 1))
        if state["maze"][1 + row_delta][1 + col_delta] == 0
    )
    assert client.post("/api/game/move", json={
        "session_id": session_id, **move
    }).status_code == 200
    assert client.post("/api/game/move", json={
        "session_id": session_id, "row_delta": 2, "col_delta": 0
    }).status_code == 422
    assert client.post("/api/enemy/next-move", json={"session_id": session_id}).status_code == 200
    assert client.post("/api/game/restart", json={"session_id": session_id}).status_code == 200
    assert client.post("/api/enemy/next-move", json={"session_id": "missing"}).status_code == 404
