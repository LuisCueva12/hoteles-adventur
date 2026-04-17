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
            DEFAULT: '#082747',
            hover: '#0D355D',
            light: '#EEF4FB',
            dark: '#051B32',
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
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FBFF',
          muted: '#D8E3EE',
          ink: '#0F172A',
        },
      },
      borderRadius: {
        panel: '1.75rem',
      },
      boxShadow: {
        panel: '0 18px 50px -32px rgba(15, 23, 42, 0.45)',
        sidebar: '0 30px 70px -32px rgba(2, 19, 36, 0.65)',
      },
    },
  },
  plugins: [],
}
