/*
 * Copyright RPSoft 2019,2023. All Rights Reserved.
 * This file is part of RPSoft Tower.
 *
 * Tower is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tower is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
 */

import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { TowerAxios } from 'boot/classes/TowerAxios';
import { userStore } from 'stores/user';
import { useQuasar } from 'quasar';

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
	const $q = useQuasar();

	towerAxios = new TowerAxios(axiosApi as AxiosInstance, userSt, router, $q);

	app.config.globalProperties.$axios = axios;
	// ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
	//       so you won't necessarily have to import axios in each vue file

	app.config.globalProperties.$api = towerAxios;
	// ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
	//       so you can easily perform requests against your app's API
});

export { towerAxios };
