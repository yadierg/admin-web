/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f4',
          100: '#fce4e9',
          200: '#f9c9d3',
          300: '#f39cb0',
          400: '#e86686',
          500: '#d4145a',
          600: '#c8102e',   // ← rojo Instelec
          700: '#a30d26',
          800: '#860d24',
          900: '#6e0d22',
        },
        surface: '#f5f7fa',
        'surface-dark': '#0f172a',
        sidebar: {
          bg: '#1e293b',
          hover: '#334155',
        },
      },
      borderRadius: {
        card: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};