/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { defineConfig } from '#q-app/wrappers';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(async (ctx) => {
	const pluginRewriteAll = await import('vite-plugin-rewrite-all');

	return {
		eslint: {
			// fix: true,
			// include = [],
			// exclude = [],
			// rawOptions = {},
			warnings: true,
			errors: true,
		},

		// https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
		// preFetch: true,

		// app boot file (/src/boot)
		// --> boot files are part of "main.js"
		// https://v2.quasar.dev/quasar-cli-vite/boot-files
		boot: ['axios'],

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
		css: ['app.scss'],

		// https://github.com/quasarframework/quasar/tree/dev/extras
		extras: [
			// 'ionicons-v4',
			// 'mdi-v5',
			// 'fontawesome-v6',
			// 'eva-icons',
			// 'themify',
			// 'line-awesome',
			// 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

			'roboto-font', // optional, you are not bound to it
			'material-symbols-outlined',
			'mdi-v7',
			// 'material-icons', // optional, you are not bound to it
			// 'ionicons-v6'
		],

		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
		build: {
			target: {
				browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
				node: 'node22',
			},

			typescript: {
				strict: true, // (recommended) enables strict settings for TypeScript
				vueShim: true, // required when using ESLint with type-checked rules, will generate a shim file for `*.vue` files
				extendTsConfig(tsConfig) {
					// You can use this hook to extend tsConfig dynamically
					// For basic use cases, you can still update the usual tsconfig.json file to override some settings
				},
			},

			vueRouterMode: 'history', // available values: 'hash', 'history'
			// vueRouterBase,
			// vueDevtools,
			// vueOptionsAPI: false,

			// rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

			publicPath: '/',
			// analyze: true,
			// env: {},
			// rawDefine: {}
			// ignorePublicFolder: true,
			minify: true,
			// polyfillModulePreload: true,
			// distDir

			// extendViteConf (viteConf) {},
			// viteVuePluginOptions: {},

			vitePlugins: [
				[pluginRewriteAll.default(), {}],
				[tailwindcss, { config: './tailwind.config.js' }],
			],
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
		devServer: {
			// https: true
			open: true, // opens browser window automatically
		},

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
		framework: {
			config: {
				dark: false,
			},

			iconSet: 'svg-material-symbols-outlined', // Quasar icon set
			// lang: 'en-US', // Quasar language pack

			// For special cases outside of where the auto-import strategy can have an impact
			// (like functional components as one of the examples),
			// you can manually specify Quasar components/directives to be available everywhere:
			//
			// components: [],
			// directives: [],

			// Quasar plugins
			plugins: ['Notify', 'Cookies', 'LocalStorage'],
		},

		animations: 'all', // --- includes all animations
		// https://v2.quasar.dev/options/animations
		// animations: [],

		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
		// sourceFiles: {
		//   rootComponent: 'src/App.vue',
		//   router: 'src/router/index',
		//   store: 'src/store/index',
		//   registerServiceWorker: 'src-pwa/register-service-worker',
		//   serviceWorker: 'src-pwa/custom-service-worker',
		//   pwaManifestFile: 'src-pwa/manifest.json',
		//   electronMain: 'src-electron/electron-main',
		//   electronPreload: 'src-electron/electron-preload'
		// },

		// https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
		ssr: {
			// ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
			// will mess up SSR

			// extendSSRWebserverConf (esbuildConf) {},
			// extendPackageJson (json) {},

			pwa: false,

			maxAge: 1000 * 60 * 60 * 24,

			manualStoreHydration: false,
			manualPostHydrationTrigger: false,

			prodPort: 3000, // The default port that the production server should use
			// (gets superseded if process.env.PORT is specified at runtime)

			middlewares: [
				'render', // keep this as last one
			],
		},

		// https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
		pwa: {
			workboxMode: 'generateSW', // or 'injectManifest'
			injectPwaMetaTags: true,
			swFilename: 'sw.js',
			manifestFilename: 'manifest.json',
			useCredentialsForManifestTag: false,
			// useFilenameHashes: true,
			// extendGenerateSWOptions (cfg) {}
			// extendInjectManifestOptions (cfg) {},
			// extendManifestJson (json) {}
			// extendPWACustomSWConf (esbuildConf) {}
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
		cordova: {
			// noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
		capacitor: {
			hideSplashscreen: true,
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
		electron: {
			// extendElectronMainConf (esbuildConf)
			// extendElectronPreloadConf (esbuildConf)

			inspectPort: 5858,

			bundler: 'packager', // 'packager' or 'builder'

			packager: {
				// https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
				// OS X / Mac App Store
				// appBundleId: '',
				// appCategoryType: '',
				// osxSign: '',
				// protocol: 'myapp://path',
				// Windows only
				// win32metadata: { ... }
			},

			builder: {
				// https://www.electron.build/configuration/configuration

				appId: 'tower-ui',
			},
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
		bex: {
			contentScripts: ['my-content-script'],

			// extendBexScriptsConf (esbuildConf) {}
			// extendBexManifestJson (json) {}
		},
	};
});
