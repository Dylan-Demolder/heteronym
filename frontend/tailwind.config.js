export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chroma: {
          violet: { DEFAULT: '#7C5CFC', light: '#8B6FF7', lighter: '#A78BFA', dim: '#6A4EE0' },
          coral: { DEFAULT: '#FF6B6B', light: '#FF8A8A', dim: '#E55A5A' },
          teal: { DEFAULT: '#14B8A6', light: '#2DD4BF', dim: '#0D9488' },
          amber: { DEFAULT: '#F59E0B', light: '#FBBF24', dim: '#D97706' },
        },
        glass: {
          light: 'rgba(255,255,255,0.7)',
          dark: 'rgba(30,30,35,0.8)',
          border: 'rgba(255,255,255,0.15)',
          borderDark: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        chroma: '10px',
        glass: '12px',
      },
      boxShadow: {
        glass: '0 0 0 0.5px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)',
        'glass-hover': '0 0 0 0.5px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.06)',
        'glass-elevated': '0 4px 12px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.3)',
      },
      animation: {
        shake: 'chroma-shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'heart-pop': 'chroma-heart-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        'chroma-shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'chroma-heart-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
