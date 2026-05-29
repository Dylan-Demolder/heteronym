import { useEffect, useState, useRef } from 'react'

const API = ''

export default function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [puzzle, setPuzzle] = useState(null)
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState(null)
  const [hints, setHints] = useState([])
  const [hintIndex, setHintIndex] = useState(0)
  const [score, setScore] = useState(() => Number(localStorage.getItem('heteronym_score')) || 0)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [lives, setLives] = useState(4)
  const [guesses, setGuesses] = useState([])
  const inputRef = useRef()

  const loadPuzzle = async () => {
    const res = await fetch(`${API}/puzzle`)
    const data = await res.json()
    setPuzzle(data)
    setHints(data.hints)
    setGuess('')
    setGuesses([])
    setResult(null)
    setHintIndex(0)
    setLives(4)
    if (inputRef.current) inputRef.current.classList.remove('animate-shake')
  }

  const submitGuess = async () => {
    if (!guess.trim()) return

    const res = await fetch(`${API}/guess?puzzle_id=${puzzle.id}&guess=${guess}`, { method: 'POST' })
    const data = await res.json()
    setResult(data)
    setGuesses(g => [...g, guess])

    if (data.correct) {
      const points = 3 - hintIndex
      const newScore = score + points
      setScore(newScore)
      localStorage.setItem('heteronym_score', newScore)
    } else {
      if (inputRef.current) {
        inputRef.current.classList.remove('animate-shake')
        void inputRef.current.offsetWidth
        inputRef.current.classList.add('animate-shake')
      }
      if (hintIndex < hints.length) {
        setHintIndex(i => i + 1)
        setLives(l => l - 1)
      } else {
        setLives(l => l - 1)
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    loadPuzzle()
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const renderHearts = () => {
    const fullHearts = '❤️'.repeat(lives)
    const brokenHearts = '💔'.repeat(4 - lives)
    return fullHearts + brokenHearts
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center justify-center px-4 py-10">
      <button
        onClick={() => setShowInfo(true)}
        className="top-4 left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 absolute z-10"
        aria-label="Info"
      >
        i
      </button>

      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              onClick={() => setShowInfo(false)}
              aria-label="Close Info"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2">How to Play</h2>
            <p className="text-base mb-3">
              You're given two words and need to find the heteronym - words that are spelled the same but have different meanings (and sometimes different pronunciations).
            </p>
            <p className="text-base mb-3">
              Both words are synonyms of a hidden word. Your goal is to guess that <strong>synonym</strong>.
            </p>
            <p className="text-base mb-3">
              You get 4 lives. Every incorrect guess or hint used costs one. Good luck!
            </p>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="text-xl">🌓</button>
      </div>
      <h1 className="text-4xl font-bold mb-2">Heteronym</h1>
      <p className="text-base md:text-lg mb-2 text-center max-w-md">Two words are clues. Find the one synonym they both point to.</p>
      <p className="text-lg mb-6 text-center">{renderHearts()}</p>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 w-full max-w-md text-center relative">
        {puzzle && (
          <>
            <div className="flex justify-between mb-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  if (hintIndex < hints.length && lives > 0 && !result?.correct) {
                    setHintIndex(i => i + 1)
                    setLives(l => l - 1)
                  }
                }}
                disabled={hintIndex >= hints.length || lives === 0 || result?.correct}
              >
                🔍 Get Hint
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                onClick={loadPuzzle}
                disabled={result?.correct || lives === 0}
              >
                ⏭ Skip
              </button>
            </div>
            <p className="text-xl mb-2">🧩 Clue 1: <strong>{puzzle.clue1}</strong></p>
            <p className="text-xl mb-4">🧩 Clue 2: <strong>{puzzle.clue2}</strong></p>

            <input
              ref={inputRef}
              type="text"
              className="w-full p-2 border rounded mb-4 text-black transition-transform"
              placeholder="Your guess..."
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" onClick={submitGuess} disabled={lives === 0 || result?.correct}>
              Submit Guess
            </button>

            {result && (
              <p
                className={`mt-4 text-lg font-semibold ${
                  lives === 0 && !result.correct ? 'text-red-600 dark:text-red-400' : ''
                }`}
              >
                {result.correct
                  ? '✅ Correct!'
                  : lives > 0
                  ? '❌ Incorrect. Try again!'
                  : `❌ Out of lives. The word was: ${result.answer}`}
              </p>
            )}


            {hintIndex > 0 && (
              <div className="mt-4">
                <ul className="mt-2">
                  {hints.slice(0, hintIndex).map((hint, i) => (
                    <li key={i} className="text-base text-gray-700 dark:text-gray-300 font-medium">🔍 {hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {(result?.correct || lives === 0) && (
              <button className="mt-6 text-green-600 underline" onClick={loadPuzzle}>
                Next Puzzle
              </button>
            )}
          </>
        )}
      <div className="absolute top-0 right-[-160px] w-36 h-full bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md text-xl font-semibold">
        <h3 className="font-bold mb-1 text-center">Guesses</h3>
        <ul className="space-y-1 text-gray-700 dark:text-gray-300">
          {guesses.map((g, i) => (
            <li key={i} className="truncate text-lg font-semibold">• {g}</li>
          ))}
        </ul>
      </div>

      </div>

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">Your Score: {score}</p>

      <style>{`
        .animate-shake {
          animation: shake 0.4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </main>
  )
}
