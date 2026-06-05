import { useEffect, useState, useRef, useCallback } from 'react'
import { HeartsDisplay, GlassPanel, ChromaButton, StatCard, Icon, Badge, Input, Modal, Tabs, Skeleton } from './chroma'

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
  return { gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0, totalGuesses: 0, gaveUp: 0, lastPlayedDate: null }
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
  const [gaveUp, setGaveUp] = useState(false)
  const [revealedAnswer, setRevealedAnswer] = useState(null)
  const inputRef = useRef()
  const puzzleCardRef = useRef()
  const adsRef = useRef()

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

  // Load Adsterra ad script
  useEffect(() => {
    const existing = document.querySelector('script[src*="effectivecpmnetwork"]')
    if (existing) return
    const s = document.createElement('script')
    s.async = true
    s.setAttribute('data-cfasync', 'false')
    s.src = 'https://pl29639886.effectivecpmnetwork.com/549cbeb6999c4e80413bcd2218d2532b/invoke.js'
    document.body.appendChild(s)
    return () => { s.remove() }
  }, [])

  // Load puzzle
  useEffect(() => {
    setLoading(true)
    setShowCompletion(false)
    setCopied(false)
    setGaveUp(false)
    setRevealedAnswer(null)

    if (mode === 'daily') {
      const saved = loadDaily(today())
      if (saved?.completed) {
        setPuzzle(saved.puzzle)
        setGuesses(saved.guesses)
        setHintIndex(saved.hintIndex)
        setLives(saved.lives)
        setResult(saved.result)
        setRevealedAnswer(saved.revealedAnswer || null)
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
    setGaveUp(false)
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
      // Last life lost — fetch the answer for the reveal dialog
      if (lives === 1) {
        fetch(`${API}/reveal?puzzle_id=${puzzle.id}`).then(r => r.json()).then(d => {
          setRevealedAnswer(d.answer)
        })
      }
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

  const handleGiveUp = async () => {
    if (!puzzle) return
    const res = await fetch(`${API}/reveal?puzzle_id=${puzzle.id}`)
    const data = await res.json()
    setRevealedAnswer(data.answer)
    setGaveUp(true)
  }

  // Persist daily state & update stats on completion
  useEffect(() => {
    if (!puzzle || mode !== 'daily' || !result) return
    if (!result.correct && lives > 0 && !gaveUp) return // still playing

    const state = { puzzle, guesses, hintIndex, lives, result, revealedAnswer, completed: true }
    saveDaily(today(), state)

    if (stats.lastPlayedDate === today()) return // already counted

    const s = { ...stats }
    s.gamesPlayed += 1
    s.lastPlayedDate = today()

    if (gaveUp) {
      s.gaveUp += 1
      s.currentStreak = 0
    } else if (result.correct) {
      s.wins += 1
      s.totalGuesses += guesses.length
      s.currentStreak = stats.lastPlayedDate === yesterday() ? s.currentStreak + 1 : 1
      s.maxStreak = Math.max(s.maxStreak, s.currentStreak)
    } else {
      s.currentStreak = 0
    }
    setStats(s)
  }, [result, lives, gaveUp])

  const toggleTheme = () => {
    const nt = theme === 'light' ? 'dark' : 'light'
    setTheme(nt)
    localStorage.setItem('theme', nt)
  }

  const shareResult = async () => {
    const lines = [`Heteronym #${dailyPuzzleNum + 1}`]
    if (result?.correct) {
      lines.push(`✅ Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 's'} · ${hintIndex} hint${hintIndex === 1 ? '' : 's'}`)
    } else if (gaveUp) {
      lines.push('🙌 Gave up')
    } else {
      lines.push('❌ Out of lives')
    }
    // Emoji visualization: 🔍 for hint, 🔴 for wrong, 🟩 for correct
    let visual = ''
    if (hintIndex > 0) visual += '🔍'.repeat(hintIndex)
    visual += guesses.map((g, i) => {
      if (i === guesses.length - 1 && result?.correct) return '🟩'
      return '🔴'
    }).join('')
    lines.push(visual)
    lines.push('')
    lines.push('https://heteronym.online')

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

  const handleTabChange = (id) => {
    setMode(id)
  }

  return (
    <main className="chroma-min-h-screen bg-chroma-mesh chroma-flex chroma-flex-col chroma-items-center chroma-px-4 chroma-py-6 chroma-transition-colors chroma-duration-300">

      {/* Header bar */}
      <div className="chroma-w-full chroma-max-w-md chroma-flex chroma-items-center chroma-justify-between chroma-mb-5">
        <ChromaButton variant="ghost" size="sm" icon="info" onClick={() => setShowInfo(true)}>
          Info
        </ChromaButton>

        <Tabs
          tabs={[
            { id: 'daily', label: 'Daily' },
            { id: 'freeplay', label: 'Free Play' },
          ]}
          activeId={mode}
          onChange={handleTabChange}
        />

        <div className="chroma-flex chroma-items-center chroma-gap-2">
          <ChromaButton variant="ghost" size="sm" icon="bar_chart" onClick={() => setShowStats(true)} />
          <ChromaButton
            variant="ghost"
            size="sm"
            icon={theme === 'light' ? 'dark_mode' : 'light_mode'}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="chroma-font-display chroma-text-3xl chroma-font-bold chroma-mb-1 chroma-text-balance">Heteronym</h1>
      {mode === 'daily' && (
        <p className="chroma-text-xs chroma-text-tertiary">Puzzle #{dailyPuzzleNum + 1}</p>
      )}
      <p className="chroma-text-xs chroma-text-violet chroma-font-semibold chroma-mb-1">
        🔥 Streak: {stats.currentStreak}
      </p>
      <p className="chroma-text-sm chroma-md-text-base chroma-mb-1 chroma-text-center chroma-max-w-md chroma-text-secondary">
        Two clues point to one hidden synonym
      </p>

      {/* Lives */}
      <div className="chroma-mb-4 chroma-mt-1">
        <HeartsDisplay total={4} active={lives} animate={false} />
      </div>

      {loading ? (
        <Skeleton width={400} height={300} radius="var(--r-lg)" className="chroma-max-w-full" />
      ) : puzzle && (
        <GlassPanel
          ref={puzzleCardRef}
          padding={24}
          className="chroma-w-full chroma-max-w-md chroma-text-center chroma-relative"
        >
          {/* Clues */}
          <p className="chroma-text-base chroma-mb-1 chroma-text-secondary">
            <Icon name="psychology" size={16} className="chroma-align-middle chroma-mr-1" />
            Clue 1: <strong className="chroma-text-primary">{puzzle.clue1}</strong>
          </p>
          <p className="chroma-text-base chroma-mb-5 chroma-text-secondary">
            <Icon name="psychology" size={16} className="chroma-align-middle chroma-mr-1" />
            Clue 2: <strong className="chroma-text-primary">{puzzle.clue2}</strong>
          </p>

          {/* Input & buttons */}
          {!(result?.correct || (lives === 0 && result) || gaveUp) && (
            <>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Your guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="chroma-flex chroma-gap-2 chroma-mt-3 chroma-mb-4">
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

              {/* Give Up — shown when 1 life left (3 lost) or exhausted, giving up reveals answer */}
              {lives <= 1 && !result && (
                <div className="chroma-mb-4">
                  <ChromaButton variant="ghost" icon="visibility" fullWidth onClick={handleGiveUp}>
                    Give Up / Show Answer
                  </ChromaButton>
                </div>
              )}
            </>
          )}

          {/* Result message */}
          {result && (
            <p className={`chroma-text-base chroma-font-semibold chroma-mb-3 ${
              gaveUp ? 'chroma-text-violet' :
              lives === 0 && !result.correct ? 'chroma-text-red' :
              result.correct ? 'chroma-text-green' : 'chroma-text-amber'
            }`}>
              {result.correct ? (
                <><Icon name="check_circle" size={18} color="var(--green)" filled /> Correct!</>
              ) : gaveUp ? (
                <><Icon name="visibility" size={18} color="var(--violet)" /> Gave up — the answer was <strong>{revealedAnswer}</strong></>
              ) : lives > 0 ? (
                <><Icon name="close" size={18} color="var(--red)" /> Nope, try again!</>
              ) : (
                <><Icon name="heart_broken" size={18} color="var(--red)" /> Out of lives — <strong>{revealedAnswer}</strong></>
              )}
            </p>
          )}

          {/* Hints */}
          {hintIndex > 0 && (
            <div className="chroma-mb-3">
              <p className="chroma-text-xs chroma-mb-1 chroma-text-tertiary">Hints revealed:</p>
              <ul className="chroma-space-y-0h">
                {puzzle.hints.slice(0, hintIndex).map((h, i) => (
                  <li key={i} className="chroma-text-sm chroma-text-secondary">
                    <Icon name="lightbulb" size={14} color="var(--amber)" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous guesses */}
          {guesses.length > 0 && (
            <div className="chroma-mb-3">
              <p className="chroma-text-xs chroma-mb-1 chroma-text-tertiary">Your guesses:</p>
              <div className="chroma-flex chroma-flex-wrap chroma-gap-1h chroma-justify-center">
                {guesses.map((g, i) => (
                  <Badge
                    key={i}
                    variant={i === guesses.length - 1 && result?.correct ? 'correct' : 'wrong'}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Post-completion actions (daily mode) */}
          {mode === 'daily' && (result?.correct || (lives === 0 && result) || gaveUp) && (
            <div className="chroma-mt-4 chroma-space-y-3">
              <ChromaButton
                variant="primary"
                icon={copied ? 'check' : 'share'}
                fullWidth
                onClick={shareResult}
              >
                {copied ? 'Copied!' : 'Share Result'}
              </ChromaButton>
              {/* Social share links */}
              <div className="chroma-flex chroma-gap-2 chroma-justify-center">
                <ChromaButton
                  variant="ghost"
                  size="sm"
                  icon="alternate_email"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Heteronym #${dailyPuzzleNum + 1}` +
                      (result?.correct
                        ? ` ✅ Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 's'}`
                        : gaveUp
                          ? ` 🙌 Gave up`
                          : ` ❌ Out of lives`) +
                      `\nhttps://heteronym.online`
                    )
                    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener')
                  }}
                >
                  X
                </ChromaButton>
              </div>
              <p className="chroma-text-xs chroma-text-tertiary">
                <Icon name="schedule" size={14} className="chroma-align-middle chroma-mr-1" />
                Next puzzle in {nextTimer}
              </p>
            </div>
          )}

          {/* Free play next */}
          {mode === 'freeplay' && (result?.correct || (lives === 0 && result) || gaveUp) && (
            <ChromaButton variant="ghost" icon="arrow_forward" onClick={loadPuzzle} className="chroma-mt-4">
              Next Puzzle
            </ChromaButton>
          )}
        </GlassPanel>
      )}

      {/* Score (free play) */}
      {mode === 'freeplay' && (
        <p className="chroma-mt-3 chroma-text-sm chroma-text-tertiary">
          Score: <strong className="chroma-text-violet">{score}</strong>
        </p>
      )}

      {/* Adsterra native banner */}
      <div className="chroma-mt-6 chroma-w-full chroma-max-w-md chroma-flex chroma-justify-center chroma-min-h-ad">
        <div id="container-549cbeb6999c4e80413bcd2218d2532b" />
      </div>

      {/* Support link */}
      <a
        href="https://ko-fi.com/dylandemolder"
        target="_blank"
        rel="noopener noreferrer"
        className="chroma-link chroma-mt-3"
      >
        <Icon name="coffee" size={16} /> Support the game
      </a>

      {/* Stats modal */}
      <Modal open={showStats} onClose={() => setShowStats(false)} title="Statistics">
        <div className="chroma-grid chroma-grid-cols-4 chroma-gap-3 chroma-text-center chroma-mb-4">
          <StatCard value={stats.gamesPlayed} label="Played" compact />
          <StatCard value={stats.gamesPlayed > 0 ? Math.round(stats.wins / stats.gamesPlayed * 100) : 0} label="Win %" compact />
          <StatCard value={stats.currentStreak} label="Streak" compact accent />
          <StatCard value={stats.maxStreak} label="Max" compact />
        </div>
        {stats.wins > 0 && (
          <p className="chroma-text-sm chroma-text-center chroma-text-tertiary">
            Avg guesses: <strong className="chroma-text-primary">{(stats.totalGuesses / stats.wins).toFixed(1)}</strong>
          </p>
        )}
        {stats.gaveUp > 0 && (
          <p className="chroma-text-sm chroma-text-center chroma-text-tertiary">
            Gave up: <strong className="chroma-text-violet">{stats.gaveUp}</strong>
          </p>
        )}
      </Modal>

      {/* Info modal */}
      <Modal open={showInfo} onClose={() => setShowInfo(false)} title="How to Play" titleIcon="info">
        <p className="chroma-text-sm chroma-mb-3 chroma-text-secondary">
          You're given two clues. Both are synonyms of the same hidden word — a <strong className="chroma-text-primary">heteronym</strong> (spelled the same, different meanings).
        </p>
        <p className="chroma-text-sm chroma-mb-3 chroma-text-secondary">
          Guess the word they both point to. Each wrong guess costs a life, and each hint you reveal also costs a life.
        </p>
        <div className="chroma-rounded-lg chroma-p-3 chroma-mb-3 chroma-space-y-1 chroma-bg-hover">
          <p className="chroma-text-sm chroma-text-primary">
            <Badge variant="correct" className="chroma-tab-active chroma-inline-flex chroma-mr-1h p-3">Daily</Badge>
            <span className="chroma-text-secondary">One puzzle per day, same for everyone. Streaks and stats tracked.</span>
          </p>
          <p className="chroma-text-sm chroma-text-primary">
            <Badge variant="correct" className="chroma-tab-active chroma-inline-flex chroma-mr-1h p-3">Free Play</Badge>
            <span className="chroma-text-secondary">Random puzzles, practice mode with score.</span>
          </p>
        </div>
        <p className="chroma-text-sm chroma-text-tertiary">
          <Icon name="rocket_launch" size={16} className="chroma-align-middle chroma-mr-1" />
          Good luck!
        </p>
      </Modal>

    </main>
  )
}
