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
	<q-card
		class="tw-bg-darkPage tw-text-secondary tw-flex tw-items-start tw-flex-col tw-justify-between tw-pt-2 tw-rounded tw-grow tw-overflow-hidden tw-max-h-full"
		flat
	>
		<q-inner-loading :showing="loading">
			<q-spinner-clock color="secondary" size="3em" />
			<div class="tw-mt-3">Please wait, loading...</div>
		</q-inner-loading>
		<div
			v-if="
				(!constVariablesArchive || constVariablesArchive.length === 0) &&
				!constVariables?.variables &&
				!loading
			"
			class="tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				There aren't any constant variables in this configuration
				<div
					class="tw-text-center tw-text-xs tw-text-gray-500"
					v-if="userCanModify"
				>
					You can create one using the panel below
				</div>
			</div>
		</div>
		<div
			v-if="
				constVariablesArchive && constVariablesArchive.length > 0 && !loading
			"
			:class="{
				'tw-grid-cols-5': constVariablesArchive.length > 0,
				'tw-grid-cols-2': constVariablesArchive.length === 0,
			}"
			class="tw-grid tw-w-full tw-gap-3 tw-justify-items-stretch tw-text-sm tw-font-semibold tw-max-h-full"
		>
			<div class="tw-text-center tw-w-full">Name</div>
			<div
				v-if="constVariablesArchive.length > 0"
				class="tw-flex tw-col-span-2"
			>
				<q-btn
					:disable="version <= 0 || loading"
					class="tw-flex-none"
					flat
					icon="sym_o_first_page"
					padding="sm"
					@click="version = 0"
				>
					<q-tooltip :delay="400" v-if="version > 0"
						>Go to the first version
					</q-tooltip>
				</q-btn>
				<q-btn
					:disable="version <= 0 || loading"
					class="tw-flex-none"
					flat
					icon="sym_o_chevron_left"
					padding="sm"
					@click="version--"
				>
					<q-tooltip :delay="400" v-if="version > 0">
						Go to the {{ previousVersionAsOrdinal }} version
					</q-tooltip>
				</q-btn>
				<div class="tw-grow tw-flex tw-justify-center">
					<div class="tw-mr-3">
						<div>
							Version #{{ version + 1 }}, created
							{{ currentVersionDate }}
						</div>
						<div
							class="tw-text-center tw-text-gray-600 tw-font-light tw-text-xs"
						>
							created by
							<span class="tw-font-medium">{{ currentVersionAuthor }}</span>
						</div>
					</div>
					<div v-if="userCanModify" class="tw-flex tw-self-center">
						<q-separator inset vertical />
						<q-btn
							:disable="!differentThanShownVersion"
							flat
							icon="sym_o_undo"
							padding="sm"
							@click="fullRevert"
						>
							<q-tooltip v-if="differentThanShownVersion" :delay="400"
								>Revert to this version
							</q-tooltip>
						</q-btn>
					</div>
				</div>
				<q-btn
					:disable="version >= constVariablesArchive.length - 1 || loading"
					class="tw-flex-none"
					flat
					icon="sym_o_chevron_right"
					padding="sm"
					@click="version++"
				>
					<q-tooltip
						:delay="400"
						v-if="version !== constVariablesArchive.length - 1"
						>Go to the {{ nextVersionAsOrdinal }} version
					</q-tooltip>
				</q-btn>
				<q-btn
					:disable="version >= constVariablesArchive.length - 1"
					flat
					icon="sym_o_last_page"
					padding="sm"
					@click="version = constVariablesArchive.length - 1"
				>
					<q-tooltip
						:delay="400"
						v-if="version !== constVariablesArchive.length - 1"
						>Go to the current version
					</q-tooltip>
				</q-btn>
			</div>
			<div
				:class="{ 'tw-col-span-2': constVariablesArchive.length > 0 }"
				class="tw-text-center tw-w-full"
			>
				Value
			</div>
		</div>
		<div
			v-if="!loading && constVariables?.variables"
			class="tw-w-full tw-flex tw-grow tw-max-h-full tw-overflow-auto"
		>
			<q-intersection
				v-if="
					(!constVariablesWithCurrentArchive ||
						constVariablesWithCurrentArchive.length === 0) &&
					!loading
				"
				transition="fade"
				class="tw-w-full tw-flex tw-justify-center tw-items-stretch tw-my-auto"
			>
				<div>
					<div
						class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400"
						v-if="version === constVariablesArchive.length - 1"
					>
						There are no constant variables in this configuration
						<div
							class="tw-text-center tw-text-xs tw-text-gray-500"
							v-if="userCanModify"
						>
							You can create one using the panel below
						</div>
					</div>
					<div
						class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400"
						v-else
					>
						There are no constant variables in this version or the latest
						configuration
						<div
							class="tw-text-center tw-text-xs tw-text-gray-500"
							v-if="userCanModify"
						>
							There is no existing data set that can be used for comparison.
						</div>
					</div>
				</div>
			</q-intersection>
			<div
				:class="{ 'tw-col-span-2': constVariablesArchive.length > 0 }"
				class="tw-flex-1 tw-overflow-auto tw-max-h-full"
			>
				<q-intersection
					v-for="constVar of constVariablesWithCurrentArchive"
					:key="constVar.name"
					once
					class="tower-configuration-row"
					transition="fade"
				>
					<constant-variable-row
						v-model:add-if-absent="constVar.addIfAbsent"
						v-model:forced="constVar.forced"
						v-model:type="constVar.type"
						v-model:value="constVar.value"
						v-model:value-key="constVar.valueKey"
						:current-archive="constVariableArchiveVersion(constVar.name)"
						:current-version="
							constVariableArchiveVersion(
								constVar.name,
								constVariablesArchive.length - 1,
							)
						"
						:deleted="constVar.deleted"
						:disable="!userCanModify"
						:grid="constVariablesArchive.length > 0 ? 3 : 2"
						:is-new="constVar.isNew"
						:name="constVar.name"
						:showDiff="showDiff"
						@addVariable="addNewConstantVariable"
						@removeVariable="removeConstantVariable"
					/>
				</q-intersection>
			</div>
			<div
				v-if="
					constVariablesWithCurrentArchive.length === 0 &&
					filter &&
					constVariables?.variables.length > 0
				"
				class="tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center"
			>
				<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
					All variables have been filtered out
					<div class="tw-text-center tw-text-xs tw-text-gray-500">
						Please update your filter in the panel above
					</div>
				</div>
			</div>
		</div>
		<div v-if="userCanModify" class="tw-w-full">
			<transition
				enter-active-class="animated fadeIn"
				leave-active-class="animated fadeOut"
			>
				<new-constant-variable-panel
					v-if="!loading"
					:existing-variable-names="constVariableNames"
					@addNewConstantVariable="addNewConstantVariable"
				/>
			</transition>
			<transition
				enter-active-class="animated fadeIn"
				leave-active-class="animated fadeOut"
			>
				<save-panel
					v-if="
						(constVariables?.variables &&
							constVariables?.variables.length > 0) ||
						allDeleted
					"
					:save-enabled="isDifferent && !loading"
					@saveClicked="saveConstantVariables"
				/>
			</transition>
		</div>
	</q-card>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, Ref, ref, watch } from 'vue';
