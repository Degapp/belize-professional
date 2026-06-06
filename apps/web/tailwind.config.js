import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
          fontFamily: {
            clash: ['Clash Display', 'sans-serif'],
            satoshi: ['Satoshi', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#EEF2FF',
              100: '#E0E7FF',
              500: '#6366F1',
              600: '#4F46E5',
              700: '#4338CA',
              900: '#312E81',
            },
            accent: {
              teal: '#0D9488',
              amber: '#D97706',
              charcoal: '#0F172A'
            }
          }
        }
      },
  plugins: [],
};
export default config;
