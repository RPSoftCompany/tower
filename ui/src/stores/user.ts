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

import { defineStore } from 'pinia';
import { Cookies } from 'quasar';

export const userStore = defineStore('tower_user', {
	state: () => ({
		tokenId: '',
		name: '',
		nonLocalUser: false,
		roles: [] as Array<string>,
	}),
	getters: {
		getUsername: (state) => state.name,
		getTokenId: (state) => state.tokenId,
		getRoles: (state) => state.roles,
		hasAdminRights: (state) => {
			return state.name === 'admin' || state.roles.includes('admin');
		},
		isNonLocalUser: (state) => {
			return state.nonLocalUser;
		},
	},
	actions: {
		setUserDetails(
			tokenId: string,
			name: string,
			roles: string[],
			nonLocalUser: boolean,
		) {
			this.tokenId = tokenId;
			this.name = name;
			this.roles = roles;
			this.nonLocalUser = nonLocalUser;
		},
		logout() {
			this.$reset();
			if (Cookies.has('accessToken')) {
				Cookies.remove('accessToken');
			}
		},
	},
});
