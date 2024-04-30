import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			scale: {
				210: '2.10',
				200: '2.00',
			},
			backgroundColor: {
				primary: '#23292e',
				secondary: '#434859',
				success: '#4f954d',
			},
			boxShadow: {
				'3xl': '10px 10px 12px 0px rgba(0,0,0,0.67)',
			},
			borderColor: {
				light: '#575d71',
				error: '#e36a6a',
			},
		},
	},
	plugins: [],
};
export default config;
