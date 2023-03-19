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
		class="tw-bg-darkPage tw-text-secondary tw-gap-3 row tw-pt-2 tw-rounded tower-min-height tw-flex-1"
		flat
	>
		<q-inner-loading :showing="loading">
			<q-spinner-clock color="secondary" size="3em" />
			<div class="tw-mt-3">Please wait, loading...</div>
		</q-inner-loading>
		<div
			v-if="!constVariables?.variables && !loading"
			class="tw-w-full tw-flex tw-justify-center tw-items-center"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				There aren't any constant variables in this configuration
				<div
					class="tw-text-center tw-text-xs tw-text-gray-500"
					v-if="userCanModify"
				>
					You can create one using panel below
				</div>
			</div>
		</div>
		<div
			v-if="!loading && constVariables?.variables"
			:class="{
				'tower-max-height': userCanModify,
				'tower-max-height-readOnly': !userCanModify,
			}"
			class="tw-w-full"
		>
			<div
				:class="{
					'tw-grid-cols-5': constVariablesArchive.length > 0,
					'tw-grid-cols-2': constVariablesArchive.length === 0,
				}"
				class="tw-grid tw-w-full tw-gap-3 tw-justify-items-stretch tw-place-items-center tw-text-sm tw-font-semibold tw-min-h-[2.5rem]"
			>
				<div class="tw-text-center tw-w-full">Name</div>
				<div
					v-if="constVariablesArchive.length > 0"
					class="tw-flex tw-col-span-2"
				>
					<q-btn
						:disable="version <= 0"
						class="tw-flex-none"
						flat
						icon="sym_o_chevron_left"
						padding="sm"
						@click="version--"
					/>
					<div class="tw-grow tw-self-center tw-flex tw-justify-center">
						<div class="tw-mr-3 tw-self-center">
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
								<q-tooltip v-if="differentThanShownVersion"
									>Revert to this version
								</q-tooltip>
							</q-btn>
						</div>
					</div>
					<q-btn
						:disable="version >= constVariablesArchive.length - 1"
						class="tw-flex-none"
						flat
						icon="sym_o_chevron_right"
						padding="sm"
						@click="version++"
					/>
				</div>
				<div
					:class="{ 'tw-col-span-2': constVariablesArchive.length > 0 }"
					class="tw-text-center tw-w-full"
				>
					Value
				</div>
			</div>
			<div :class="{ 'tw-col-span-2': constVariablesArchive.length > 0 }">
				<q-intersection
					v-for="constVar of constVariablesWithCurrentArchive"
					:key="constVar.name"
					class="tower-configuration-row"
					ssr-prerender
					transition="fade"
				>
					<constant-variable-row
						v-model:add-if-absent="constVar.addIfAbsent"
						v-model:forced="constVar.forced"
						v-model:type="constVar.type"
						v-model:value="constVar.value"
						:current-archive="constVariableArchiveVersion(constVar.name)"
						:current-version="
							constVariableArchiveVersion(
								constVar.name,
								constVariablesArchive.length - 1
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
	</q-card>
	<div v-if="userCanModify">
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
				v-if="constVariables?.variables"
				:save-enabled="isDifferent && !loading"
				@saveClicked="saveConstantVariables"
			/>
		</transition>
	</div>
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
import { Export, ImportDetails } from 'components/models';
import { userStore } from 'stores/user';
import { navigationStore } from 'stores/navigation';

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
const constVariables: Ref<ConstantVariable | null> = ref(null);
const constVariablesArchive: Ref<Array<ConstantVariable>> = ref([]);
const loading = ref(false);

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
 * currentVersionDate
 */
const currentVersionDate = computed(() => {
	if (version.value >= 0) {
		const date = new Date(
			constVariablesArchive.value[version.value].effectiveDate
		);
		return date.toLocaleString();
	}

	return new Date();
});

/**
 * currentVersionAuthor
 */
const currentVersionAuthor = computed(() => {
	if (version.value >= 0) {
		return constVariablesArchive.value[version.value].member?.username;
	}

	return '';
});

/**
 * userCanModify
 */
const userCanModify = computed(() => {
	if (userSt.hasAdminRights) {
		return true;
	}

	return userSt.getRoles.includes('constantVariable.modify');
});

/**
 * isDifferent
 */
const isDifferent = computed(() => {
	return isDifferentThan();
});

const differentThanShownVersion = computed(() => {
	return isDifferentThan(version.value);
});

/**
 * constVariableNames
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
 * constVariablesWithCurrentArchive
 */
const constVariablesWithCurrentArchive = computed(() => {
	let array: Array<ConstantVariableValueToDisplay> = [];

	if (constVariables.value?.variables) {
		array = [...constVariables.value.variables];
	}

	if (constVariablesArchive.value.length > 0) {
		constVariablesArchive.value[version.value].variables.forEach(
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
						deleted: true,
					});
				}
			}
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
 * importEnabled
 */
const importEnabled = computed(() => {
	return (
		!!constVariables.value?.variables &&
		constVariables.value?.variables.length > 0
	);
});

//====================================================
// Methods
//====================================================
/**
 * getConstantVariables
 */
const getConstantVariables = async () => {
	version.value = -1;
	constVariables.value = null;
	constVariablesArchive.value = [];
	navigationSt.allowNavigation();

	if (!props.configModel) {
		return;
	}

	loading.value = true;

	const filter: any = {
		order: 'effectiveDate DESC',
		include: ['member'],
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
			`constantVariables?filter=${JSON.stringify(filter, null, '')}`
		);

		if (response.status === 200) {
			constVariables.value = null;
			constVariablesArchive.value = [];
			if (response.data.length > 0) {
				// Deep copy
				constVariables.value = structuredClone(response.data[0]);
				constVariablesArchive.value = response.data.reverse();

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
 * constVariableArchiveVersion
 * @param variableName
 * @param ver
 */
const constVariableArchiveVersion = (variableName: string, ver?: number) => {
	ver = ver || version.value;
	if (ver < 0 || !constVariablesArchive.value[ver]) {
		return undefined;
	}

	const variables = constVariablesArchive.value[ver].variables;
	return variables.find((el) => {
		return el.name === variableName;
	});
};

/**
 * removeConstantVariable
 * @param variableName
 */
const removeConstantVariable = (variableName: string) => {
	if (constVariables.value) {
		constVariables.value.variables = constVariables.value?.variables.filter(
			(el) => {
				return el.name !== variableName;
			}
		);
	}
};

/**
 * addNewConstantVariable
 */
const addNewConstantVariable = (variable: ConstantVariableValueToDisplay) => {
	if (constVariables.value) {
		constVariables.value.variables.push(variable);
	} else {
		constVariables.value = {
			effectiveDate: new Date(),
			createdBy: '',
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
 * saveConstantVariables
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
			await towerAxios.post('constantVariables', full);
			await getConstantVariables();

			$q.notify({
				color: 'positive',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_check',
				message: 'Constant variables saved correctly',
			});
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

const importConfiguration = () => {
	if (!constVariables.value?.variables) {
		return;
	}

	let importDetails: ImportDetails | null | string = null;

	importDetails = importJSON();
	return JSON.stringify(importDetails);
};

const importJSON = () => {
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
 * exportConfiguration
 * @param exportDetails
 */
const exportConfiguration = (exportDetails: Export) => {
	let data = null;
	try {
		data = JSON.parse(exportDetails.fileData as string);
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error exporting configuration - invalid file data',
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
					'Error exporting constant variables - constant variables data not present',
			});

			return;
		}
		if (!constVariables.value) {
			constVariables.value = {
				createdBy: '',
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
			message: 'Constant variables exported successfully',
		});
	}
};

/**
 * fullRevert
 */
const fullRevert = () => {
	if (constVariables.value && constVariablesArchive.value[version.value]) {
		constVariables.value.variables = [];
		constVariablesArchive.value[version.value].variables.forEach((el) => {
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
 *
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

watch(isDifferent, (current: boolean) => {
	if (current && !loading.value) {
		navigationSt.preventNavigation();
	} else {
		navigationSt.allowNavigation();
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

<style scoped>
.tower-max-height {
	overflow: auto;
	max-height: calc(100vh - 20rem);
}

.tower-max-height-readOnly {
	overflow: auto;
	max-height: calc(100vh - 12rem);
}

.tower-min-height {
	min-height: calc(100vh - 19rem);
}
</style>
