import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function Modal({
  open,
  onClose,
  title,
  icon: titleIcon,
  children,
  className = '',
}) {
  const prevRef = useRef(open)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="chroma-overlay" onClick={onClose}>
      <div
        className={`chroma-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button onClick={onClose} className="chroma-modal-close">✕</button>
        {title && (
          <div style={{ padding: '24px 24px 0' }}>
            {titleIcon && (
              <div className="flex items-center gap-2 mb-4">
                <Icon name={titleIcon} size={22} color="var(--violet)" filled />
                <h2 className="font-display text-xl font-bold">{title}</h2>
              </div>
            )}
            {!titleIcon && (
              <h2 className="font-display text-xl font-bold mb-5 text-center">{title}</h2>
            )}
          </div>
        )}
        <div style={{ padding: title ? '0 24px 24px' : '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
