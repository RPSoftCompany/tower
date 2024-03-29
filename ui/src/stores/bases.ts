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
import { TowerAxios } from 'boot/classes/TowerAxios';
import { Base } from 'components/bases/base';

export const basesStore = defineStore('tower_bases', {
	state: () => ({
		bases: [] as Array<Base>,
	}),
	getters: {
		getBases: (state) => state.bases,
	},
	actions: {
		reset() {
			this.$reset();
		},
		async requestBases(axios: TowerAxios) {
			let response = null;
			try {
				const filter = {
					order: 'sequenceNumber',
				};

				response = await axios.get(
					`baseConfigurations?filter=${JSON.stringify(filter, null, '')}`
				);
				if (response.status === 200) {
					this.bases = response.data;
				}
			} catch (e) {
				throw e;
			}
		},
	},
});
