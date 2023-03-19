import { defineStore } from 'pinia';
import { TowerAxios } from 'boot/classes/TowerAxios';

export const navigationStore = defineStore('tower_navigation', {
	state: () => ({
		canNavigate: true,
		destination: '',
		showDialog: false,
		initialized: false,
	}),
	getters: {
		getCanNavigate: (state) => state.canNavigate,
		getShowDialog: (state) => state.showDialog,
		getDestination: (state) => state.destination,
	},
	actions: {
		preventNavigation() {
			this.canNavigate = false;
		},
		allowNavigation() {
			this.canNavigate = true;
		},
		setDestination(destination: string) {
			this.destination = destination;
		},
		showNavigationDialog() {
			this.showDialog = true;
		},
		closeNavigationDialog() {
			this.showDialog = false;
		},
		async getInitialization(axios: TowerAxios) {
			let response = null;
			try {
				response = await axios.get('configurations/initialized');
				if (response.status === 200) {
					this.initialized = response.data;
				}
			} catch (e) {
				console.error(e);
			}
		},
		setInitialized(initialized: boolean) {
			this.initialized = initialized;
		},
	},
});
