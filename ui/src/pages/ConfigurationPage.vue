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
	<div class="tw-h-full tw-max-h-full tw-flex tw-flex-col">
		<div>
			<base-toolbar @update:baseModels="onBaseModelChange" />
			<transition
				enter-active-class="animated fadeIn"
				leave-active-class="animated fadeOut"
			>
				<search-toolbar
					v-if="!isCurrentBaseModelEmpty && currentBaseModel"
					v-model:filter="filter"
					v-model:showDiff="showDiff"
					:exportEnabled="exportEnabled"
					:importEnabled="importEnabled"
					:title="
						basesCount !== Object.keys(baseModelComputed).length
							? 'Constant variables'
							: 'Configuration'
					"
					class="tw-mt-3"
					@exportClicked="exportConfiguration"
					@importClicked="importConfiguration"
				>
					<template #beforeImport>
						<q-btn
							v-if="
								promotionCandidates.length > 0 &&
								basesCount !== Object.keys(baseModelComputed).length &&
								currentBaseModel
							"
							color="transparent"
							flat
							icon="sym_o_stairs"
							padding="sm"
							text-color="secondary"
							@click="showPromotionCandidatesDialog"
						>
							<q-tooltip>Promotion candidates</q-tooltip>
						</q-btn>
					</template>
				</search-toolbar>
			</transition>
		</div>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<div
				v-if="!isCurrentBaseModelEmpty"
				class="tw-mt-3 tw-flex tw-flex-col tw-grow tw-overflow-auto"
			>
				<constant-variable-panel
					v-if="
						basesCount !== Object.keys(baseModelComputed).length &&
						currentBaseModel
					"
					ref="constVariablePanel"
					:config-model="currentBaseModels"
					:filter="filter"
					:showDiff="showDiff"
				/>
				<configuration-panel
					v-else-if="currentBaseModel"
					ref="configurationPanel"
					:config-model="currentBaseModels"
					:filter="filter"
					:showDiff="showDiff"
					@update:promotion-candidates="setPromotionCandidates"
				></configuration-panel>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import BaseToolbar from 'components/bases/baseToolbar.vue';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { computed, Ref, ref } from 'vue';
import SearchToolbar from 'components/configuration/searchToolbar.vue';
import ConstantVariablePanel from 'components/constantVariables/constantVariablePanel.vue';
import ConfigurationPanel from 'components/configuration/configurationPanel.vue';
import fileDownload from 'js-file-download';
import { Import } from 'components/models';
import { Configuration } from 'components/configuration/configuration';
import { basesStore } from 'stores/bases';

//====================================================
// Data
//====================================================
const currentBaseModels: Ref<Array<ConfigurationModel>> = ref([]);
const filter: Ref<string | null> = ref('');
const constVariablePanel: Ref<typeof ConstantVariablePanel | null> = ref(null);
const configurationPanel: Ref<typeof ConfigurationPanel | null> = ref(null);
const showDiff = ref(true);

const promotionCandidates: Ref<Array<Configuration>> = ref([]);

const baseSt = basesStore();
//====================================================
// Methods
//====================================================
/**
 * A function that is triggered when the base model changes.
 * It updates the current base models with the provided value.
 *
 * @param {Array<ConfigurationModel>} value - The new array of base models to update.
 */
const onBaseModelChange = (value: Array<ConfigurationModel>) => {
	currentBaseModels.value = [...value];
};

/**
 * Exports configuration data as a JSON file.
 *
 * This function collects configuration data from one of the available panels
 * (`constVariablePanel` or `configurationPanel`) and processes the data for download.
 * The filename is dynamically generated based on the selected configuration panel
 * and additional values from `baseModelComputed`. If the filename exceeds 123
 * characters, it is truncated to 122 characters and appended with `.json`.
 *
 * Preconditions:
 * - At least one of `constVariablePanel.value` or `configurationPanel.value` must be defined and have a valid `exportConfiguration` method.
 * - The `baseModelComputed.value` should contain an object with enumerable properties to append to the filename.
 *
 * Postconditions:
 * - A file download is triggered for the generated configuration data with the constructed filename.
 *
 * Behavior:
 * - If `constVariablePanel.value` exists, its exported data is used, and the base filename is set to `constVariables`.
 * - If only `configurationPanel.value` exists, its exported data is used, and the base filename is set to `configuration`.
 * - Additional identifiers from `baseModelComputed.value` are appended to the filename.
 * - The file is downloaded only if data is successfully retrieved.
 */
