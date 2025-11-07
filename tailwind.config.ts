
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Playfair Display', 'serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont'],
				'playfair': ['Playfair Display', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				bar: {
					dark: 'hsl(222 84% 6%)',
					purple: 'hsl(262 83% 65%)',
					accent: 'hsl(262 83% 58%)',
					light: 'hsl(262 100% 95%)',
					muted: 'hsl(262 50% 45%)',
					gold: 'hsl(38 92% 50%)',
					green: 'hsl(142 71% 45%)',
					blue: 'hsl(199 89% 48%)',
					red: 'hsl(0 84% 60%)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)'
			},
			keyframes: {
				'skeleton-pulse': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.4'
					}
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'gentle-bounce': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-6px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200px 0' },
					'100%': { backgroundPosition: 'calc(200px + 100%) 0' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'bounce-soft': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-2px)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
      animation: {
        'skeleton-pulse': 'skeleton-pulse 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'accordion-down': 'accordion-down 2s ease-out',
        'accordion-up': 'accordion-up 2s ease-out',
        'fade-in': 'fade-in 3.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fade-in-up 4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 2.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 2.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 2.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'gentle-bounce': 'gentle-bounce 10s ease-in-out infinite',
        'float': 'float 16s ease-in-out infinite',
        'shimmer': 'shimmer 7.2s ease-out',
        'gradient-shift': 'gradient-shift 20s ease infinite',
        'pulse-subtle': 'pulse-subtle 12s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 6s ease-in-out infinite',
        'slide-up': 'slide-up 2.4s ease-out'
      },
			spacing: {
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-top': 'env(safe-area-inset-top)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			},
			backdropBlur: {
				xs: '2px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
