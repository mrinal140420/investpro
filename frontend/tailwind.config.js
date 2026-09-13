/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface':    'var(--surface)',
        'surface-2':  'var(--surface-2)',
        'surface-3':  'var(--surface-3)',
        'border-c':   'var(--border)',
        'accent':     'var(--accent)',
        'accent-glow':'var(--accent-glow)',
        'gold':       'var(--gold)',
        'gold-light': 'var(--gold-light)',
        'maroon':     'var(--maroon)',
        'maroon-dark':'var(--maroon-dark)',
        'success':    'var(--success)',
        'warning':    'var(--warning)',
        'danger':     'var(--danger)',
        'text-1':     'var(--text-1)',
        'text-2':     'var(--text-2)',
        'text-3':     'var(--text-3)',
      },
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        serif: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