import { towerAxios } from 'boot/axios';
import { useQuasar } from 'quasar';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { basesStore } from 'stores/bases';
import ConstantVariableRow from 'components/constantVariables/constantVariableRow.vue';
import {
	ConstantVariable,
	ConstantVariableValue,
	ConstantVariableValueToDisplay,
	valueAsString,
	valueConverter,
} from 'components/constantVariables/constantVariable';
import SavePanel from 'components/basic/savePanel.vue';
import NewConstantVariablePanel from 'components/constantVariables/newConstantVariablePanel.vue';
import { Import, ImportDetails } from 'components/models';
import { userStore } from 'stores/user';
import { navigationStore } from 'stores/navigation';
import { cloneDeep } from 'lodash';
import { toOrdinal } from 'number-to-words';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const baseSt = basesStore();
const userSt = userStore();
const navigationSt = navigationStore();

//====================================================
// Props
//====================================================
/**
 * Props interface for the constant variable panel component
 * @property {Array<ConfigurationModel>} configModel - Array of configuration models
 * @property {string | null} filter - Filter string for filtering variables
 * @property {boolean} showDiff - Whether to show differences between versions
 */
interface constantVariablePanelProps {
	configModel: Array<ConfigurationModel>;
	filter: string | null;
	showDiff: boolean;
}

