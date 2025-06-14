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
	<div class="tw-flex tw-flex-col tw-justify-between tw-h-full tw-max-h-full">
		<div class="tw-flex tw-items-center">
			<base-toolbar
				class="tw-flex-grow"
				@update:baseModels="onBaseModelChange"
			/>
			<div>
				<q-btn
					:disable="
						basesCount !== Object.keys(baseModelComputed).length ||
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
			<div
				v-if="archiveConfigs.length > 0"
				class="tw-mt-3 tw-flex-1 tw-max-h-full tw-overflow-auto"
			>
				<compare-table
					:configs="archiveConfigs"
					:filter="filter"
					:showDiff="showDiff"
					:variables="currentVariables as string[]"
					@removeConfiguration="removeConfiguration"
					@switchPlaces="switchPlaces"
					@versionChanged="versionChanged"
				></compare-table>
			</div>
			<div v-else class="tw-h-full tw-flex-1 tw-flex tw-justify-center">
				<div
					class="tw-self-center tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400"
				>
					<div>
						Select configuration bases above and click the '+' button to view
						archive history and compare different versions
						<div class="tw-text-center tw-text-xs tw-text-gray-500">
							Tip: You can add up to four different configurations at the same
							time
						</div>
					</div>
				</div>
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
	VersionChangeEvent,
} from 'components/basic/basics';
import { valueExists } from 'components/constantVariables/constantVariable';
import { useQuasar } from 'quasar';
import { Configuration } from 'components/configuration/configuration';
import { Base } from 'components/bases/base';

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

//====================================================
// Methods
//====================================================
/**
 * A callback function that is triggered when the base model changes.
 *
 * @param {Array<ConfigurationModel>} value - The new array of configuration models.
 */
const onBaseModelChange = (value: Array<ConfigurationModel>) => {
	currentBaseModels.value = value;
};

/**
 * Adds a new archive configuration to the `archiveConfigs` array.
 * The function checks if the number of bases matches the currently computed base model count.
 * If it does, it constructs a filter and retrieves configurations from the server. The retrieved configurations
 * are then processed and added to the archive. If an error occurs during the process, or if the configuration does not exist,
 * an error notification is displayed, and the configuration is removed from the array.
 *
 * The function performs the following steps:
 * - Verifies if the `basesCount` matches the length of `baseModelComputed`.
 * - Constructs a filter object for fetching configuration data.
 * - Iterates over `allBases` and `currentBaseModels` to update filter conditions and create a path string.
 * - Adds a loading configuration object to `archiveConfigs` with an ID, path, and loading status.
 * - Fetches configuration data from the server using `towerAxios`.
 * - Processes the response data and updates the corresponding configuration in `archiveConfigs`.
 * - Displays error notifications and cleans up data if the process fails or no configuration exists.
 *
 * The function does not return any value.
 */
const addArchiveConfig = async () => {
	if (basesCount.value !== Object.keys(baseModelComputed.value).length) {
		return;
	}

	const rowsLimit = 20;

	const filter: any = {
		order: 'version DESC',
		include: ['member'],
		where: {},
		limit: rowsLimit,
	};

	allBases.value.forEach((el) => {
		filter.where[el.name] = { $eq: null };
	});

	let pathArray: Array<string> = [];

	currentBaseModels.value.forEach((el) => {
		if (el && el.name !== '__NONE__') {
			filter.where[el.base] = el.name;
			pathArray.push(el.name);
		}
	});

	archiveConfigs.value.push({
		id: Math.random().toString(),
		loading: true,
		path: pathArray.join(' / '),
	});

	const place = archiveConfigs.value.length - 1;

	try {
		const response = await towerAxios.get(
			`configurations?filter=${JSON.stringify(filter, null, '')}`,
		);

		if (response.status === 200 && response.data.length > 0) {
			const length = response.data.length;
			const reverse = response.data.reverse();
			const version = reverse[length - 1].version;
			let config = reverse;

			if (version > rowsLimit) {
				config = [
					...[...Array(version - rowsLimit).keys()].map(() => {
						return {} as Configuration;
					}),
					...reverse,
				];
			}

			if (archiveConfigs.value[place]) {
				archiveConfigs.value[place].configuration = config;
				archiveConfigs.value[place].version = version - 1;
				archiveConfigs.value[place].loading = false;
				archiveConfigs.value[place].comment =
					response.data[response.data.length - 1].comment;
			}
		} else {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: "Configuration doesn't exist",
			});

			archiveConfigs.value.splice(place, 1);
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting configuration data',
		});

		archiveConfigs.value.splice(place, 1);
	}
};

