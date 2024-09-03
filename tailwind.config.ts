import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		colors: {
  			primary: {
  				'200': 'var(--primary-200)',
  				'500': 'var(--primary-500)',
  				'800': 'var(--primary-800)',
  				DEFAULT: 'var(--primary)'
  			},
  			secondary: {
  				'200': 'var(--secondary-200)',
  				'500': 'var(--secondary-500)',
  				'800': 'var(--secondary-800)',
  				DEFAULT: 'var(--secondary)'
  			},
  			tertiary: {
  				DEFAULT: 'var(--tertiary)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