const props = withDefaults(defineProps<constantVariablePanelProps>(), {
	configModel: () => [],
	filter: '',
	showDiff: true,
});

//====================================================
// Data
//====================================================
/** Current constant variables configuration */
const constVariables: Ref<ConstantVariable | null> = ref(null);
/** Archive of past constant variable configurations */
const constVariablesArchive: Ref<Array<ConstantVariable>> = ref([]);
/** Loading state indicator */
const loading = ref(false);
/** Currently displayed version index */

const version = ref(-1);

//====================================================
// beforeMounted
//====================================================
onBeforeMount(async () => {
	await getConstantVariables();
});

//====================================================
// Computed
//====================================================
/**
 * Returns formatted date string for the currently selected version
 * @returns {string} Localized date string or empty string if no version selected
 */
const currentVersionDate = computed(() => {
	if (version.value >= 0 && constVariablesArchive.value[version.value]) {
		const date = new Date(
			constVariablesArchive.value[version.value]?.effectiveDate ?? 0,
		);
		return date.toLocaleString();
	}

	return '';
});

/**
 * Checks if all variables in current configuration are marked as deleted
 * @returns {boolean} True if all variables are deleted, false otherwise
 */
const allDeleted = computed(() => {
	if (constVariables.value) {
		return !constVariables.value.variables.some((el) => {
			return !el.deleted;
		});
	}

	return false;
});

/**
 * Returns username of the author who created the current version
 * @returns {string} Username of version author or empty string if not available
 */
const currentVersionAuthor = computed(() => {
	if (version.value >= 0 && constVariablesArchive.value[version.value]) {
		return constVariablesArchive.value[version.value]?.createdBy?.username;
	}

	return '';
});

/**
 * Determines if current user has rights to modify constant variables
 * @returns {boolean} True if user has admin rights or constantVariable.modify role
 */
const userCanModify = computed(() => {
	if (userSt.hasAdminRights) {
		return true;
	}

	return userSt.getRoles.includes('constantVariable.modify');
});

/**
 * Checks if current configuration differs from the latest saved version
 * @returns {boolean} True if changes are detected, false otherwise
 */
const isDifferent = computed(() => {
	return isDifferentThan();
});

const differentThanShownVersion = computed(() => {
	return isDifferentThan(version.value);
});

/**
 * Returns array of all variable names in current configuration
 * @returns {Array<string>} Array of variable names
 */
const constVariableNames = computed(() => {
	const array: Array<string> = [];

	if (constVariables.value?.variables) {
		constVariables.value.variables.forEach((el) => {
			array.push(el.name);
		});
	}

	return array;
});

/**
 * Combines current variables with an archived version and applies filtering
 * @returns {Array<ConstantVariableValueToDisplay>} Filtered and sorted array of variables
 */