const exportConfiguration = () => {
	let data = null;
	let filename = '';

	if (constVariablePanel.value) {
		filename = 'constVariables';
		data = constVariablePanel.value.exportConfiguration();
	} else if (configurationPanel.value) {
		filename = 'configuration';
		data = configurationPanel.value.exportConfiguration();
	}

	if (data) {
		Object.values(baseModelComputed.value).forEach((el) => {
			filename += `-${el}`;
		});

		if (filename.length >= 123) {
			filename = filename.substring(0, 122);
		}

		filename = `${filename}.json`;

		fileDownload(data, filename);
	}
};

/**
 * Handles the import configuration for a given import detail.
 *
 * This function checks for the existence of `constVariablePanel.value` or `configurationPanel.value`
 * and initiates their respective `importConfiguration` method with the provided `importDetails` parameter.
 *
 * @function
 * @param {Import} importDetails - The import details used to configure the import process.
 */
const importConfiguration = (importDetails: Import) => {
	if (constVariablePanel.value) {
		constVariablePanel.value.importConfiguration(importDetails);
	} else if (configurationPanel.value) {
		configurationPanel.value.importConfiguration(importDetails);
	}
};

/**
 * Displays the promotion candidates dialog if the `configurationPanel` object has a valid value.
 * This function checks whether the `configurationPanel` is defined and invokes the
 * `showPromotionCandidatesDialog` method on its `value` property, if available.
 */
const showPromotionCandidatesDialog = () => {
	if (configurationPanel.value) {
		configurationPanel.value.showPromotionCandidatesDialog();
	}
};

/**
 * Sets the list of promotion candidates.
 *
 * This function updates the `promotionCandidates` with the provided array of `Configuration` objects.
 *
 * @param {Array<Configuration>} value - The array of `Configuration` objects to set as promotion candidates.
 */
const setPromotionCandidates = (value: Array<Configuration>) => {
	promotionCandidates.value = value;
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

	currentBaseModels.value.forEach((el) => {
		if (el?.base) {
			baseModel[el.base] = el.name;
		}
	});

	return baseModel;
});

/**
 * basesCount
 */
const basesCount = computed(() => {
	if (currentBaseModels.value[0]) {
		const baseModel = currentBaseModels.value[0] as ConfigurationModel;
		if (baseModel.options.templateEnabled) {
			const all: Array<Base> = [];
			for (let i = 0; i < baseSt.getBases.length; i++) {
				if (baseModel.template && baseModel.template[i]) {
					all.push(baseSt.getBases[i]);
				}
			}

			return all.length;
		}
	}

	return baseSt.getBases.length;
});

/**
 * isCurrentBaseModelEmpty
 */
const isCurrentBaseModelEmpty = computed(() => {
	if (!currentBaseModels.value || currentBaseModels.value.length === 0) {
		return true;
	} else {
		let exists = false;
		currentBaseModels.value.forEach((el) => {
			if (el && el.name !== '__NONE__') {
				exists = true;
			}
		});
		return !exists;
	}
});

/**
 * currentBaseModel
 */
const currentBaseModel = computed(() => {
	if (isCurrentBaseModelEmpty.value) {
		return null;
	} else {
		let last: ConfigurationModel | null = null;
		for (const model of currentBaseModels.value) {
			if (model) {
				last = model;
			} else {
				break;
			}
		}

		if (last && last.name === '__NONE__') {
			return null;
		}

		return last;
	}
});

/**
 * importEnabled
 */
const exportEnabled = computed(() => {
	if (constVariablePanel.value) {
		return constVariablePanel.value.importEnabled;
	} else if (configurationPanel.value) {
		return configurationPanel.value.importEnabled;
	} else {
		return false;
	}
});

/**
 * exportEnabled
 */
const importEnabled = computed(() => {
	if (constVariablePanel.value) {
		return constVariablePanel.value.userCanModify;
	} else if (configurationPanel.value) {
		return configurationPanel.value.userCanModify;
	} else {
		return false;
	}
});
</script>

<style scoped></style>
