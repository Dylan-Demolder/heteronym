import { forwardRef } from 'react'

export default forwardRef(function Input({
  className = '',
  fullWidth = false,
  ...props
}, ref) {
  return (
    <input
      ref={ref}
      className={`chroma-input ${fullWidth ? 'chroma-input-full' : ''} ${className}`}
      {...props}
    />
  )
})