const constVariablesWithCurrentArchive = computed(() => {
	let array: Array<ConstantVariableValueToDisplay> = [];

	if (constVariables.value?.variables) {
		array = [...constVariables.value.variables];
	}

	if (
		constVariablesArchive.value.length > 0 &&
		constVariablesArchive.value[version.value] &&
		constVariablesArchive.value[version.value]?.variables
	) {
		constVariablesArchive.value[version.value]?.variables.forEach(
			(archiveEl) => {
				const exists = array.some((currentEl) => {
					return archiveEl.name === currentEl.name;
				});

				if (!exists) {
					array.push({
						name: archiveEl.name,
						addIfAbsent: archiveEl.addIfAbsent,
						forced: archiveEl.forced,
						type: archiveEl.type,
						value: archiveEl.value,
						valueKey: archiveEl.valueKey,
						deleted: true,
					});
				}
			},
		);
	}

	array.sort((a, b) => {
		return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
	});

	if (props.filter) {
		const lowerFilter = props.filter.toLocaleLowerCase('en-US');

		array = array.filter((el) => {
			if (el.name.toLocaleLowerCase('en-US').includes(lowerFilter)) {
				return true;
			}

			if (el.type === lowerFilter) {
				return true;
			}

			let tempValue = valueAsString(el.value);
			if (tempValue) {
				tempValue = tempValue.toLocaleLowerCase('en-US');
			}
			return tempValue.includes(lowerFilter);
		});
	}

	return array;
});

/**
 * Determines if import functionality should be enabled
 * @returns {boolean} True if there are variables that can be imported
 */
const importEnabled = computed(() => {
	return (
		!!constVariables.value?.variables &&
		constVariables.value?.variables.length > 0
	);
});

/**
 * A computed property that converts the current version value into its ordinal representation.
 *
 * This property utilizes the reactive `version` state and transforms its value by applying
 * the `toOrdinal` function, which formats a number into its corresponding ordinal form
 * (e.g., 1 to "1st", 2 to "2nd", 3 to "3rd"). It will automatically update when the value
 * of `version` changes.
 *
 * @type {ComputedRef<string>} The ordinal representation of the current version.
 */
const previousVersionAsOrdinal = computed(() => {
	return toOrdinal(version.value);
});

/**
 * A computed variable that determines the next version number as an ordinal string.
 * The value is derived by adding 2 to the current version and converting it to an ordinal format.
 *
 * Dependencies:
 * - `version.value`: Current version number, used as the base for calculation.
 * - `toOrdinal`: A utility function that converts numeric values into their ordinal string representation (e.g., 3 becomes "3rd").
 *
 * Returns:
 * - {string} The next version number incremented by 2, formatted as an ordinal string.
 */
const nextVersionAsOrdinal = computed(() => {
	return toOrdinal(version.value + 2);
});

//====================================================
// Methods
//====================================================
/**
 * Fetches constant variables and their history from the server
 * Initializes local state with retrieved data
 * @throws Will display error notification if request fails
 */
const getConstantVariables = async () => {
	version.value = -1;
	constVariables.value = null;
	constVariablesArchive.value = [];
	navigationSt.allowNavigation();

	const rowsLimit = 20;

	if (!props.configModel) {
		return;
	}

	loading.value = true;

	const filter: any = {
		order: 'version DESC',
		include: ['member'],
		limit: rowsLimit,
		where: {},
	};

	baseSt.getBases.forEach((el) => {
		filter.where[el.name] = { $eq: null };
	});

	props.configModel.forEach((el) => {
		if (el) {
			filter.where[el.base] = el.name;
		}
	});

	try {
		const response = await towerAxios.get(
			`constantVariables?filter=${JSON.stringify(filter, null, '')}`,
		);

		const countFilter = cloneDeep(filter);
		countFilter.limit = undefined;
		countFilter.order = undefined;
		const countResponse = await towerAxios.get(
			`constantVariables/count?filter=${JSON.stringify(countFilter, null, '')}`,
		);

		if (response.status === 200 && countResponse.status === 200) {
			constVariables.value = null;
			constVariablesArchive.value = [];
			if (response.data.length > 0) {
				// Deep copy
				constVariables.value = structuredClone(response.data[0]);
				if (countResponse.data > rowsLimit) {
					constVariablesArchive.value = [
						...[...Array(countResponse.data - rowsLimit).keys()].map(() => {
							return {} as ConstantVariable;
						}),
						...response.data.reverse(),
					];
				} else {
					constVariablesArchive.value = response.data.reverse();
				}

				if (constVariablesArchive.value.length > 0) {
					version.value = constVariablesArchive.value.length - 1;
				}
			}
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting constant variable data',
		});
	}

	loading.value = false;
};