/**
 * Removes a configuration from the archive based on the provided configuration ID.
 *
 * This function filters the `archiveConfigs` array by removing the entry
 * that matches the given configuration ID. The `configId` is converted to
 * a string before comparison to ensure type consistency during the filtering process.
 *
 * @param {number} configId - The unique identifier of the configuration to remove.
 */
const removeConfiguration = (configId: number) => {
	archiveConfigs.value = archiveConfigs.value.filter((el) => {
		return el.id !== configId.toString();
	});
};

/**
 * Handles the version change for archive configurations.
 *
 * Updates the corresponding archive configuration when a version change occurs.
 * Ensures that the configuration version and comment are updated if the new version is valid.
 * If the effective date for the new version is unavailable, additional configuration data is fetched,
 * and the configuration is updated based on the fetched data.
 * Provides user notifications if configuration data is missing or fetching data fails.
 *
 * @param {VersionChangeEvent} data - The event data containing details about the version change,
 * including the configId, version, and any additional comments.
 */
const versionChanged = async (data: VersionChangeEvent) => {
	const configIndex = archiveConfigs.value.findIndex((el) => {
		return el.id === data.configId.toString();
	});

	if (configIndex >= 0) {
		const config = archiveConfigs.value[configIndex]?.configuration;
		if (config && config[data.version]?.effectiveDate) {
			if (archiveConfigs.value[configIndex]) {
				archiveConfigs.value[configIndex].version = data.version;
				archiveConfigs.value[configIndex].comment = data.comment;
			}
		} else if (archiveConfigs.value[configIndex]) {
			archiveConfigs.value[configIndex].loading = true;

			const filter: any = {
				include: ['member'],
				where: {
					version: data.version + 1,
				},
			};

			allBases.value.forEach((el) => {
				filter.where[el.name] = { $eq: null };
			});

			currentBaseModels.value.forEach((el) => {
				if (el && el.name !== '__NONE__') {
					filter.where[el.base] = el.name;
				}
			});

			try {
				const response = await towerAxios.get(
					`configurations?filter=${JSON.stringify(filter, null, '')}`,
				);

				if (response.status === 200 && response.data.length > 0) {
					if (archiveConfigs.value[configIndex].configuration !== undefined) {
						archiveConfigs.value[configIndex].configuration[data.version] =
							response.data[0];
					}
					archiveConfigs.value[configIndex].version = data.version;
					archiveConfigs.value[configIndex].loading = false;
					archiveConfigs.value[configIndex].comment = response.data[0].comment;
				} else {
					$q.notify({
						color: 'negative',
						position: 'top',
						textColor: 'secondary',
						icon: 'sym_o_error',
						message: "Configuration doesn't exist",
					});
				}
			} catch (e) {
				$q.notify({
					color: 'negative',
					position: 'top',
					textColor: 'secondary',
					icon: 'sym_o_error',
					message: 'Error collecting configuration data',
				});
			}
		}
	}
};

/**
 * Function to switch the positions of configurations in the `archiveConfigs` array
 * based on the source and target IDs provided in the `SwitchPlacesEvent`.
 *
 * @param {SwitchPlacesEvent} data - An object containing the source ID and target ID
 *                                    used to identify the configurations to be moved
 *                                    and rearranged in the `archiveConfigs` array.
 *
 * Description:
 * - Finds the configuration corresponding to the `sourceId` in the `archiveConfigs` array.
 * - If found, removes the configuration from its current position.
 * - Finds the index of the configuration corresponding to the `targetId`.
 * - Inserts the removed configuration at the position corresponding to the `targetId`.
 */
