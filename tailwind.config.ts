import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          500: 'var(--primary-500)',
          800: 'var(--primary-800)',
          200: 'var(--primary-200)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          200: 'var(--secondary-200)',
          500: 'var(--secondary-500)',
          800: 'var(--secondary-800)',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary)',
        }
      },
    },
  },
  plugins: [],
};
export default config;
