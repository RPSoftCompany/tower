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
		<q-dialog v-model="dateDialog">
			<q-card class="tw-min-w-[20rem] tw-max-w-full">
				<q-card-section class="tw-bg-dark">
					<div class="text-h6">Choose configuration date</div>
				</q-card-section>

				<q-card-section class="tw-bg-darkPage tw-grid tw-grid-cols-2">
					<q-date
						v-model="dateToChoose"
						class="tw-mr-2"
						mask="YYYY-MM-DDTHH:mm:ss.SSSZ"
					/>
					<q-time
						v-model="dateToChoose"
						class="tw-ml-2"
						mask="YYYY-MM-DDTHH:mm:ss.SSSZ"
						with-seconds
					/>
				</q-card-section>

				<q-card-actions align="right" class="tw-bg-darkPage">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="secondary"
						flat
						label="Ok"
						@click="updateDate"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
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
					@click="addArchiveConfig()"
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
				>
					<template v-slot:header="config">
						<div
							class="tw-flex-grow tw-flex tw-justify-center tw-items-center tw-min-h-[3.5rem]"
						>
							<div>
								<div>
									{{ config.path }}
								</div>
								<div
									class="tw-text-accent tw-cursor-pointer tw-font-light tw-underline tw-text-xs"
									@click="showDateDialog(config)"
								>
									{{ config.effectiveDate.toLocaleString() }}
								</div>
							</div>
							<div class="tw-self-center tw-flex tw-ml-3">
								<q-separator inset size="md" vertical />
								<q-btn flat padding="0.25rem">
									<q-icon
										name="sym_o_close"
										size="sm"
										@click="removeConfiguration(config.id)"
									></q-icon>
								</q-btn>
							</div>
						</div>
					</template>
				</compare-table>
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
import { ArchiveConfig, SwitchPlacesEvent } from 'components/basic/basics';
import { date, useQuasar } from 'quasar';

//====================================================
// Const
//====================================================
const baseSt = basesStore();
const $q = useQuasar();

//====================================================
// Data
//====================================================
const currentBaseModels: Ref<Array<ConfigurationModel>> = ref([]);

const archiveConfigs: Ref<Array<ArchiveConfig>> = ref([]);

const filter = ref('');
const showDiff = ref(true);

const dateDialog = ref(false);
const dateToChoose = ref('');
const configId = ref(0.1);

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
const addArchiveConfig = async (date?: Date, place?: number) => {
	if (allBases.value.length !== Object.keys(baseModelComputed.value).length) {
		return;
	}

	const filter: any = {
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

	if (place === undefined) {
		archiveConfigs.value.push({
			id: Math.random(),
			loading: true,
			path: pathArray.join(' / ')
		});
	} else {
		archiveConfigs.value[place].loading = true;
	}

	place = place ? place : archiveConfigs.value.length - 1;

	date = date ? date : new Date();

	const response = await towerAxios.get(
		`configurations/findByDate?filter=${JSON.stringify(
			filter.where,
			null,
			''
		)}&date=${date.toISOString()}`
	);

	if (response.status === 200 && response.data.effectiveDate) {
		archiveConfigs.value[place].configuration = [response.data];
		archiveConfigs.value[place].version = 0;
		archiveConfigs.value[place].effectiveDate = date;
	} else {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: "Configuration didn't exist at that time"
		});
	}

	archiveConfigs.value[place].loading = false;
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

/**
 * showDateDialog
 */
const showDateDialog = (config: ArchiveConfig) => {
	const tempDate = config.effectiveDate ? config.effectiveDate : new Date();

	dateToChoose.value = date.formatDate(tempDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ');

	configId.value = config.id;
	dateDialog.value = true;
};

/**
 * updateDate
 */
const updateDate = () => {
	const index = archiveConfigs.value.findIndex(el => {
		return el.id === configId.value;
	});

	if (index >= 0) {
		addArchiveConfig(new Date(dateToChoose.value), index);
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
		if (el.configuration && el.configuration[0].variables) {
			el.configuration[0].variables.forEach(variable => {
				all.add(variable.name);
			});
		}
	});

	return Array.from(all);
});
</script>

<style scoped></style>
