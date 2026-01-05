/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0f172a',
        },
        gray: {
          900: '#111827',
          800: '#1f2937',
        },
        indigo: {
          500: '#6366f1',
        },
        // JetBrains-inspired Palette (Neutral Technical Theme)
        jb: {
           dark: '#0B0D10',    // Page background (Cool technical black)
           panel: '#12151B',   // Primary surface (Sections)
           surface: '#181C25', // Elevated surface (Cards)
           accent: '#6366F1',  // Brand Indigo (Fixed from white)
           secondary: '#22D3EE', // Brand Cyan (Fixed from border color)
           violet: '#8B5CF6',  // Brand Violet
           border: '#2A2F3A',  // Actual border color
           text: '#D1D5DB',    // Body text (gray-300)
           muted: '#9CA3AF'    // Meta text (gray-400)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        urbanist: ['Urbanist', 'sans-serif'],
      }
    },
  },
  plugins: [
     require('@tailwindcss/typography'),
  ],
}
