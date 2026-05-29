import { useEffect, useState, useRef, useCallback } from 'react'

const API = ''
const STATS_KEY = 'heteronym_stats'
const SCORE_KEY = 'heteronym_score'

function today() { return new Date().toISOString().split('T')[0] }
function yesterday() {
  const d = new Date(); d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function loadStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || defaultStats() }
  catch { return defaultStats() }
}
function defaultStats() {
  return { gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0, totalGuesses: 0, lastPlayedDate: null }
}
function saveStats(s) { localStorage.setItem(STATS_KEY, JSON.stringify(s)) }

function loadDaily(d) {
  try { return JSON.parse(localStorage.getItem(`heteronym_daily_${d}`)) }
  catch { return null }
}
function saveDaily(d, s) { localStorage.setItem(`heteronym_daily_${d}`, JSON.stringify(s)) }

export default function App() {
  const [mode, setMode] = useState('daily')
  const [puzzle, setPuzzle] = useState(null)
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState(null)
  const [guesses, setGuesses] = useState([])
  const [hintIndex, setHintIndex] = useState(0)
  const [lives, setLives] = useState(4)
  const [score, setScore] = useState(() => Number(localStorage.getItem(SCORE_KEY)) || 0)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [showInfo, setShowInfo] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [copied, setCopied] = useState(false)
  const [nextTimer, setNextTimer] = useState('')
  const [stats, setStatsRaw] = useState(loadStats)
  const [dailyPuzzleNum, setDailyPuzzleNum] = useState(0)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef()

  const setStats = useCallback(s => { setStatsRaw(s); saveStats(s) }, [])

  // Countdown to midnight
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const next = new Date(now); next.setDate(next.getDate() + 1); next.setHours(0, 0, 0, 0)
      const d = next - now
      setNextTimer(`${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m ${Math.floor((d % 60000) / 1000)}s`)
    }
    tick(); const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Load puzzle
  useEffect(() => {
    setLoading(true)
    setShowCompletion(false)
    setCopied(false)

    if (mode === 'daily') {
      const saved = loadDaily(today())
      if (saved?.completed) {
        setPuzzle(saved.puzzle)
        setGuesses(saved.guesses)
        setHintIndex(saved.hintIndex)
        setLives(saved.lives)
        setResult(saved.result)
        setShowCompletion(true)
        setLoading(false)
        return
      }

      fetch(`${API}/daily`).then(r => r.json()).then(data => {
        setPuzzle(data)
        setDailyPuzzleNum(data.id)
        if (saved) {
          setGuesses(saved.guesses || [])
          setHintIndex(saved.hintIndex || 0)
          setLives(saved.lives !== undefined ? saved.lives : 4)
          setResult(saved.result || null)
        } else {
          setGuesses([])
          setHintIndex(0)
          setLives(4)
          setResult(null)
        }
        setLoading(false)
      })
    } else {
      setGuesses([])
      setHintIndex(0)
      setLives(4)
      setResult(null)
      setPuzzle(null)
      fetch(`${API}/puzzle`).then(r => r.json()).then(data => {
        setPuzzle(data)
        setLoading(false)
      })
    }
  }, [mode])

  const loadPuzzle = async () => {
    setResult(null)
    setGuess('')
    setGuesses([])
    setHintIndex(0)
    setLives(4)
    const res = await fetch(`${API}/puzzle`)
    const data = await res.json()
    setPuzzle(data)
    if (inputRef.current) inputRef.current.classList.remove('animate-shake')
  }

  const submitGuess = async () => {
    if (!guess.trim() || !puzzle) return
    const res = await fetch(`${API}/guess?puzzle_id=${puzzle.id}&guess=${guess}`, { method: 'POST' })
    const data = await res.json()
    setResult(data)
    const newGuesses = [...guesses, guess]
    setGuesses(newGuesses)

    if (data.correct) {
      const points = 3 - hintIndex
      const newScore = score + points
      setScore(newScore)
      localStorage.setItem(SCORE_KEY, newScore)
    } else {
      if (inputRef.current) {
        inputRef.current.classList.remove('animate-shake')
        void inputRef.current.offsetWidth
        inputRef.current.classList.add('animate-shake')
      }
      if (hintIndex < puzzle.hints.length && lives > 1) {
        setHintIndex(i => i + 1)
      }
      setLives(l => l - 1)
    }
  }

  const handleRevealHint = () => {
    if (hintIndex < puzzle.hints.length && lives > 0 && !result?.correct) {
      setHintIndex(i => i + 1)
      setLives(l => l - 1)
    }
  }

  const handleSkip = () => {
    if (mode === 'freeplay' && (result?.correct || lives === 0)) {
      loadPuzzle()
    }
  }

  // Persist daily state & update stats on completion
  useEffect(() => {
    if (!puzzle || mode !== 'daily' || !result) return
    if (!result.correct && lives > 0) return // still playing

    const state = { puzzle, guesses, hintIndex, lives, result, completed: true }
    saveDaily(today(), state)

    if (stats.lastPlayedDate === today()) return // already counted

    const s = { ...stats }
    s.gamesPlayed += 1
    s.lastPlayedDate = today()

    if (result.correct) {
      s.wins += 1
      s.totalGuesses += guesses.length
      s.currentStreak = stats.lastPlayedDate === yesterday() ? s.currentStreak + 1 : 1
      s.maxStreak = Math.max(s.maxStreak, s.currentStreak)
    } else {
      s.currentStreak = 0
    }
    setStats(s)
  }, [result, lives])

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const nt = theme === 'light' ? 'dark' : 'light'
    setTheme(nt)
    localStorage.setItem('theme', nt)
  }

  const shareResult = () => {
    const lines = [`Heteronym #${dailyPuzzleNum + 1}`]
    if (result?.correct) {
      lines.push(`✅ Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 's'} · ${hintIndex} hint${hintIndex === 1 ? '' : 's'}`)
    } else {
      lines.push(`❌ Out of lives — answer: ${result?.answer}`)
    }
    // Emoji grid: 🔴 for wrong, 🟢 for correct, 🔍 for hints used
    const grid = guesses.map((g, i) => {
      if (i === guesses.length - 1 && result?.correct) return '🟩'
      return '🔴'
    })
    if (hintIndex > 0) {
      lines.push('🔍'.repeat(hintIndex))
    }
    lines.push(grid.join(''))
    lines.push('')
    lines.push('heteronym.onrender.com')

    const text = lines.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitGuess()
  }

  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col items-center px-4 py-6 transition-colors`}>

      {/* Header bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button onClick={() => setShowInfo(true)} className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 text-sm font-bold" aria-label="Info">i</button>
        <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button onClick={() => setMode('daily')} className={`px-3 py-1 rounded-md text-sm font-medium transition ${mode === 'daily' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Daily</button>
          <button onClick={() => setMode('freeplay')} className={`px-3 py-1 rounded-md text-sm font-medium transition ${mode === 'freeplay' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Free Play</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowStats(true)} className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition text-lg" aria-label="Stats">📊</button>
          <button onClick={toggleTheme} className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-1">Heteronym</h1>
      {mode === 'daily' && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Puzzle #{dailyPuzzleNum + 1}</p>}
      <p className="text-sm md:text-base mb-1 text-center max-w-md text-gray-600 dark:text-gray-400">Two clues point to one hidden synonym</p>

      {/* Lives - heart emojis replaced with text for cleaner look */}
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${i < lives ? 'bg-red-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'}`}>{i < lives ? '♥' : '♡'}</span>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 mt-10">Loading...</div>
      ) : puzzle && (
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl p-6 w-full max-w-md text-center relative transition-colors`}>

          {/* Clues */}
          <p className="text-lg mb-1">🧩 Clue 1: <strong>{puzzle.clue1}</strong></p>
          <p className="text-lg mb-4">🧩 Clue 2: <strong>{puzzle.clue2}</strong></p>

          {/* Input & buttons */}
          {!(result?.correct || (lives === 0 && result)) && (
            <>
              <input
                ref={inputRef}
                type="text"
                className={`w-full p-2 border rounded mb-3 text-center text-lg font-medium transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                placeholder="Your guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="flex gap-2 mb-4">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40" onClick={submitGuess} disabled={lives === 0 || result?.correct || !guess.trim()}>
                  Submit
                </button>
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40" onClick={handleRevealHint} disabled={hintIndex >= (puzzle.hints?.length || 3) || lives === 0 || result?.correct}>
                  🔍 Hint
                </button>
                {mode === 'freeplay' && (
                  <button className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40" onClick={loadPuzzle}>
                    ⏭ Skip
                  </button>
                )}
              </div>
            </>
          )}

          {/* Result message */}
          {result && (
            <p className={`text-base font-semibold mb-3 ${lives === 0 && !result.correct ? 'text-red-500' : result.correct ? 'text-green-500' : 'text-orange-500'}`}>
              {result.correct ? '✅ Correct!' : lives > 0 ? '❌ Nope, try again!' : `❌ Out of lives — ${result.answer}`}
            </p>
          )}

          {/* Hints */}
          {hintIndex > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hints revealed:</p>
              <ul className="space-y-0.5">
                {puzzle.hints.slice(0, hintIndex).map((h, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-300">🔍 {h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous guesses */}
          {guesses.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your guesses:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {guesses.map((g, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded text-xs font-medium ${i === guesses.length - 1 && result?.correct ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Post-completion actions (daily mode) */}
          {mode === 'daily' && (result?.correct || (lives === 0 && result)) && (
            <div className="mt-4 space-y-2">
              <button onClick={shareResult} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition w-full">
                {copied ? '✓ Copied!' : '📋 Share Result'}
              </button>
              <p className="text-xs text-gray-400">Next puzzle in {nextTimer}</p>
            </div>
          )}

          {/* Free play next */}
          {mode === 'freeplay' && (result?.correct || (lives === 0 && result)) && (
            <button className="mt-4 text-blue-600 underline text-sm" onClick={loadPuzzle}>
              Next Puzzle →
            </button>
          )}
        </div>
      )}

      {mode === 'freeplay' && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Score: {score}</p>
      )}

      {/* Stats modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowStats(false)}>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl max-w-sm w-full relative`} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowStats(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            <h2 className="text-xl font-bold mb-4 text-center">Statistics</h2>
            <div className="grid grid-cols-4 gap-3 text-center mb-4">
              <div>
                <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
                <p className="text-xs text-gray-500">Played</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.gamesPlayed > 0 ? Math.round(stats.wins / stats.gamesPlayed * 100) : 0}%</p>
                <p className="text-xs text-gray-500">Win %</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-gray-500">Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.maxStreak}</p>
                <p className="text-xs text-gray-500">Max</p>
              </div>
            </div>
            {stats.wins > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Avg guesses: {(stats.totalGuesses / stats.wins).toFixed(1)}</p>
            )}
          </div>
        </div>
      )}

      {/* Info modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl max-w-md w-full relative`} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowInfo(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            <h2 className="text-xl font-bold mb-3">How to Play</h2>
            <p className="text-sm mb-2">You're given two clues. Both are synonyms of the same hidden word — a <strong>heteronym</strong> (spelled the same, different meanings).</p>
            <p className="text-sm mb-2">Guess the word they both point to. Each wrong guess costs a life, and each hint you reveal also costs a life.</p>
            <ul className="text-sm space-y-1 mb-2 text-gray-600 dark:text-gray-300">
              <li><strong>Daily</strong> — one puzzle per day, same for everyone. Streaks and stats tracked.</li>
              <li><strong>Free Play</strong> — random puzzles, practice mode with score.</li>
            </ul>
            <p className="text-sm text-gray-500">Good luck! 🎯</p>
          </div>
        </div>
      )}

      <style>{`
        .animate-shake { animation: shake 0.4s }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
      `}</style>
    </main>
  )
}
