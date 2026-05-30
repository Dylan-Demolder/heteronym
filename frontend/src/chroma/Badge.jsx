export default function Badge({
  children,
  variant = 'default',
  icon,
  className = '',
  style,
}) {
  const cls = [
    'chroma-badge',
    variant === 'correct' ? 'chroma-badge-correct' : '',
    variant === 'wrong' ? 'chroma-badge-wrong' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={cls} style={style}>
      {icon && (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 12, marginRight: 2, verticalAlign: 'middle' }}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}