/**
 * Retrieves variable configuration from specific archive version
 * @param {string} variableName - Name of variable to find
 * @param {number} [ver] - Version to search in, defaults to current version
 * @returns {ConstantVariableValue | undefined} Variable configuration if found
 */
const constVariableArchiveVersion = (variableName: string, ver?: number) => {
	ver = ver || version.value;
	if (
		ver < 0 ||
		!constVariablesArchive.value[ver] ||
		!constVariablesArchive.value[ver]?.variables
	) {
		return undefined;
	}

	const variables = constVariablesArchive.value[ver]?.variables;
	return variables?.find((el) => {
		return el.name === variableName;
	});
};

/**
 * Removes variable from current configuration by name
 * @param {string} variableName - Name of variable to remove
 */
const removeConstantVariable = (variableName: string) => {
	if (constVariables.value) {
		constVariables.value.variables = constVariables.value?.variables.filter(
			(el) => {
				return el.name !== variableName;
			},
		);
	}
};

/**
 * Adds new variable to current configuration
 * Creates new configuration if none exists
 * @param {ConstantVariableValueToDisplay} variable - Variable to add
 */
const addNewConstantVariable = (variable: ConstantVariableValueToDisplay) => {
	if (constVariables.value) {
		constVariables.value.variables.push(variable);
	} else {
		constVariables.value = {
			effectiveDate: new Date(),
			id: '',
			variables: [variable],
		};

		props.configModel.forEach((el) => {
			if (el && constVariables.value) {
				(constVariables.value as any)[el.base] = el.name;
			}
		});
	}
};

/**
 * Saves current configuration to the server
 * @throws Will display error notification if save fails
 */
const saveConstantVariables = async () => {
	loading.value = true;

	if (constVariables.value) {
		const full: any = {
			variables: [],
		};

		constVariables.value.variables.forEach((el) => {
			full.variables.push({
				name: el.name,
				type: el.type,
				value: el.value,
				valueKey: el.valueKey,
				addIfAbsent: el.addIfAbsent,
				forced: el.forced,
			});
		});

		baseSt.getBases.forEach((el) => {
			if (constVariables.value && (constVariables.value as any)[el.name]) {
				full[el.name] = (constVariables.value as any)[el.name];
			}
		});

		try {
			const response = await towerAxios.post('constantVariables', full);
			if (response.status === 201) {
				await getConstantVariables();

				$q.notify({
					color: 'positive',
					position: 'top',
					textColor: 'secondary',
					icon: 'sym_o_check',
					message: 'Constant variables saved correctly',
				});
			}
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error saving constant variables',
			});
		}
	}

	loading.value = false;
};

/**
 * Exports current configuration as JSON string
 * @returns {string} JSON string of current configuration
 */
const exportConfiguration = () => {
	if (!constVariables.value?.variables) {
		return;
	}

	const exportDetails = exportJSON();
	return JSON.stringify(exportDetails);
};

/**
 * Creates export object from current configuration
 * @returns {ImportDetails} Object containing exportable configuration
 */
const exportJSON = () => {
	const obj: ImportDetails = {
		constantVariables: [],
	};

	constVariables.value?.variables.forEach((el) => {
		if (obj.constantVariables) {
			obj.constantVariables.push({
				name: el.name,
				type: el.type,
				value: el.value,
				addIfAbsent: el.addIfAbsent,
				forced: el.forced,
			});
		}
	});

	return obj;
};

/**
 * Imports configuration from provided import details
 * @param {Import} importDetails - Import configuration data
 * @throws Will display error notification if import fails
 */
