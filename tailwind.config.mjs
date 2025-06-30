/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7c9bb5',
        'primary-light': '#9bb0c4',
        'secondary': '#a8b8c8',
        'secondary-light': '#b8c7d6',
        'secondary-dark': '#8fa3b3',
        'accent': '#9bb0c4',
        'text-primary': '#4a453f',
        'bg-primary': '#ffffff',
        'light-gray': '#f5f5f5',
      },
      fontFamily: {
        'sans': ['Noto Sans TC', 'sans-serif'],
        'serif': ['Noto Serif TC', 'serif'],
        'display': ['Lora', 'serif'],
      },
      boxShadow: {
        'light': '0 2px 8px rgba(0,0,0,0.05)',
        'medium': '0 4px 12px rgba(0,0,0,0.1)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
} 