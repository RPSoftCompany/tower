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
					cookies.set(key, JSON.stringify(value), {
						expires: process.env.TTL ? `${process.env.TTL}s` : undefined,
						secure: document.location.protocol == 'https:',
						path: '/',
					});
				},
				removeItem: (key) => {
					if (cookies.has(key)) {
						cookies.remove(key);
					}
				},
			},
		})
	);

	return pinia;
});
