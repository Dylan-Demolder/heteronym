"""
WSGI entry point for Heteronym game.
Pure Python stdlib - no third-party dependencies needed.
"""
import sys
import os
import json as json_mod
import csv
import random
import sqlite3
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

# --- Sequential daily puzzle epoch ---
SEQ_EPOCH = date(2026, 6, 1)

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

    # --- Daily puzzle (sequential from June 1, 2026) ---
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

        delta = (target_date - SEQ_EPOCH).days
        idx = delta % len(puzzles)
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
            "date": target_date.isoformat(),
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

    # --- Puzzle by ID ---
    if path.startswith("/puzzle/"):
        try:
            puzzle_id = int(path.split("/puzzle/")[1].split("/")[0])
        except (ValueError, IndexError):
            return json_resp(start_response,
                             {"error": "Invalid puzzle ID"}, "400 Bad Request")
        if puzzle_id < 0 or puzzle_id >= len(puzzles):
            return json_resp(start_response,
                             {"error": "Puzzle not found"}, "404 Not Found")
        puzzle = puzzles[puzzle_id]
        return json_resp(start_response, {
            "clue1": puzzle.get("Clue 1", ""),
            "clue2": puzzle.get("Clue 2", ""),
            "hints": [
                puzzle.get("Hint 1", ""),
                puzzle.get("Hint 2", ""),
                puzzle.get("Hint 3", ""),
            ],
            "id": puzzle_id,
        })

    # --- Archive (list puzzle IDs from epoch to today) ---
    if path == "/archive":
        today = date.today()
        archive = []
        d = SEQ_EPOCH
        while d <= today:
            idx = (d - SEQ_EPOCH).days % len(puzzles) if puzzles else 0
            p = puzzles[idx] if puzzles else {}
            archive.append({
                "id": idx,
                "date": d.isoformat(),
                "clue1": p.get("Clue 1", ""),
                "clue2": p.get("Clue 2", ""),
            })
            d += timedelta(days=1)
        return json_resp(start_response, archive)

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
        })

    # --- Reveal answer (out of lives / give up) ---
    if path == "/reveal":
        try:
            puzzle_id = int(params.get("puzzle_id", -1))
        except (ValueError, TypeError):
            return json_resp(start_response,
                             {"error": "Invalid parameters"}, "400 Bad Request")

        if puzzle_id < 0 or puzzle_id >= len(puzzles):
            return json_resp(start_response,
                             {"error": "Puzzle not found"}, "404 Not Found")

        answer = puzzles[puzzle_id].get("Answer", "")
        return json_resp(start_response, {
            "answer": answer,
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

    # --- Reset all streaks (admin) ---
    if path == "/reset" and method == "POST":
        conn = get_db()
        try:
            conn.execute("DELETE FROM solved_puzzles")
            conn.execute("DELETE FROM streaks")
            conn.commit()
            return json_resp(start_response, {
                "status": "ok",
                "message": "All streaks and solved puzzles have been reset to 0.",
            })
        finally:
            conn.close()

    # --- Challenge OG page (for social media preview cards) ---
    if path.startswith("/challenge/"):
        try:
            challenge_id = int(path.split("/challenge/")[1].split("/")[0])
        except (ValueError, IndexError):
            return json_resp(start_response,
                             {"error": "Invalid challenge ID"}, "400 Bad Request")
        if not puzzles or challenge_id < 0 or challenge_id >= len(puzzles):
            return json_resp(start_response,
                             {"error": "Puzzle not found"}, "404 Not Found")

        puzzle = puzzles[challenge_id]
        clues = f"Clue 1: {puzzle.get('Clue 1', '')} / Clue 2: {puzzle.get('Clue 2', '')}"
        title = f"Heteronym — Puzzle #{challenge_id + 1} Challenge"
        description = f"Two clues, one hidden word. {clues}. Can you solve it?"

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<meta name="description" content="{description}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="https://heteronym.online/og-image.png">
<meta property="og:type" content="website">
<meta property="og:url" content="https://heteronym.online/challenge/{challenge_id}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=/?challenge={challenge_id}">
<link rel="canonical" href="https://heteronym.online/?challenge={challenge_id}">
</head>
<body>
<h1>{title}</h1>
<p>{description}</p>
<p>Redirecting to puzzle…</p>
<script>location.href="/?challenge={challenge_id}";</script>
</body>
</html>"""
        headers = [
            ("Content-Type", "text/html; charset=utf-8"),
            ("Content-Length", str(len(html.encode()))),
            ("Access-Control-Allow-Origin", "*"),
        ]
        start_response("200 OK", headers)
        return [html.encode()]

    # --- Puzzle info page (SEO: individual page per heteronym with answer) ---
    if path.startswith("/puzzle-page/"):
        try:
            puzzle_id = int(path.split("/puzzle-page/")[1].split("/")[0])
        except (ValueError, IndexError):
            return json_resp(start_response,
                             {"error": "Invalid puzzle ID"}, "400 Bad Request")
        if not puzzles or puzzle_id < 0 or puzzle_id >= len(puzzles):
            return json_resp(start_response,
                             {"error": "Puzzle not found"}, "404 Not Found")

        p = puzzles[puzzle_id]
        answer = p.get("Answer", "")
        clue1 = p.get("Clue 1", "")
        clue2 = p.get("Clue 2", "")
        hint1 = p.get("Hint 1", "")
        hint2 = p.get("Hint 2", "")
        hint3 = p.get("Hint 3", "")
        difficulty = p.get("Difficulty", "Medium")
        title = f'Heteronym Example: "{answer}" — Same Spelling, Two Meanings'
        desc = f'Learn the heteronym "{answer}": meaning 1 is "{clue1.lower()}", meaning 2 is "{clue2.lower()}". Pronunciation guide, examples, and a daily puzzle to test your skills.'

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content='{answer} — Heteronym Example'>
<meta property="og:description" content="Clue 1: {clue1} · Clue 2: {clue2}. Can you find the hidden heteronym? Play the daily puzzle at heteronym.online">
<meta property="og:image" content="https://heteronym.online/og-image.png">
<meta property="og:type" content="website">
<meta property="og:url" content="https://heteronym.online/puzzle/{puzzle_id}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://heteronym.online/puzzle/{puzzle_id}">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Heteronym Example: {answer}",
  "description": "The word '{answer}' is a heteronym. It can mean '{clue1.lower()}' or '{clue2.lower()}'. These are two different meanings of the same spelling.",
  "author": {{ "@type": "Person", "name": "Dylan Demolder" }},
  "publisher": {{ "@type": "Organization", "name": "Heteronym", "url": "https://heteronym.online" }},
  "url": "https://heteronym.online/puzzle/{puzzle_id}"
}}
</script>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #f5f5f7; color: #1a1a2e; line-height: 1.6; }}
.page {{ max-width: 640px; margin: 0 auto; padding: 32px 16px; }}
.card {{ background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border: 1px solid rgba(124,92,252,0.12); border-radius: 16px; padding: 32px; margin-bottom: 16px; }}
h1 {{ font-size: 26px; font-weight: 700; margin-bottom: 8px; }}
.meta {{ color: #888; font-size: 13px; margin-bottom: 20px; }}
.clue {{ background: rgba(124,92,252,0.06); border-radius: 10px; padding: 16px; margin-bottom: 12px; }}
.clue-label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #7C5CFC; font-weight: 600; margin-bottom: 4px; }}
.clue-text {{ font-size: 16px; color: #1a1a2e; font-weight: 600; }}
.answer-box {{ background: #7C5CFC; color: white; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0; }}
.answer-box .label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; }}
.answer-box .word {{ font-size: 24px; font-weight: 700; margin-top: 4px; }}
.cta {{ display: block; text-align: center; margin: 24px 0; }}
.cta a {{ display: inline-block; background: #7C5CFC; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 600; }}
.cta a:hover {{ background: #6a4de0; }}
.hints {{ margin-top: 16px; }}
.hint {{ font-size: 14px; color: #666; padding: 8px 0; border-bottom: 1px solid #eee; }}
.footer {{ text-align: center; padding: 24px 0; color: #888; font-size: 13px; }}
.footer a {{ color: #7C5CFC; text-decoration: none; }}
@media (prefers-color-scheme: dark) {{
  body {{ background: #0f0f1a; color: #e8e8f0; }}
  .card {{ background: rgba(20,20,35,0.9); border-color: rgba(124,92,252,0.2); }}
  .clue {{ background: rgba(124,92,252,0.1); }}
  .clue-text {{ color: #e8e8f0; }}
  .hint {{ color: #b0b0c0; border-color: #2a2a3e; }}
  .meta {{ color: #666; }}
}}
</style>
</head>
<body>
<div class="page">
  <div class="card">
    <h1>Heteronym: "{answer}"</h1>
    <p class="meta">{difficulty} difficulty · <a href="/" style="color:#7C5CFC">Play the daily puzzle</a></p>

    <p style="margin-bottom:16px;color:#666;font-size:14px">The word "{answer}" is a heteronym — it's spelled the same but has different meanings (and often different pronunciations).</p>

    <div class="clue">
      <div class="clue-label">Meaning 1</div>
      <div class="clue-text">{clue1}</div>
    </div>
    <div class="clue">
      <div class="clue-label">Meaning 2</div>
      <div class="clue-text">{clue2}</div>
    </div>

    <div class="answer-box">
      <div class="label">The heteronym</div>
      <div class="word">{answer}</div>
    </div>

    <p style="font-size:14px;color:#666">Can you find the connection between these two meanings? That's the challenge in every Heteronym puzzle — try today's puzzle to test your lateral thinking.</p>

    <div class="cta">
      <a href="/">Play Today's Heteronym Puzzle →</a>
    </div>

    <div class="hints">
      <p style="font-size:13px;font-weight:600;margin-bottom:8px;color:#1a1a2e">Hints for this heteronym:</p>
      <div class="hint">💡 {hint1}</div>
      <div class="hint">💡 {hint2}</div>
      <div class="hint">💡 {hint3}</div>
    </div>
  </div>

  <div class="footer">
    <p><a href="/">Heteronym</a> — Two clues, one hidden word. A new puzzle every day.</p>
    <p style="margin-top:8px"><a href="/blog">Blog</a></p>
  </div>
</div>
</body>
</html>"""

        headers = [
            ("Content-Type", "text/html; charset=utf-8"),
            ("Content-Length", str(len(html.encode()))),
            ("Access-Control-Allow-Origin", "*"),
        ]
        start_response("200 OK", headers)
        return [html.encode()]

    # --- Puzzle sitemap (dynamic XML for all 357 puzzle pages) ---
    if path == "/sitemap-puzzles.xml":
        lines = ['<?xml version="1.0" encoding="UTF-8"?>']
        lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
        for i in range(len(puzzles)):
            lines.append(f"  <url><loc>https://heteronym.online/puzzle/{i}</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>")
        lines.append("</urlset>")
        xml = "\n".join(lines)
        headers = [
            ("Content-Type", "application/xml; charset=utf-8"),
            ("Content-Length", str(len(xml.encode()))),
            ("Access-Control-Allow-Origin", "*"),
        ]
        start_response("200 OK", headers)
        return [xml.encode()]

    return json_resp(start_response, {"error": "Not found"}, "404 Not Found")


# Passenger entry point
application = app