import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { TowerAxios } from 'boot/classes/TowerAxios';
import { userStore } from 'stores/user';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$axios: AxiosInstance;
	}
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

let axiosApi = {};
if (process.env.NODE_ENV === 'production') {
	axiosApi = axios.create({ baseURL: '/' });
} else {
	axiosApi = axios.create({ baseURL: 'http://localhost:3000/' });
}

let towerAxios: TowerAxios;

export default boot(({ app, router }) => {
	// for use inside Vue files (Options API) through this.$axios and this.$api

	const userSt = userStore();

	towerAxios = new TowerAxios(axiosApi as AxiosInstance, userSt, router);

	app.config.globalProperties.$axios = axios;
	// ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
	//       so you won't necessarily have to import axios in each vue file

	app.config.globalProperties.$api = towerAxios;
	// ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
	//       so you can easily perform requests against your app's API
});

export { towerAxios };
