from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import csv
import random

app = FastAPI()

# Allow CORS (still useful for local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load puzzles into memory
puzzles = []
csv_path = Path(__file__).parent / "puzzles.csv"
with open(csv_path, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    puzzles = list(reader)

# Serve built React frontend as static files
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/")
    def serve_frontend():
        return FileResponse(str(frontend_dist / "index.html"))

    # Catch-all for SPA client-side routing
    @app.exception_handler(404)
    async def not_found_handler(request, exc):
        if request.url.path.startswith("/puzzle") or request.url.path.startswith("/guess"):
            raise exc
        index = frontend_dist / "index.html"
        if index.exists():
            return FileResponse(str(index))
        raise exc
else:
    # Fallback dev mode — embed a simple HTML page
    @app.get("/")
    def root():
        return {
            "message": "Heteronym API is running",
            "frontend": "Run `cd frontend && npm run dev` to start the dev server",
        }


@app.get("/puzzle")
def get_puzzle():
    puzzle = random.choice(puzzles)
    return {
        "clue1": puzzle["Clue 1"],
        "clue2": puzzle["Clue 2"],
        "hints": [puzzle["Hint 1"], puzzle["Hint 2"], puzzle["Hint 3"]],
        "id": puzzles.index(puzzle),
    }


@app.post("/guess")
def check_guess(puzzle_id: int, guess: str):
    if puzzle_id < 0 or puzzle_id >= len(puzzles):
        raise HTTPException(status_code=404, detail="Puzzle not found")

    correct_answer = puzzles[puzzle_id]["Answer"].strip().lower()
    is_correct = guess.strip().lower() == correct_answer
    return {"correct": is_correct, "answer": correct_answer if not is_correct else None}
