import { forwardRef } from 'react'

export default forwardRef(function GlassPanel({
  children,
  elevated = false,
  className = '',
  style,
  onClick,
  hoverable = false,
  accent = 'none',
  padding,
}, ref) {
  const cls = [
    elevated ? 'glass-panel-elevated' : 'glass-panel',
    hoverable ? 'glass-panel-hover' : '',
    accent !== 'none' ? `glass-panel-accent-${accent}` : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref}
      className={cls}
      style={{ ...(padding != null ? { padding } : {}), ...style }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
})
