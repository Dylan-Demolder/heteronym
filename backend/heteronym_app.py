"""
WSGI entry point for Heteronym game.
Pure Python stdlib - no third-party dependencies needed.
"""
import sys
import os
import json as json_mod
import csv
import random
import hashlib
import sqlite3
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

# --- SQLite Database ---
DB_PATH = Path(__file__).parent / "heteronym.db"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_db()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS streaks (
                player_id TEXT PRIMARY KEY,
                current_streak INTEGER DEFAULT 0,
                max_streak INTEGER DEFAULT 0,
                last_solved_date TEXT,
                total_solved INTEGER DEFAULT 0,
                total_wins INTEGER DEFAULT 0,
                total_guesses INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS solved_puzzles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                puzzle_id INTEGER NOT NULL,
                solved_date TEXT NOT NULL,
                attempts INTEGER DEFAULT 1,
                solved_at TEXT DEFAULT (datetime('now')),
                UNIQUE(player_id, puzzle_id, solved_date)
            );
        """)
        conn.commit()
    finally:
        conn.close()


# --- Load Puzzles ---
puzzles = []
csv_path = Path(__file__).parent / "puzzles.csv"
try:
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        puzzles = list(reader)
except Exception:
    pass

# Initialize DB on startup
try:
    init_db()
except Exception as e:
    pass


def json_resp(start_response, data, status="200 OK"):
    body = json_mod.dumps(data, ensure_ascii=False).encode()
    headers = [
        ("Content-Type", "application/json"),
        ("Content-Length", str(len(body))),
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type"),
    ]
    start_response(status, headers)
    return [body]


def parse_qs(qs):
    params = {}
    if qs:
        for part in qs.split("&"):
            if "=" in part:
                k, v = part.split("=", 1)
                params[k] = v
    return params


def app(environ, start_response):
    # Passenger mounts at /api, strips prefix: PATH_INFO = /daily, SCRIPT_NAME = /api
    path = environ.get("PATH_INFO", "/").rstrip("/") or "/"
    method = environ.get("REQUEST_METHOD", "GET")
    qs = environ.get("QUERY_STRING", "")
    params = parse_qs(qs)

    # Handle CORS preflight
    if method == "OPTIONS":
        headers = [
            ("Content-Type", "text/plain"),
            ("Content-Length", "0"),
            ("Access-Control-Allow-Origin", "*"),
            ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
            ("Access-Control-Allow-Headers", "Content-Type"),
        ]
        start_response("200 OK", headers)
        return [b""]

    # --- Health check ---
    if path == "/":
        return json_resp(start_response, {
            "message": "Heteronym API is running",
            "puzzles": len(puzzles),
        })

    # --- Daily puzzle ---
    if path == "/daily":
        if not puzzles:
            return json_resp(start_response,
                             {"error": "No puzzles loaded"}, "500 Internal Server Error")

        d = params.get("d")
        if d:
            try:
                target_date = date.fromisoformat(d)
            except ValueError:
                return json_resp(start_response,
                                 {"error": "Invalid date format. Use YYYY-MM-DD"}, "400 Bad Request")
        else:
            target_date = date.today()

        date_str = target_date.isoformat()
        seed = int(hashlib.md5(date_str.encode()).hexdigest(), 16)
        idx = seed % len(puzzles)
        puzzle = puzzles[idx]

        return json_resp(start_response, {
            "clue1": puzzle.get("Clue 1", ""),
            "clue2": puzzle.get("Clue 2", ""),
            "hints": [
                puzzle.get("Hint 1", ""),
                puzzle.get("Hint 2", ""),
                puzzle.get("Hint 3", ""),
            ],
            "id": idx,
            "date": date_str,
        })

    # --- Random puzzle ---
    if path == "/puzzle":
        if not puzzles:
            return json_resp(start_response,
                             {"error": "No puzzles loaded"}, "500 Internal Server Error")
        puzzle = random.choice(puzzles)
        idx = puzzles.index(puzzle)
        return json_resp(start_response, {
            "clue1": puzzle.get("Clue 1", ""),
            "clue2": puzzle.get("Clue 2", ""),
            "hints": [
                puzzle.get("Hint 1", ""),
                puzzle.get("Hint 2", ""),
                puzzle.get("Hint 3", ""),
            ],
            "id": idx,
        })

    # --- Guess ---
    # Frontend sends: POST /guess?puzzle_id=X&guess=Y
    if path == "/guess":
        if not puzzles:
            return json_resp(start_response,
                             {"error": "No puzzles loaded"}, "500 Internal Server Error")

        try:
            puzzle_id = int(params.get("puzzle_id", -1))
            guess = params.get("guess", "")
        except (ValueError, TypeError):
            return json_resp(start_response,
                             {"error": "Invalid parameters"}, "400 Bad Request")

        if puzzle_id < 0 or puzzle_id >= len(puzzles):
            return json_resp(start_response,
                             {"error": "Puzzle not found"}, "404 Not Found")

        correct_answer = puzzles[puzzle_id].get("Answer", "").strip().lower()
        is_correct = guess.strip().lower() == correct_answer
        return json_resp(start_response, {
            "correct": is_correct,
            "answer": correct_answer if not is_correct else None,
        })

    # --- Get streak/player stats ---
    if path == "/streak" and method == "GET":
        player_id = params.get("player_id", "")
        if not player_id:
            return json_resp(start_response, {"error": "player_id required"}, "400 Bad Request")

        conn = get_db()
        try:
            row = conn.execute(
                "SELECT * FROM streaks WHERE player_id = ?", (player_id,)
            ).fetchone()
            if row:
                data = {
                    "player_id": row["player_id"],
                    "current_streak": row["current_streak"],
                    "max_streak": row["max_streak"],
                    "last_solved_date": row["last_solved_date"],
                    "total_solved": row["total_solved"],
                    "total_wins": row["total_wins"],
                    "total_guesses": row["total_guesses"],
                }
            else:
                data = {"player_id": player_id, "current_streak": 0, "max_streak": 0,
                        "last_solved_date": None, "total_solved": 0, "total_wins": 0, "total_guesses": 0}
            return json_resp(start_response, data)
        finally:
            conn.close()

    # --- Update streak ---
    if path == "/streak" and method == "POST":
        player_id = params.get("player_id", "")
        won = params.get("won", "").lower() == "true"
        guesses_used = int(params.get("guesses", 0))
        puzzle_id = int(params.get("puzzle_id", -1))
        today_str = date.today().isoformat()

        if not player_id:
            return json_resp(start_response, {"error": "player_id required"}, "400 Bad Request")

        conn = get_db()
        try:
            row = conn.execute(
                "SELECT * FROM streaks WHERE player_id = ?", (player_id,)
            ).fetchone()

            if row:
                current = dict(row)
            else:
                current = {"current_streak": 0, "max_streak": 0,
                           "last_solved_date": None, "total_solved": 0,
                           "total_wins": 0, "total_guesses": 0}

            # Update stats
            current["total_solved"] += 1
            current["total_guesses"] += guesses_used

            if won:
                current["total_wins"] += 1
                prev_date = current["last_solved_date"]
                current["last_solved_date"] = today_str
                yesterday_str = (date.today() - timedelta(days=1)).isoformat()
                if prev_date == yesterday_str:
                    current["current_streak"] += 1
                else:
                    current["current_streak"] = 1
                current["max_streak"] = max(current["max_streak"], current["current_streak"])

            conn.execute("""
                INSERT OR REPLACE INTO streaks
                (player_id, current_streak, max_streak, last_solved_date,
                 total_solved, total_wins, total_guesses, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """, (
                player_id, current["current_streak"], current["max_streak"],
                current["last_solved_date"], current["total_solved"],
                current["total_wins"], current["total_guesses"],
            ))

            # Record this solve
            if puzzle_id >= 0:
                conn.execute("""
                    INSERT OR IGNORE INTO solved_puzzles
                    (player_id, puzzle_id, solved_date, attempts)
                    VALUES (?, ?, ?, ?)
                """, (player_id, puzzle_id, today_str, guesses_used))

            conn.commit()
            return json_resp(start_response, current)
        finally:
            conn.close()

    # --- New player ID ---
    if path == "/new-player":
        new_id = str(uuid.uuid4())
        return json_resp(start_response, {"player_id": new_id})

    return json_resp(start_response, {"error": "Not found"}, "404 Not Found")


# Passenger entry point
application = app