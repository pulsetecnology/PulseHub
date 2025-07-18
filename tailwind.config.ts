import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#2563eb", // azul royal
          hover: "#1d4ed8",
        },
        secondary: {
          DEFAULT: "#10b981", // verde-menta
          hover: "#059669",
        },
        light: "#ffffff",
        dark: "#1f2937",
      },
      borderRadius: {
        '2xl': '1rem',
      },
      animation: {
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite 1s',
      },
      keyframes: {
        ping: {
          '75%, 100%': {
            transform: 'scale(1.5)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;