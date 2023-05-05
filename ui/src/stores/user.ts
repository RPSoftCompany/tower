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

export const userStore = defineStore('tower_user', {
	state: () => ({
		tokenId: '',
		name: '',
		LDAPUser: false,
		roles: [] as Array<string>,
	}),
	getters: {
		getUsername: (state) => state.name,
		getTokenId: (state) => state.tokenId,
		getRoles: (state) => state.roles,
		hasAdminRights: (state) => {
			return state.name === 'admin' || state.roles.includes('admin');
		},
		isLdapUser: (state) => {
			return state.LDAPUser;
		},
	},
	actions: {
		setUserDetails(
			tokenId: string,
			name: string,
			roles: string[],
			isLdapUser: boolean
		) {
			this.tokenId = tokenId;
			this.name = name;
			this.roles = roles;
			this.LDAPUser = isLdapUser;
		},
		logout() {
			this.$reset();
		},
	},
});
