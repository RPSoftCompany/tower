/** @type {import('tailwindcss').Config} */
module.exports = {
	prefix: 'tw-',
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				positive: '#21BA45',
				negative: {
					DEFAULT: '#BA2222',
					50: 'rgba(186, 34, 34, 0.05)',
					100: 'rgba(186, 34, 34, 0.1)',
					200: 'rgba(186, 34, 34, 0.2)',
					300: 'rgba(186, 34, 34, 0.3)',
					400: 'rgba(186, 34, 34, 0.4)',
					500: 'rgba(186, 34, 34, 0.5)',
					600: 'rgba(186, 34, 34, 0.6)',
					700: 'rgba(186, 34, 34, 0.7)',
					800: 'rgba(186, 34, 34, 0.8)',
					900: 'rgba(186, 34, 34, 0.9)',
				},

				disabled: '#ffffffb3',
				warning: '#F2C037',
			},
		},
	},
	plugins: [],
};
