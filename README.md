# Heteronym

A word puzzle game: two clues, one hidden synonym.

## Structure

```
heteronym/
├── backend/          # FastAPI server (Python)
│   ├── main.py       # API endpoints + static file serving
│   ├── puzzles.csv   # 50 puzzle definitions
│   └── requirements.txt
|── frontend/         # React SPA (Vite + Tailwind + CHROMA design)
│   ├── src/          # React components + CHROMA component library
│   │   ├── App.jsx   # Main game UI — fully CHROMA-integrated
│   │   ├── chroma/   # 10 reusable CHROMA components
│   │   │   ├── Badge.jsx, ChromaButton.jsx, GlassPanel.jsx
│   │   │   ├── HeartsDisplay.jsx, Icon.jsx, Input.jsx
│   │   │   ├── Modal.jsx, Skeleton.jsx, StatCard.jsx, Tabs.jsx
│   │   │   └── index.js          # Barrel export
│   │   └── index.css             # CHROMA tokens, glass effects, animations
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
