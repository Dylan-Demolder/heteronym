export default function Icon({ name, size = 20, color, filled = false, className = '', style }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        color,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        lineHeight: 1,
        ...style,
      }}
    >
      {name}
    </span>
  )
}
