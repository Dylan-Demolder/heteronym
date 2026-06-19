import { useEffect, useState, useRef, useCallback } from 'react'
import { HeartsDisplay, GlassPanel, ChromaButton, StatCard, Icon, Badge, Input, Modal, Tabs, Skeleton, FullPageOverlay } from './chroma'
import Archive from './Archive'
import About from './About'
import BlogPage from './BlogPage'
import NewsletterSignup from './NewsletterSignup'

const API = '/api'
const STATS_KEY = 'heteronym_stats'
const SCORE_KEY = 'heteronym_score'
const FIRST_VISIT_KEY = 'heteronym_visited'
const NEWSLETTER_COUNT_KEY = 'heteronym_nl_count'

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
  // Parse challenge param from URL on mount
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const challengeId = urlParams.get('challenge')

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
  const [challengeCopied, setChallengeCopied] = useState(false)
  const [nextTimer, setNextTimer] = useState('')
  const [stats, setStatsRaw] = useState(loadStats)
  const [dailyPuzzleNum, setDailyPuzzleNum] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gaveUp, setGaveUp] = useState(false)
  const [revealedAnswer, setRevealedAnswer] = useState(null)
  const [challengeMode] = useState(challengeId !== null && challengeId !== '')
  const [showArchive, setShowArchive] = useState(() => urlParams.get('page') === 'archive')
  const [archivePuzzleId, setArchivePuzzleId] = useState(null)
  const [showAbout, setShowAbout] = useState(() => urlParams.get('page') === 'about')
  const [showBlog, setShowBlog] = useState(() => urlParams.get('page') === 'blog')
  const [blogPostSlug, setBlogPostSlug] = useState(() => {
    if (urlParams.get('page') === 'blog') {
      return urlParams.get('slug') || null
    }
    return null
  })
  const inputRef = useRef()
  const puzzleCardRef = useRef()

  const setStats = useCallback(s => { setStatsRaw(s); saveStats(s) }, [])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Sync overlay state with URL for ?page route support
  useEffect(() => {
    const url = new URL(window.location)
    if (showArchive) {
      url.searchParams.set('page', 'archive')
      url.searchParams.delete('slug')
    } else if (showAbout) {
      url.searchParams.set('page', 'about')
      url.searchParams.delete('slug')
    } else if (showBlog) {
      url.searchParams.set('page', 'blog')
      if (blogPostSlug) {
        url.searchParams.set('slug', blogPostSlug)
      } else {
        url.searchParams.delete('slug')
      }
    } else {
      url.searchParams.delete('page')
      url.searchParams.delete('slug')
    }
    window.history.replaceState(null, '', url.toString())
  }, [showArchive, showAbout, showBlog, blogPostSlug])

  // Update OG meta tags for challenge mode — social media previews
  useEffect(() => {
    if (!challengeMode || !puzzle) return
    const prevOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''
    const prevOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogTitle) ogTitle.setAttribute('content', `Heteronym — Puzzle #${dailyPuzzleNum + 1} Challenge`)
    if (ogDesc) ogDesc.setAttribute('content', `Two clues, one hidden word. Clue 1: ${puzzle.clue1} · Clue 2: ${puzzle.clue2}. Can you solve it?`)
    return () => {
      if (ogTitle) ogTitle.setAttribute('content', prevOgTitle)
      if (ogDesc) ogDesc.setAttribute('content', prevOgDesc)
    }
  }, [challengeMode, puzzle])

  // Listen for back/forward navigation to sync overlay state
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search)
      setShowArchive(params.get('page') === 'archive')
      setShowAbout(params.get('page') === 'about')
      setShowBlog(params.get('page') === 'blog')
      if (params.get('page') === 'blog') {
        setBlogPostSlug(params.get('slug') || null)
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  // First-visit onboarding
  useEffect(() => {
    const visited = localStorage.getItem(FIRST_VISIT_KEY)
    if (!visited) {
      localStorage.setItem(FIRST_VISIT_KEY, 'true')
      setShowInfo(true)
    }
  }, [])

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
    setGaveUp(false)
    setRevealedAnswer(null)

    // Challenge mode: load a specific puzzle by ID
    if (challengeMode && challengeId) {
      fetch(`${API}/puzzle/${challengeId}`).then(r => {
        if (!r.ok) throw new Error('Puzzle not found')
        return r.json()
      }).then(data => {
        setPuzzle(data)
        setDailyPuzzleNum(data.id)
        setGuesses([])
        setHintIndex(0)
        setLives(4)
        setResult(null)
        setLoading(false)
      }).catch(() => {
        // Fallback to daily if challenge puzzle not found
        setMode('daily')
        setLoading(false)
      })
      return
    }

    // Archive mode: load a specific puzzle by ID
    if (archivePuzzleId !== null) {
      fetch(`${API}/puzzle/${archivePuzzleId}`).then(r => {
        if (!r.ok) throw new Error('Puzzle not found')
        return r.json()
      }).then(data => {
        setPuzzle(data)
        setDailyPuzzleNum(data.id)
        setGuesses([])
        setHintIndex(0)
        setLives(4)
        setResult(null)
        setShowArchive(false)
        setArchivePuzzleId(null)
        setLoading(false)
      }).catch(() => {
        setMode('daily')
        setShowArchive(false)
        setArchivePuzzleId(null)
        setLoading(false)
      })
      return
    }

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
  }, [mode, archivePuzzleId])

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
      inputRef.current?.focus()
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
      if (hintIndex === 0) {
        setHintIndex(i => i + 1)
      } else {
        setHintIndex(i => i + 1)
        setLives(l => l - 1)
      }
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
    // Increment newsletter completion counter
    const nlCount = Number(localStorage.getItem(NEWSLETTER_COUNT_KEY)) || 0
    localStorage.setItem(NEWSLETTER_COUNT_KEY, nlCount + 1)
  }, [result, lives, gaveUp])

  const toggleTheme = () => {
    const nt = theme === 'light' ? 'dark' : 'light'
    setTheme(nt)
    localStorage.setItem('theme', nt)
  }

  const shareResult = async () => {
    const isChallenge = challengeMode
    const siteUrl = isChallenge
      ? `https://heteronym.online/challenge/${dailyPuzzleNum}`
      : 'https://heteronym.online'
    const lines = [`Heteronym — Puzzle #${dailyPuzzleNum + 1}`]
    if (result?.correct) {
      lines.push(`✅ Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 's'} · ${hintIndex} hint${hintIndex === 1 ? '' : 's'}`)
    } else if (gaveUp) {
      lines.push('Gave up')
    } else {
      lines.push('❌ Out of lives')
    }
    // CHROMA violet emoji grid — one row per guess, max 4 columns
    const MAX_GUESSES = 4
    let visual = ''
    guesses.forEach((_, i) => {
      const filled = '🟪'.repeat(i + 1)
      const empty = '⬜'.repeat(MAX_GUESSES - (i + 1))
      visual += filled + empty + '\n'
    })
    lines.push(visual.trimEnd())
    lines.push(`Streak: ${stats.currentStreak}`)
    lines.push('')
    lines.push(siteUrl)

    const text = lines.join('\n')

    // Native share on mobile only — desktop always copies to clipboard (like Wordle)
    if (navigator.share && window.innerWidth < 768) {
      try {
        await navigator.share({ text })
        return
      } catch {
        // User cancelled or failed — fall through to clipboard
      }
    }
    // Clipboard (desktop default)
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

        <div className="chroma-flex chroma-items-center chroma-gap-1">
          <div className="chroma-w-px chroma-h-5 chroma-bg-border chroma-mr-1" />
          <ChromaButton variant="ghost" size="sm" icon="description" onClick={() => setShowAbout(true)} aria-label="About" />
          <ChromaButton variant="ghost" size="sm" icon="history" onClick={() => setShowArchive(true)} aria-label="Puzzle Archive" />
          <ChromaButton variant="ghost" size="sm" icon="bar_chart" onClick={() => setShowStats(true)}>
            Stats
          </ChromaButton>
          <ChromaButton
            variant="ghost"
            size="sm"
            icon={theme === 'light' ? 'dark_mode' : 'light_mode'}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
      </div>

      {showBlog ? (
        <BlogPage
          slug={blogPostSlug}
          onSelectPost={(slug) => setBlogPostSlug(slug)}
          onClose={() => { setShowBlog(false); setBlogPostSlug(null) }}
        />
      ) : (
        <>

      {/* Title */}
      <h1 className="chroma-font-display chroma-text-3xl chroma-font-bold chroma-mb-1 chroma-text-balance">Heteronym</h1>
      {mode === 'daily' && (
        <>
          <p className="chroma-text-sm chroma-text-secondary chroma-font-semibold">
            Puzzle #{dailyPuzzleNum + 1}
            {challengeMode && <Badge variant="accent" className="chroma-ml-1h">Challenge</Badge>}
          </p>
          <p className="chroma-text-xs chroma-text-violet chroma-font-semibold chroma-mb-1">
            <Icon name="local_fire_department" size={14} color="var(--coral)" /> Streak: {stats.currentStreak}
          </p>
        </>
      )}
      <p className="chroma-text-sm chroma-md-text-base chroma-mb-1 chroma-text-center chroma-max-w-md chroma-text-secondary">
        Two clues, one heteronym — same spelling, different meanings
      </p>

      {/* Lives */}
      <p className="chroma-text-xs chroma-text-tertiary chroma-mb-1 chroma-text-center">Lives</p>
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
                <p className="chroma-text-xs chroma-text-tertiary chroma-mt-1">{hintIndex === 0 ? 'First hint free' : 'Costs 1 life'}</p>
                {mode === 'freeplay' && (
                  <ChromaButton variant="ghost" icon="skip_next" onClick={loadPuzzle}>
                    Skip
                  </ChromaButton>
                )}
              </div>

              {/* Give Up — shown when 1 life left (3 lost) or exhausted, giving up reveals answer */}
              {puzzle && !result && !(result?.correct || (lives === 0 && result) || gaveUp) && (
                <div className="chroma-mb-4">
                  <ChromaButton variant="ghost" icon="lightbulb" fullWidth onClick={handleGiveUp}>
                    Show Answer
                  </ChromaButton>
                </div>
              )}
            </>
          )}

          {/* Result message */}
          {result && (
            <>
            <p className={`chroma-text-base chroma-font-semibold chroma-mb-1 ${
              gaveUp ? 'chroma-text-violet' :
              lives === 0 && !result.correct ? 'chroma-text-red' :
              result.correct ? 'chroma-text-green' : 'chroma-text-amber'
            }`}>
              {result.correct ? (
                <><Icon name="check_circle" size={18} color="var(--green)" filled /> Correct! ({guesses.length} guess{guesses.length !== 1 ? 'es' : ''})</>
              ) : gaveUp ? (
                <><Icon name="visibility" size={18} color="var(--violet)" /> Gave up — the answer was <strong>{revealedAnswer}</strong></>
              ) : lives > 0 ? (
                <><Icon name="close" size={18} color="var(--red)" /> Nope, try again!</>
              ) : (
                <><Icon name="heart_broken" size={18} color="var(--red)" /> Out of lives — <strong>{revealedAnswer}</strong></>
              )}
            </p>
            {result.correct && (
              <div className="chroma-flex chroma-gap-3 chroma-justify-center chroma-mb-3 chroma-text-xs chroma-text-secondary">
                <span>Guesses: <strong>{guesses.length}</strong></span>
                <span>Hints: <strong>{hintIndex}</strong></span>
                <span>Lives: <strong>{lives}/{4}</strong></span>
              </div>
            )}
            </>
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
              {/* Challenge a friend — share the daily puzzle link */}
              {!challengeMode && (
                <div className="chroma-rounded-xl chroma-p-3 chroma-bg-violet/5 chroma-border chroma-border-violet/10">
                  <p className="chroma-text-sm chroma-font-semibold chroma-text-primary chroma-mb-1">
                    <Icon name="emoji_events" size={16} color="var(--violet)" className="chroma-align-middle chroma-mr-1" />
                    Challenge a friend
                  </p>
                  <p className="chroma-text-xs chroma-text-tertiary chroma-mb-2">
                    See who can solve today's puzzle faster
                  </p>
                  <ChromaButton
                    variant="primary"
                    icon={challengeCopied ? 'check' : 'link'}
                    fullWidth
                    size="sm"
                    onClick={async () => {
                      const url = `https://heteronym.online/challenge/${dailyPuzzleNum}`
                      try {
                        await navigator.clipboard.writeText(url)
                        setChallengeCopied(true)
                        setTimeout(() => setChallengeCopied(false), 2000)
                      } catch {
                        // Fallback
                        const ta = document.createElement('textarea')
                        ta.value = url
                        document.body.appendChild(ta)
                        ta.select()
                        document.execCommand('copy')
                        document.body.removeChild(ta)
                        setChallengeCopied(true)
                        setTimeout(() => setChallengeCopied(false), 2000)
                      }
                    }}
                  >
                    {challengeCopied ? 'Link Copied!' : 'Copy Challenge Link'}
                  </ChromaButton>
                </div>
              )}

              {/* Share Result (clipboard / native share on mobile) */}
              <ChromaButton
                variant="primary"
                icon={copied ? 'check' : 'share'}
                fullWidth
                onClick={shareResult}
              >
                {copied ? 'Copied!' : 'Share Score'}
              </ChromaButton>

              {/* Social share links */}
              <p className="chroma-text-xs chroma-text-center chroma-text-tertiary chroma--mb-1">Share on social</p>
              <div className="chroma-flex chroma-gap-2 chroma-justify-center chroma-flex-wrap">
                {/* X/Twitter */}
                <ChromaButton
                  variant="ghost"
                  size="sm"
                  icon="alternate_email"
                  onClick={() => {
                    const MAX_G = 4
                    let grid = ''
                    if (guesses.length > 0) {
                      guesses.forEach((_, i) => {
                        grid += '🟪'.repeat(i + 1) + '⬜'.repeat(MAX_G - (i + 1)) + '\n'
                      })
                    } else {
                      grid = '🟪\n'
                    }
                    const shareUrl = challengeMode
                      ? `https://heteronym.online/challenge/${dailyPuzzleNum}`
                      : `https://heteronym.online`
                    const lines = [
                      `Heteronym — Puzzle #${dailyPuzzleNum + 1}`,
                      grid.trimEnd(),
                      `Streak: ${stats.currentStreak}`,
                      shareUrl,
                    ]
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
                  }}
                >
                  X
                </ChromaButton>
                {/* WhatsApp */}
                <ChromaButton
                  variant="ghost"
                  size="sm"
                  icon="chat"
                  onClick={() => {
                    const MAX_G = 4
                    let grid = ''
                    if (guesses.length > 0) {
                      guesses.forEach((_, i) => {
                        grid += '🟪'.repeat(i + 1) + '⬜'.repeat(MAX_G - (i + 1)) + '\n'
                      })
                    } else {
                      grid = '🟪\n'
                    }
                    const shareUrl = challengeMode
                      ? `https://heteronym.online/challenge/${dailyPuzzleNum}`
                      : `https://heteronym.online`
                    const lines = [
                      `Heteronym — Puzzle #${dailyPuzzleNum + 1}`,
                      grid.trimEnd(),
                      `Streak: ${stats.currentStreak}`,
                      shareUrl,
                    ]
                    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
                  }}
                >
                  WhatsApp
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

      {/* Newsletter signup — shown on completion (daily mode), after 3 completions */}
      {puzzle && mode === 'daily' && (Number(localStorage.getItem(NEWSLETTER_COUNT_KEY)) || 0) >= 3 && (result?.correct || (lives === 0 && result) || gaveUp) && (
        <NewsletterSignup />
      )}

      {/* Score (free play) */}
      {mode === 'freeplay' && (
        <p className="chroma-mt-3 chroma-text-sm chroma-text-tertiary">
          Score: <strong className="chroma-text-violet">{score}</strong>
        </p>
      )}

      {/* Support link */}
      <ChromaButton variant="ghost" size="sm" icon="coffee" onClick={() => window.open('https://ko-fi.com/dylandemolder', '_blank', 'noopener')} className="chroma-mt-1">
        Support the game
      </ChromaButton>
      <ChromaButton variant="ghost" size="sm" onClick={() => setShowAbout(true)} className="chroma-mt-1">
        <Icon name="info" size={14} /> About
      </ChromaButton>
      <ChromaButton variant="ghost" size="sm" onClick={() => setShowBlog(true)} className="chroma-mt-1">
        <Icon name="article" size={14} /> Blog
      </ChromaButton>
        </>
      )}

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
          You're given two clues. Both describe different meanings of the same hidden word — a <strong className="chroma-text-primary">heteronym</strong> (spelled the same, different meanings).
        </p>
        <p className="chroma-text-sm chroma-mb-3 chroma-text-secondary">
          Guess the word they both point to. Each wrong guess costs a life, and each hint you reveal also costs a life.
        </p>
        <div className="chroma-rounded-lg chroma-p-3 chroma-mb-3 chroma-space-y-1 chroma-bg-hover">
          <p className="chroma-text-sm chroma-text-primary">
            <Badge className="chroma-inline-flex chroma-mr-1h">Daily</Badge>
            <span className="chroma-text-secondary">One puzzle per day, same for everyone. Streaks and stats tracked.</span>
          </p>
          <p className="chroma-text-sm chroma-text-primary">
            <Badge className="chroma-inline-flex chroma-mr-1h">Free Play</Badge>
            <span className="chroma-text-secondary">Random puzzles, practice mode with score.</span>
          </p>
        </div>
        <p className="chroma-text-sm chroma-text-tertiary">
          <Icon name="rocket_launch" size={16} className="chroma-align-middle chroma-mr-1" />
          Good luck!
        </p>
      </Modal>

      {/* About Page */}
      <FullPageOverlay open={showAbout} onClose={() => setShowAbout(false)} title="About" icon="description">
        <About />
      </FullPageOverlay>

      {/* Puzzle Archive */}
      <FullPageOverlay open={showArchive} onClose={() => setShowArchive(false)} title="Archive" icon="history">
        <Archive onSelectPuzzle={(id) => setArchivePuzzleId(id)} />
      </FullPageOverlay>

    </main>
  )
}