const switchPlaces = (data: SwitchPlacesEvent) => {
	const sourceConfig = archiveConfigs.value.find((el) => {
		return `${el.id}` === data.sourceId;
	});

	if (sourceConfig) {
		const targetIndex = archiveConfigs.value.findIndex((el) => {
			return `${el.id}` === data.targetId;
		});

		if (targetIndex >= 0) {
			archiveConfigs.value = archiveConfigs.value.filter((el) => {
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
 * A computed property that generates an object mapping base model identifiers to their corresponding names.
 *
 * The property observes the `currentBaseModels` value and responds reactively to changes. It iterates over the
 * `currentBaseModels` collection, and for each item with a defined `base` property, it adds an entry to the
 * resulting object where the `base` value acts as the key and the `name` value acts as the value.
 *
 * @constant {import('vue').ComputedRef<Object>} baseModelComputed
 *    A Vue computed reference representing the constructed base model mapping.
 *
 * Returns:
 * - An empty object if no `currentBaseModels` are available.
 * - A mapping object if `currentBaseModels` contains entries with valid `base` values.
 */
const baseModelComputed = computed(() => {
	if (!currentBaseModels.value) {
		return {};
	}

	const baseModel: any = {};

	currentBaseModels.value.forEach((el) => {
		if (el?.base) {
			baseModel[el.base] = el.name;
		}
	});

	return baseModel;
});

/**
 * A computed property representing the count of bases, optionally filtered by a template
 * if template support is enabled in the current base model. The count is dynamically
 * determined based on the current state of the application.
 *
 * This property performs the following logic:
 * - If the first base model in `currentBaseModels` exists and has `templateEnabled` set to `true`:
 *   - It filters the `baseSt.getBases` array based on the presence of corresponding templates
 *     defined in the current base model.
 *   - The count is then set to the length of the filtered array.
 * - Otherwise, the count simply reflects the total number of bases in `baseSt.getBases`.
 *
 * @type {number}
 */
const basesCount = computed(() => {
	if (currentBaseModels.value[0]) {
		const baseModel = currentBaseModels.value[0] as ConfigurationModel;
		if (baseModel.options.templateEnabled) {
			const all: Array<Base> = [];
			for (let i = 0; i < baseSt.getBases.length; i++) {
				if (baseModel.template && baseModel.template[i] && baseSt.getBases[i]) {
					all.push(baseSt.getBases[i] as Base);
				}
			}

			return all.length;
		}
	}

	return baseSt.getBases.length;
});

/**
 * A computed property that retrieves all bases using the `baseSt.getBases` function.
 * It dynamically computes and returns the updated list of bases whenever
 * the underlying state or dependencies change.
 *
 * @constant {ComputedRef<*>} allBases
 */
const allBases = computed(() => baseSt.getBases);

/**
 * A computed variable that generates a sorted array of unique variable names
 * extracted from the `archiveConfigs` data structure based on specific conditions.
 *
 * The `currentVariables` function iterates through the `archiveConfigs` array
 * and checks each configuration object for a valid `version`, and associated variables.
 * If the conditions are met, the variable names are collected into a `Set` to ensure uniqueness.
 * The unique names are then converted into an array and sorted alphabetically,
 * with case-insensitive comparison.
 *
 * This computed property dynamically updates whenever the `archiveConfigs` reactive
 * dependency changes.
 *
 * @type {import('vue').ComputedRef<string[]>}
 */
const currentVariables = computed(() => {
	const all = new Set();

	archiveConfigs.value.forEach((el) => {
		if (
			valueExists(el.version) &&
			el.configuration &&
			el.configuration[el.version as number] &&
			el.configuration[el.version as number]?.variables
		) {
			el.configuration[el.version as number]?.variables.forEach((variable) => {
				all.add(variable.name);
			});
		}
	});

	return Array.from(all).sort((a, b) =>
		(a as string).localeCompare(b as string, undefined, {
			sensitivity: 'base',
		}),
	);
});
</script>

<style scoped></style>
