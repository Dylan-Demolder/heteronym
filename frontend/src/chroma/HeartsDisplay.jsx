import Icon from './Icon'

export default function HeartsDisplay({
  total = 4,
  active = 4,
  activeColor,
  lostColor,
  size = 22,
  gap = 4,
  className = '',
  style,
  animate = false,
}) {
  const hearts = Array.from({ length: total }, (_, i) => {
    const isActive = i < active
    return (
      <span
        key={i}
        className={`hearts-display-heart ${isActive ? 'active' : 'lost'} ${animate ? 'hearts-display-animate' : ''}`}
        style={{ animationDelay: animate ? `${i * 80}ms` : '0ms' }}
      >
        <Icon
          name={isActive ? 'favorite' : 'favorite_border'}
          filled={isActive}
          size={size}
          color={isActive ? (activeColor ?? 'var(--red, #ef4444)') : (lostColor ?? 'var(--text-tertiary, #86868b)')}
        />
      </span>
    )
  })

  return (
    <div
      className={`hearts-display ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap, ...style }}
      role="img"
      aria-label={`${active} of ${total} lives remaining`}
    >
      {hearts}
    </div>
  )
}
