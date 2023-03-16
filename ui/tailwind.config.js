/** @type {import('tailwindcss').Config} */
module.exports = {
	prefix: 'tw-',
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#1A1E21',
				secondary: '#E5E1DE',
				accent: '#F2A52A',

				dark: '#272E32',
				darkPage: '#1A1E21',

				positive: '#21BA45',
				negative: '#ba2222'
			}
		}
	},
	plugins: []
};
