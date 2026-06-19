import { Icon } from './chroma'

/**
 * NewsletterSignup — Embedded signup form for the puzzle completion screen.
 *
 * Set VITE_NEWSLETTER_EMBED_URL in your deployment env to the iframe embed URL
 * from your email provider (MailerLite, Substack, ConvertKit, etc.).
 *
 * If unset, the component renders nothing.
 */

const EMBED_URL = import.meta.env.VITE_NEWSLETTER_EMBED_URL || ''

export default function NewsletterSignup() {
  if (!EMBED_URL || !EMBED_URL.startsWith('http')) return null

  return (
    <div className="chroma-mt-5 chroma-w-full chroma-max-w-md chroma-mx-auto">
      <div className="chroma-text-center chroma-mb-2">
        <p className="chroma-text-sm chroma-font-semibold chroma-text-primary">
          <Icon name="mail" size={16} className="chroma-align-middle chroma-mr-1" />
          Get the daily puzzle in your inbox
        </p>
      </div>
      <iframe
        src={EMBED_URL}
        title="Newsletter Signup"
        className="chroma-w-full"
        style={{ border: 'none', height: '200px' }}
      />
    </div>
  )
}
