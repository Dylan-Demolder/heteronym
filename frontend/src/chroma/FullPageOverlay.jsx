import { useEffect, useRef } from 'react'
import ChromaButton from './ChromaButton'
import Icon from './Icon'

export default function FullPageOverlay({
  open,
  onClose,
  title,
  icon: titleIcon,
  children,
  className = '',
}) {
  const containerRef = useRef(null)

  // Lock body scroll and focus the container when opened
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // Defer focus so the DOM has rendered
      requestAnimationFrame(() => containerRef.current?.focus())
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={containerRef}
      className={`chroma-fixed chroma-inset-0 chroma-z-50 chroma-bg-primary chroma-overflow-y-auto chroma-p-4 chroma-fade-in ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Overlay'}
      tabIndex={-1}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="chroma-w-full chroma-max-w-md chroma-mx-auto chroma-slide-up">
        <div className="chroma-flex chroma-items-center chroma-justify-between chroma-mb-4">
          <div className="chroma-flex chroma-items-center chroma-gap-2">
            {titleIcon && <Icon name={titleIcon} size={22} color="var(--violet)" filled />}
            <h2 className="chroma-text-xl chroma-font-bold chroma-text-primary">{title}</h2>
          </div>
          <ChromaButton variant="ghost" size="sm" icon="close" onClick={onClose} aria-label={`Close ${title || 'overlay'}`}>
            Close
          </ChromaButton>
        </div>
        {children}
      </div>
    </div>
  )
}
