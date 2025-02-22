import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},

		// あやが追加した部分　ローディングのアニメーション
		keyframes: {
			openLid: {
			  "0%, 100%": { transform: "translateY(0) rotate(0)" },
			  "20%": { transform: "translateY(-18px) rotate(-15deg)" }, /* 強めの動き */
			  "50%": { transform: "translateY(-14px) rotate(-10deg)" },
			  "80%": { transform: "translateY(-10px) rotate(-5deg)" },
			},
			spinPot: {
			  "0%, 100%": { transform: "rotate(0)" },
			  "20%": { transform: "rotate(20deg)" }, /* 強めの動き */
			  "50%": { transform: "rotate(15deg)" },
			  "80%": { transform: "rotate(8deg)" },
			},
			dots: {
			  "0%": { content: '"."' },
			  "25%": { content: '".."'},
			  "50%": { content: '"..."' },
			  "75%": { content: '""' }, /* ドットを消してリズムを作る */
			},
		  },
		  animation: {
			openLid: "openLid 1.2s ease-in-out infinite",
			spinPot: "spinPot 1.2s ease-in-out infinite",
			dots: "dots 1.2s steps(4) infinite",
		  },
		},
		
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
