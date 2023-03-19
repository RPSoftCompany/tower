<!--
  - Copyright RPSoft 2019,2023. All Rights Reserved.
  - This file is part of RPSoft Tower.
  -
  - Tower is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation; either version 3 of the License, or
  - (at your option) any later version.
  -
  - Tower is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
  -->

<template>
	<div>
		<div class="tw-flex tw-items-center">
			<base-toolbar
				class="tw-flex-grow"
				@update:baseModels="onBaseModelChange"
			/>
			<div>
				<q-btn
					:disable="
						allBases.length !== Object.keys(baseModelComputed).length ||
							archiveConfigs.length > 3
					"
					flat
					icon="sym_o_add"
					@click="addArchiveConfig"
				></q-btn>
			</div>
		</div>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<search-toolbar
				v-if="archiveConfigs.length > 0"
				v-model:filter="filter"
				v-model:showDiff="showDiff"
				:export-enabled="false"
				:import-enabled="false"
				class="tw-mt-3"
				title="Archive"
			></search-toolbar>
		</transition>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<div v-if="archiveConfigs.length > 0" class="tw-mt-3">
				<compare-table
					:configs="archiveConfigs"
					:filter="filter"
					:showDiff="showDiff"
					:variables="currentVariables"
					@removeConfiguration="removeConfiguration"
					@switchPlaces="switchPlaces"
					@versionChanged="versionChanged"
				></compare-table>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import BaseToolbar from 'components/bases/baseToolbar.vue';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { computed, Ref, ref } from 'vue';
import { basesStore } from 'stores/bases';
import SearchToolbar from 'components/configuration/searchToolbar.vue';
import { towerAxios } from 'boot/axios';
import CompareTable from 'components/basic/compareTable.vue';
import {
	ArchiveConfig,
	SwitchPlacesEvent,
	VersionChangeEvent
} from 'components/basic/basics';

//====================================================
// Const
//====================================================
const baseSt = basesStore();

//====================================================
// Data
//====================================================
const currentBaseModels: Ref<Array<ConfigurationModel>> = ref([]);

const archiveConfigs: Ref<Array<ArchiveConfig>> = ref([]);

const filter = ref('');
const showDiff = ref(true);

//====================================================
// Methods
//====================================================
/**
 * onBaseModelChange
 * @param value
 */
const onBaseModelChange = (value: Array<ConfigurationModel>) => {
	currentBaseModels.value = value;
};

/**
 * addArchiveConfig
 */
const addArchiveConfig = async () => {
	if (allBases.value.length !== Object.keys(baseModelComputed.value).length) {
		return;
	}

	const filter: any = {
		order: 'effectiveDate DESC',
		include: ['member'],
		where: {}
	};

	allBases.value.forEach(el => {
		filter.where[el.name] = { $eq: null };
	});

	let pathArray: Array<string> = [];

	currentBaseModels.value.forEach(el => {
		if (el && el.name !== '__NONE__') {
			filter.where[el.base] = el.name;
			pathArray.push(el.name);
		}
	});

	archiveConfigs.value.push({
		id: Math.random(),
		loading: true,
		path: pathArray.join(' / ')
	});

	const place = archiveConfigs.value.length - 1;

	const response = await towerAxios.get(
		`configurations?filter=${JSON.stringify(filter, null, '')}`
	);

	if (response.status === 200 && response.data.length > 0) {
		archiveConfigs.value[place].configuration = response.data.reverse();
		archiveConfigs.value[place].version = response.data.length - 1;
		archiveConfigs.value[place].loading = false;
	}
};

/**
 * removeConfiguration
 */
const removeConfiguration = (configId: number) => {
	archiveConfigs.value = archiveConfigs.value.filter(el => {
		return el.id !== configId;
	});
};

/**
 * versionChanged
 * @param data
 */
const versionChanged = (data: VersionChangeEvent) => {
	const configIndex = archiveConfigs.value.findIndex(el => {
		return el.id === data.configId;
	});

	if (configIndex >= 0) {
		archiveConfigs.value[configIndex].version = data.version;
	}
};

/**
 * switchPlaces
 * @param data
 */
const switchPlaces = (data: SwitchPlacesEvent) => {
	const sourceConfig = archiveConfigs.value.find(el => {
		return `${el.id}` === data.sourceId;
	});

	if (sourceConfig) {
		const targetIndex = archiveConfigs.value.findIndex(el => {
			return `${el.id}` === data.targetId;
		});

		if (targetIndex >= 0) {
			archiveConfigs.value = archiveConfigs.value.filter(el => {
				return `${el.id}` !== data.sourceId;
			});

			archiveConfigs.value.splice(targetIndex, 0, sourceConfig);
		}
	}
};
//====================================================
// Computed
//====================================================
/**
 * baseModelComputed
 */
const baseModelComputed = computed(() => {
	if (!currentBaseModels.value) {
		return {};
	}

	const baseModel: any = {};

	currentBaseModels.value.forEach(el => {
		if (el?.base) {
			baseModel[el.base] = el.name;
		}
	});

	return baseModel;
});
/**
 * allBases
 */
const allBases = computed(() => baseSt.getBases);

/**
 * currentVariables
 */
const currentVariables = computed(() => {
	const all = new Set();
	archiveConfigs.value.forEach(el => {
		if (el.version && el.configuration && el.configuration[el.version]) {
			el.configuration[el.version].variables.forEach(variable => {
				all.add(variable.name);
			});
		}
	});

	return Array.from(all);
});
</script>

<style scoped></style>
