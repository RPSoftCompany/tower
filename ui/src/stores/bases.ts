import { defineStore } from 'pinia';
import { TowerAxios } from 'boot/classes/TowerAxios';
import { Base } from 'components/bases/base';

export const basesStore = defineStore('tower_bases', {
	state: () => ({
		bases: [] as Array<Base>
	}),
	getters: {
		getBases: state => state.bases
	},
	actions: {
		async requestBases(axios: TowerAxios) {
			let response = null;
			try {
				const filter = {
					order: 'sequenceNumber'
				};

				response = await axios.get(
					`baseConfigurations?filter=${JSON.stringify(filter, null, '')}`
				);
				if (response.status === 200) {
					this.bases = response.data;
				}
			} catch (e) {
				console.error(e);
			}
		}
	}
});
