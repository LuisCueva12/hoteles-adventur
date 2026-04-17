/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#FACC15',
          hover: '#EAB308',
          light: '#FEF9C3',
          dark: '#CA8A04',
        },
        admin: {
          primary: {
            DEFAULT: '#001F3F',
            hover: '#003366',
            light: '#E6EEF5',
            dark: '#001529',
          },
          accent: {
            DEFAULT: '#FACC15',
            hover: '#EAB308',
            light: '#FEF9C3',
          },
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
}
