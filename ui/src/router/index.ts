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

import { route } from 'quasar/wrappers';
import {
	createMemoryHistory,
	createRouter,
	createWebHashHistory,
	createWebHistory,
} from 'vue-router';

import { userStore } from 'stores/user';

import routes from './routes';
import { basesStore } from 'stores/bases';
import { towerAxios } from 'boot/axios';
import { navigationStore } from 'stores/navigation';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
	const createHistory = process.env.SERVER
		? createMemoryHistory
		: process.env.VUE_ROUTER_MODE === 'history'
		? createWebHistory
		: createWebHashHistory;

	const Router = createRouter({
		scrollBehavior: () => ({ left: 0, top: 0 }),
		routes,

		// Leave this as is and make changes in quasar.conf.js instead!
		// quasar.conf.js -> build -> vueRouterMode
		// quasar.conf.js -> build -> publicPath
		history: createHistory(process.env.VUE_ROUTER_BASE),
	});

	Router.beforeEach(async (to) => {
		const navigationSt = navigationStore();

		if (to.name === 'Initialization') {
			return true;
		}

		if (navigationSt && !navigationSt.initialized) {
			await navigationSt.getInitialization(towerAxios);
			if (!navigationSt.initialized) {
				return { name: 'Initialization' };
			}
		}

		if (navigationSt && !navigationSt.getCanNavigate) {
			navigationSt.setDestination(to.path);
			navigationSt.showNavigationDialog();
			return false;
		}

		if (to.name === 'Login') {
			return true;
		}

		const store = userStore();
		if (to.meta.requiresAuth && !store.getTokenId) {
			return { name: 'Login' };
		}

		if (to.meta.adminPrivileges && !store.hasAdminRights) {
			return { name: 'Login' };
		}

		if (to.name === 'ChangePassword' && store.isLdapUser) {
			return { name: 'Login' };
		}

		const bases = basesStore();
		if (bases.getBases.length === 0) {
			await bases.requestBases(towerAxios);
		}

		if (!to.path || to.path === '/') {
			return { name: 'Configuration' };
		}

		return true;
	});

	return Router;
});
