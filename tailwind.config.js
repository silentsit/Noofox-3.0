/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50: '#e9fbf8',
          100: '#c9f3ec',
          200: '#9be7db',
          300: '#67d5c7',
          400: '#36b9ad',
          500: '#1d9c92',
          600: '#157c75',
          700: '#14645f',
          800: '#164f4b',
          900: '#163f3d',
        },
        accent: {
          300: '#f3cd83',
          400: '#ecb95d',
          500: '#d6962c',
          600: '#ad751f',
        },
        surface: {
          50: '#f8f4ed',
          100: '#eee7da',
          200: '#ddd0bc',
          300: '#c8b49a',
          400: '#ab9177',
          500: '#8f7560',
          600: '#735d4d',
          700: '#58483d',
          800: '#342f34',
          900: '#181c29',
          950: '#07111f',
        },
      },
    },
  },
  plugins: [],
};
