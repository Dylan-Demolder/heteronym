# Heteronym

A word puzzle game: two clues, one hidden synonym.

## Structure

```
heteronym/
├── backend/          # FastAPI server (Python)
│   ├── main.py       # API endpoints + static file serving
│   ├── puzzles.csv   # 50 puzzle definitions
│   └── requirements.txt
├── frontend/         # React SPA (Vite + Tailwind)
│   ├── src/          # React components
│   └── package.json
├── render.yaml       # Render Blueprint — single deploy
└── README.md
```

## Local dev

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

The frontend dev server proxies API calls to the backend at `localhost:8000`.

## Deploy

Single service on Render. Push to `main` and Render auto-deploys:

1. Builds the React app (`frontend/dist/`)
2. Starts the FastAPI server which serves both API and static files
