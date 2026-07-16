/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        card: '#1e293b',
        'card-foreground': '#e2e8f0',
        primary: '#06b6d4',
        'primary-foreground': '#042f2e',
        secondary: '#8b5cf6',
        'secondary-foreground': '#1e1b4b',
        muted: '#1e293b',
        'muted-foreground': '#94a3b8',
        accent: '#06b6d4',
        'accent-foreground': '#042f2e',
        destructive: '#ef4444',
        'destructive-foreground': '#fef2f2',
        border: '#334155',
        input: '#1e293b',
        ring: '#06b6d4',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};