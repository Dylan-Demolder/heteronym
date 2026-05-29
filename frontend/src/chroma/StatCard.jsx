export default function StatCard({
  value,
  label,
  icon,
  color = 'default',
  className = '',
  style,
  children,
  compact = false,
  accent = false,
  onClick,
}) {
  return (
    <div
      className={`stat-card glass-panel ${compact ? 'stat-card-compact' : ''} ${accent ? 'stat-card-accent' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <span className="stat-icon material-symbols-outlined">{icon}</span>
      )}
      <div className="stat-value">{String(value)}</div>
      <div className="stat-label">{label}</div>
      {children}
    </div>
  )
}
