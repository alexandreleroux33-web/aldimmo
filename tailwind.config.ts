import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        cream: {
          50:  '#FAF8F5',
          100: '#F5F0E8',
          200: '#EDE3D4',
          300: '#E0D0B8',
        },
        sand: {
          100: '#F7EDD8',
          200: '#EDD9B4',
          300: '#DFC48A',
        },
        sage: {
          400: '#7DAF90',
          500: '#5B8C6B',
          600: '#4A7559',
          700: '#3A5E46',
        },
        warm: {
          900: '#2D2926',
          800: '#3D3530',
          700: '#5C524C',
          600: '#7A6E68',
          400: '#A89E98',
          200: '#D8D0C8',
          100: '#EDE8E3',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FAF8F5 0%, #F5EFE4 35%, #EDE3D4 65%, #F0EBE1 100%)',
        'hero-warm': 'radial-gradient(ellipse at 70% 40%, #EDD9B4 0%, #F5EFE4 40%, #FAF8F5 75%)',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
