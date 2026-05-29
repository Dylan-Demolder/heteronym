export default function ChromaButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const cls = [
    'chroma-btn',
    `chroma-btn-${variant}`,
    size === 'sm' ? 'chroma-btn-sm' : '',
    fullWidth ? 'chroma-btn-full' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="chroma-btn-spinner" />
      ) : icon ? (
        <span className="material-symbols-outlined chroma-btn-icon">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
