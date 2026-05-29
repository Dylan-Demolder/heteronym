import { useEffect, useState, useRef, useCallback } from 'react'
import { HeartsDisplay, GlassPanel, ChromaButton, StatCard, Icon } from './chroma'

const API = '/api'
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
  const puzzleCardRef = useRef()

  const setStats = useCallback(s => { setStatsRaw(s); saveStats(s) }, [])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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
    if (puzzleCardRef.current) puzzleCardRef.current.classList.remove('chroma-shake')
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
      if (puzzleCardRef.current) {
        puzzleCardRef.current.classList.remove('chroma-shake')
        void puzzleCardRef.current.offsetWidth
        puzzleCardRef.current.classList.add('chroma-shake')
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

  const toggleTheme = () => {
    const nt = theme === 'light' ? 'dark' : 'light'
    setTheme(nt)
    localStorage.setItem('theme', nt)
  }

  const shareResult = async () => {
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
    lines.push('heteronym.online')

    const text = lines.join('\n')

    // Native share API with clipboard fallback
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch {
        // User cancelled or failed — fall through to clipboard
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Last resort fallback — legacy execCommand
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitGuess()
  }

  return (
    <main className="min-h-screen bg-chroma-mesh flex flex-col items-center px-4 py-6 transition-colors duration-300">

      {/* Header bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-5">
        <ChromaButton variant="ghost" size="sm" icon="info" onClick={() => setShowInfo(true)}>
          Info
        </ChromaButton>

        <div className="chroma-tabs-bar">
          <button
            onClick={() => setMode('daily')}
            className={`chroma-tab ${mode === 'daily' ? 'chroma-tab-active' : ''}`}
          >
            Daily
          </button>
          <button
            onClick={() => setMode('freeplay')}
            className={`chroma-tab ${mode === 'freeplay' ? 'chroma-tab-active' : ''}`}
          >
            Free Play
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ChromaButton variant="ghost" size="sm" icon="bar_chart" onClick={() => setShowStats(true)} />
          <button
            onClick={toggleTheme}
            className="chroma-btn chroma-btn-ghost chroma-btn-sm"
            aria-label="Toggle theme"
          >
            <Icon name={theme === 'light' ? 'dark_mode' : 'light_mode'} size={18} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl font-bold mb-1 text-balance">Heteronym</h1>
      {mode === 'daily' && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Puzzle #{dailyPuzzleNum + 1}</p>
      )}
      <p
        className="text-sm md:text-base mb-1 text-center max-w-md"
        style={{ color: 'var(--text-secondary)' }}
      >
        Two clues point to one hidden synonym
      </p>

      {/* Lives */}
      <div className="mb-4 mt-1">
        <HeartsDisplay total={4} active={lives} animate={false} />
      </div>

      {loading ? (
        <div className="chroma-skeleton" style={{ width: 400, height: 300, maxWidth: '100%', borderRadius: 'var(--r-lg)' }} />
      ) : puzzle && (
        <GlassPanel
          ref={puzzleCardRef}
          padding={24}
          className="w-full max-w-md text-center relative"
        >
          {/* Clues */}
          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>
              psychology
            </span>
            Clue 1: <strong style={{ color: 'var(--text-primary)' }}>{puzzle.clue1}</strong>
          </p>
          <p className="text-base mb-5" style={{ color: 'var(--text-secondary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>
              psychology
            </span>
            Clue 2: <strong style={{ color: 'var(--text-primary)' }}>{puzzle.clue2}</strong>
          </p>

          {/* Input & buttons */}
          {!(result?.correct || (lives === 0 && result)) && (
            <>
              <input
                ref={inputRef}
                type="text"
                className="chroma-input mb-3"
                placeholder="Your guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="flex gap-2 mb-4">
                <ChromaButton
                  variant="primary"
                  icon="arrow_forward"
                  fullWidth
                  onClick={submitGuess}
                  disabled={lives === 0 || result?.correct || !guess.trim()}
                >
                  Submit
                </ChromaButton>
                <ChromaButton
                  variant="ghost"
                  icon="lightbulb"
                  onClick={handleRevealHint}
                  disabled={hintIndex >= (puzzle.hints?.length || 3) || lives === 0 || result?.correct}
                >
                  Hint
                </ChromaButton>
                {mode === 'freeplay' && (
                  <ChromaButton variant="ghost" icon="skip_next" onClick={loadPuzzle}>
                    Skip
                  </ChromaButton>
                )}
              </div>
            </>
          )}

          {/* Result message */}
          {result && (
            <p
              className="text-base font-semibold mb-3"
              style={{
                color: lives === 0 && !result.correct ? 'var(--red)' : result.correct ? 'var(--green)' : 'var(--amber)'
              }}
            >
              {result.correct ? (
                <><Icon name="check_circle" size={18} color="var(--green)" filled /> Correct!</>
              ) : lives > 0 ? (
                <><Icon name="close" size={18} color="var(--red)" /> Nope, try again!</>
              ) : (
                <><Icon name="heart_broken" size={18} color="var(--red)" /> Out of lives — <strong>{result.answer}</strong></>
              )}
            </p>
          )}

          {/* Hints */}
          {hintIndex > 0 && (
            <div className="mb-3">
              <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Hints revealed:</p>
              <ul className="space-y-0.5">
                {puzzle.hints.slice(0, hintIndex).map((h, i) => (
                  <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Icon name="lightbulb" size={14} color="var(--amber)" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous guesses */}
          {guesses.length > 0 && (
            <div className="mb-3">
              <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Your guesses:</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {guesses.map((g, i) => (
                  <span
                    key={i}
                    className={`chroma-badge ${i === guesses.length - 1 && result?.correct ? 'chroma-badge-correct' : 'chroma-badge-wrong'}`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Post-completion actions (daily mode) */}
          {mode === 'daily' && (result?.correct || (lives === 0 && result)) && (
            <div className="mt-4 space-y-3">
              <button onClick={shareResult} className="chroma-share-btn">
                <Icon name={copied ? 'check' : 'share'} size={18} filled={copied} />
                {copied ? 'Copied!' : 'Share Result'}
              </button>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <Icon name="schedule" size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Next puzzle in {nextTimer}
              </p>
            </div>
          )}

          {/* Free play next */}
          {mode === 'freeplay' && (result?.correct || (lives === 0 && result)) && (
            <ChromaButton variant="ghost" icon="arrow_forward" onClick={loadPuzzle} className="mt-4">
              Next Puzzle
            </ChromaButton>
          )}
        </GlassPanel>
      )}

      {/* Score (free play) */}
      {mode === 'freeplay' && (
        <p className="mt-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Score: <strong style={{ color: 'var(--violet)' }}>{score}</strong>
        </p>
      )}

      {/* Carbon Ads */}
      <div id="carbonads" className="mt-6 w-full max-w-md flex justify-center min-h-[100px]" />
      <script
        async
        type="text/javascript"
        src="//cdn.carbonads.com/carbon.js?serve=CESI52J7&placement=heteronymonline"
        id="_carbonads_js"
      ></script>

      {/* Support link */}
      <a
        href="https://ko-fi.com/your-kofi"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          color: 'var(--amber)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)' }}
      >
        <Icon name="coffee" size={16} /> Support the game
      </a>

      {/* Stats modal */}
      {showStats && (
        <div className="chroma-overlay" onClick={() => setShowStats(false)}>
          <div className="chroma-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowStats(false)} className="chroma-modal-close">✕</button>
            <div style={{ padding: '24px' }}>
              <h2 className="font-display text-xl font-bold mb-5 text-center">Statistics</h2>
              <div className="grid grid-cols-4 gap-3 text-center mb-4">
                <StatCard value={stats.gamesPlayed} label="Played" compact />
                <StatCard value={stats.gamesPlayed > 0 ? Math.round(stats.wins / stats.gamesPlayed * 100) : 0} label="Win %" compact />
                <StatCard value={stats.currentStreak} label="Streak" compact accent />
                <StatCard value={stats.maxStreak} label="Max" compact />
              </div>
              {stats.wins > 0 && (
                <p className="text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                  Avg guesses: <strong style={{ color: 'var(--text-primary)' }}>{(stats.totalGuesses / stats.wins).toFixed(1)}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info modal */}
      {showInfo && (
        <div className="chroma-overlay" onClick={() => setShowInfo(false)}>
          <div className="chroma-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowInfo(false)} className="chroma-modal-close">✕</button>
            <div style={{ padding: '24px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="info" size={22} color="var(--violet)" filled />
                <h2 className="font-display text-xl font-bold">How to Play</h2>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                You're given two clues. Both are synonyms of the same hidden word — a <strong style={{ color: 'var(--text-primary)' }}>heteronym</strong> (spelled the same, different meanings).
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Guess the word they both point to. Each wrong guess costs a life, and each hint you reveal also costs a life.
              </p>
              <div
                className="rounded-lg p-3 mb-3 space-y-1"
                style={{ background: 'var(--bg-hover)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span
                    className="chroma-badge chroma-tab-active"
                    style={{ display: 'inline-flex', marginRight: 6, padding: '1px 8px' }}
                  >
                    Daily
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>One puzzle per day, same for everyone. Streaks and stats tracked.</span>
                </p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span
                    className="chroma-badge chroma-tab-active"
                    style={{ display: 'inline-flex', marginRight: 6, padding: '1px 8px' }}
                  >
                    Free Play
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>Random puzzles, practice mode with score.</span>
                </p>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <Icon name="rocket_launch" size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Good luck!
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
