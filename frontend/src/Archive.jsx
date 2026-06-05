import { useState, useEffect } from 'react'
import { GlassPanel, ChromaButton, Icon, Skeleton } from './chroma'

const API = '/api'

export default function Archive({ onSelectPuzzle }) {
  const [archive, setArchive] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API}/archive`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load archive')
        return r.json()
      })
      .then(data => {
        // Reverse so newest first
        setArchive(data.reverse())
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="chroma-w-full chroma-max-w-md chroma-mx-auto">
        <Skeleton width="100%" height={60} radius="var(--r-lg)" className="chroma-mb-2" />
        <Skeleton width="100%" height={60} radius="var(--r-lg)" className="chroma-mb-2" />
        <Skeleton width="100%" height={60} radius="var(--r-lg)" />
      </div>
    )
  }

  if (error) {
    return (
      <GlassPanel padding={24} className="chroma-w-full chroma-max-w-md chroma-text-center">
        <Icon name="error" size={24} color="var(--red)" />
        <p className="chroma-text-sm chroma-text-secondary chroma-mt-2">Couldn't load puzzle archive.</p>
      </GlassPanel>
    )
  }

  if (archive.length === 0) {
    return (
      <GlassPanel padding={24} className="chroma-w-full chroma-max-w-md chroma-text-center">
        <Icon name="inbox" size={24} color="var(--violet)" />
        <p className="chroma-text-sm chroma-text-secondary chroma-mt-2">No puzzles yet. Check back soon!</p>
      </GlassPanel>
    )
  }

  return (
    <div className="chroma-w-full chroma-max-w-md chroma-mx-auto chroma-space-y-2">
      <h2 className="chroma-text-lg chroma-font-semibold chroma-text-center chroma-mb-3 chroma-text-primary">
        <Icon name="history" size={18} className="chroma-align-middle chroma-mr-1" />
        Puzzle Archive
      </h2>
      {archive.map((entry) => {
        const dateObj = new Date(entry.date + 'T00:00:00')
        const formatted = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        return (
          <GlassPanel key={entry.date} padding={12} className="chroma-w-full">
            <div className="chroma-flex chroma-items-center chroma-justify-between">
              <div className="chroma-flex chroma-flex-col chroma-text-left">
                <span className="chroma-text-sm chroma-text-primary">
                  <Icon name="puzzle-piece" size={14} className="chroma-align-middle chroma-mr-1" />
                  Puzzle #{entry.id + 1}
                </span>
                <span className="chroma-text-xs chroma-text-tertiary">{formatted}</span>
              </div>
              <ChromaButton
                variant="ghost"
                size="sm"
                icon="play_arrow"
                onClick={() => onSelectPuzzle(entry.id)}
              >
                Play
              </ChromaButton>
            </div>
          </GlassPanel>
        )
      })}
    </div>
  )
}