const importConfiguration = (importDetails: Import) => {
	let data = null;
	try {
		data = JSON.parse(importDetails.fileData as string);
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error importing configuration - invalid file data',
		});

		return;
	}

	if (data) {
		if (!data.constantVariables || data.constantVariables.length === 0) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message:
					'Error importing constant variables - constant variables data not present',
			});

			return;
		}
		if (!constVariables.value) {
			constVariables.value = {
				effectiveDate: new Date(),
				id: '',
				variables: [],
			};
		}

		const newVariables: Array<ConstantVariableValue> = [];

		data.constantVariables.forEach((el: ConstantVariableValue) => {
			newVariables.push({
				name: el.name,
				type: el.type,
				value: valueConverter(el.value, el.type),
				addIfAbsent: el.addIfAbsent,
				forced: el.forced,
			});
		});

		constVariables.value.variables = newVariables;

		$q.notify({
			color: 'positive',
			position: 'top',
			textColor: 'secondary',
			message: 'Constant variables imported successfully',
		});
	}
};

/**
 * Reverts current configuration to the selected archive version
 * Copies all variables from archive version to current configuration
 */
const fullRevert = () => {
	if (constVariables.value && constVariablesArchive.value[version.value]) {
		constVariables.value.variables = [];
		constVariablesArchive.value[version.value]?.variables.forEach((el) => {
			constVariables.value?.variables.push({
				name: el.name,
				type: el.type,
				value: el.value,
				forced: el.forced,
				addIfAbsent: el.addIfAbsent,
			});
		});
	}
};

/**
 * Compares current configuration with specified version
 * @param {number} [version] - Version to compare against, defaults to latest
 * @returns {boolean} True if configurations differ, false otherwise
 */
const isDifferentThan = (version?: number) => {
	if (
		constVariablesArchive.value.length === 0 &&
		constVariables.value?.variables.length === 0
	) {
		return false;
	}

	if (
		constVariablesArchive.value.length === 0 &&
		constVariables.value?.variables.length !== 0
	) {
		return true;
	}

	if (constVariablesArchive.value.length > 0) {
		const currentVersion = version
			? version
			: constVariablesArchive.value.length - 1;
		const currentVariables = constVariablesArchive.value[currentVersion];

		if (!currentVariables || !currentVariables.variables) {
			return false;
		}

		if (
			currentVariables.variables.length !==
			constVariables.value?.variables.length
		) {
			return true;
		}

		return currentVariables.variables.some((el) => {
			const local = constVariables.value?.variables.find((constVar) => {
				return constVar.name === el.name;
			});

			if (!local) {
				return true;
			} else {
				if (local.type === 'AWS SM') {
					if (local.valueKey !== el.valueKey) {
						return true;
					}
				}
				return (
					local.type !== el.type ||
					local.forced !== el.forced ||
					valueAsString(local.value) !== valueAsString(el.value) ||
					local.addIfAbsent !== el.addIfAbsent
				);
			}
		});
	}

	return false;
};

//====================================================
// Watch
//====================================================
watch(() => props.configModel, getConstantVariables, {
	immediate: false,
	deep: true,
});

watch(isDifferent, (current) => {
	if (current && !loading.value) {
		navigationSt.preventNavigation();
	} else {
		navigationSt.allowNavigation();
	}
});

watch(version, async (current) => {
	if (
		constVariablesArchive.value[current] &&
		!constVariablesArchive.value[current].variables
	) {
		loading.value = true;

		const filter: any = {
			include: ['member'],
			where: {
				version: current + 1,
			},
		};

		baseSt.getBases.forEach((el) => {
			filter.where[el.name] = { $eq: null };
		});

		props.configModel.forEach((el) => {
			if (el) {
				filter.where[el.base] = el.name;
			}
		});

		try {
			const response = await towerAxios.get(
				`constantVariables?filter=${JSON.stringify(filter, null, '')}`,
			);

			if (response.status === 200) {
				if (response.data.length > 0) {
					constVariablesArchive.value[current] = response.data[0];
				}
			}
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error collecting constant variable data',
			});
		}

		loading.value = false;
	}
});

//====================================================
// Expose
//====================================================
defineExpose({
	importConfiguration,
	exportConfiguration,
	userCanModify,
	importEnabled,
});
</script>

<style scoped></style>
