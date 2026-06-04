export default function Skeleton({
  width,
  height,
  radius,
  className = '',
  style,
}) {
  return (
    <div
      className={`chroma-skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width || '100%',
        height: typeof height === 'number' ? `${height}px` : height || 20,
        borderRadius: radius || 'var(--r-sm)',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
