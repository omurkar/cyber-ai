/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#4f46e5',
					foreground: '#ffffff',
				},
				muted: '#111827',
			},
			boxShadow: {
				card: '0 1px 2px 0 rgba(0,0,0,0.1), 0 1px 3px 0 rgba(0,0,0,0.1)'
			},
			screens: {
				xs: '420px',
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px',
			},
			fontSize: {
				sx: ['0.75rem', '1.25rem'],
				sm: ['0.875rem', '1.5rem'],
				base: ['1rem', '1.75rem'],
				lg: ['1.125rem', '1.75rem'],
				xl: ['1.25rem', '1.9rem'],
				'2xl': ['1.5rem', '2.2rem'],
				'3xl': ['1.875rem', '2.4rem'],
			},
		},
	},
	plugins: [],
}
