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

import { store } from 'quasar/wrappers';
import { createPinia } from 'pinia';
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2';
import { Router } from 'vue-router';
import { Cookies } from 'quasar';

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module 'pinia' {
	export interface PiniaCustomProperties {
		readonly router: Router;
	}
}

const parseJwt = (token: string) => {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(
		window
			.atob(base64)
			.split('')
			.map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join(''),
	);

	return JSON.parse(jsonPayload);
};

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((ssrContext) => {
	const pinia = createPinia();

	const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies; // otherwise we're on client

	// You can add Pinia plugins here
	pinia.use(
		createPersistedStatePlugin({
			storage: {
				getItem: (key) => {
					const value = cookies.get(key);
					if (value) {
						return JSON.parse(value);
					}

					return null;
				},
				setItem: (key, value) => {
					if (key === 'tower_user') {
						let expires = undefined;
						try {
							const decoded = parseJwt(value);
							const date = new Date(0);
							date.setUTCSeconds(decoded.exp);
							expires = date;
						} catch (e) {
							// IGNORE
						}

						cookies.set(key, JSON.stringify(value), {
							expires: expires,
							secure: document.location.protocol == 'https:',
							sameSite: 'Strict',
							path: '/',
						});
					}
				},
				removeItem: (key) => {
					if (cookies.has(key)) {
						cookies.remove(key);
					}
				},
			},
		}),
	);

	return pinia;
});
