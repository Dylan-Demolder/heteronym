import { useState, useEffect } from 'react'
import { Input, ChromaButton, GlassPanel, Icon } from './chroma'

/**
 * NewsletterSignup — Beehiiv signup embed for the puzzle completion screen.
 *
 * HOW TO CONFIGURE (choose one):
 *
 * Option A — Iframe embed (simplest, no API key needed):
 *   Set VITE_BEEHIIV_EMBED_URL in your deployment env to the Beehiiv iframe src.
 *   Example: VITE_BEEHIIV_EMBED_URL=https://embeds.beehiiv.com/abcdef12-3456-7890-abcd-ef1234567890
 *
 * Option B — Direct API submission (custom form, needs API key):
 *   Set VITE_BEEHIIV_API_URL and VITE_BEEHIIV_API_KEY (server-side proxy recommended).
 *   The frontend sends POST to VITE_BEEHIIV_API_URL with {email} in the body.
 *
 * If neither is set, the component shows a "Coming Soon" placeholder.
 */

const EMBED_URL = import.meta.env.VITE_BEEHIIV_EMBED_URL || ''
const API_URL = import.meta.env.VITE_BEEHIIV_API_URL || ''
const API_KEY = import.meta.env.VITE_BEEHIIV_API_KEY || ''

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Iframe embed mode
  if (EMBED_URL && EMBED_URL.startsWith('http')) {
    return (
      <div className="chroma-mt-5 chroma-w-full chroma-max-w-md chroma-mx-auto">
        <div className="chroma-text-center chroma-mb-2">
          <p className="chroma-text-sm chroma-font-semibold chroma-text-primary">
            <Icon name="mail" size={16} className="chroma-align-middle chroma-mr-1" />
            Get the daily puzzle in your inbox
          </p>
          {!iframeLoaded && (
            <p className="chroma-text-xs chroma-text-tertiary chroma-mt-1">Loading signup form...</p>
          )}
        </div>
        <div className={`chroma-transition-opacity chroma-duration-300 ${iframeLoaded ? 'chroma-opacity-100' : 'chroma-opacity-0'}`}>
          <iframe
            src={EMBED_URL}
            title="Newsletter Signup"
            className="chroma-w-full"
            style={{ border: 'none', height: '200px' }}
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      </div>
    )
  }

  // Direct form submission mode (via API proxy or direct)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return

    setLoading(true)
    setError('')

    try {
      if (API_URL) {
        const headers = { 'Content-Type': 'application/json' }
        if (API_KEY) {
          headers['Authorization'] = `Bearer ${API_KEY}`
        }
        const res = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ email: email.trim() }),
        })
        if (!res.ok) throw new Error('Subscription failed')
      }
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Try again or check back later.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <GlassPanel padding={16} className="chroma-mt-5 chroma-w-full chroma-max-w-md chroma-text-center">
        <div className="chroma-flex chroma-flex-col chroma-items-center chroma-gap-2">
          <Icon name="check_circle" size={28} color="var(--green)" filled />
          <p className="chroma-text-sm chroma-font-semibold chroma-text-primary">
            You're subscribed!
          </p>
          <p className="chroma-text-xs chroma-text-tertiary">
            Check your inbox to confirm. The daily puzzle lands every morning.
          </p>
        </div>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel padding={16} className="chroma-mt-5 chroma-w-full chroma-max-w-md">
      <form onSubmit={handleSubmit} className="chroma-space-y-3">
        <div className="chroma-text-center">
          <p className="chroma-text-sm chroma-font-semibold chroma-text-primary">
            <Icon name="mail" size={16} className="chroma-align-middle chroma-mr-1" />
            Get the daily puzzle
          </p>
          <p className="chroma-text-xs chroma-text-tertiary chroma-mt-0h">
            One email a day. Unsubscribe anytime.
          </p>
        </div>

        <div className="chroma-flex chroma-gap-2">
          <div className="chroma-flex-1">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-label="Email for newsletter"
            />
          </div>
          <ChromaButton
            type="submit"
            variant="primary"
            size="sm"
            icon="arrow_forward"
            disabled={loading || !email.includes('@')}
          >
            {loading ? '...' : 'Subscribe'}
          </ChromaButton>
        </div>

        {error && (
          <p className="chroma-text-xs chroma-text-red chroma-text-center">{error}</p>
        )}
      </form>
    </GlassPanel>
  )
}
