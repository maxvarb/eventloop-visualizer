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
		},
	},
	plugins: [],
};
export default config;
