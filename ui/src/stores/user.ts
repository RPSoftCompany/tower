import {defineStore} from 'pinia';

export const userStore = defineStore('tower_user', {
	state: () => ({
		tokenId: '',
		name: '',
		LDAPUser: false,
		roles: [] as Array<string>
	}),
	getters: {
		getUsername: state => state.name,
		getTokenId: state => state.tokenId,
		getRoles: state => state.roles,
		hasAdminRights: state => {
			return state.name === 'admin' || state.roles.includes('admin');
		},
		isLdapUser: state => {
			return state.LDAPUser
		}
	},
	actions: {
		setUserDetails(tokenId: string, name: string, roles: string[], isLdapUser: boolean) {
			this.tokenId = tokenId;
			this.name = name;
			this.roles = roles;
			this.LDAPUser = isLdapUser;
		},
		logout() {
			this.$reset();
		}
	},
	persist: true
});
