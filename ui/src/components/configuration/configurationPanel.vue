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
	<q-dialog v-model="commentsDialog" persistent>
		<q-card class="tw-min-w-[30%]">
			<q-card-section class="tw-bg-darkPage">
				<div class="text-h6">Comment your changes</div>
			</q-card-section>
			<q-card-section class="tw-max-h-[70vh] tw-overflow-auto">
				<q-input
					type="textarea"
					color="secondary"
					v-model="comment"
					autogrow
					label="Comment"
				/>
			</q-card-section>
			<q-card-actions align="right">
				<q-btn v-close-popup color="secondary" flat label="Cancel" />
				<q-btn
					v-close-popup
					color="positive"
					flat
					label="Save"
					@click="saveConfiguration"
					:disable="!comment"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
	<q-dialog v-model="promotionCandidatesDialog" persistent>
		<q-card class="tw-min-w-[30%]">
			<q-card-section class="tw-bg-darkPage">
				<div class="text-h6">Promotion Candidates</div>
			</q-card-section>

			<q-card-section
				v-if="promotionCandidatesCategories"
				class="tw-max-h-[70vh] tw-overflow-auto"
			>
				<template
					v-for="promoteCandidateKey of promotionCandidatesCategories.keys()"
					:key="promoteCandidateKey"
				>
					<q-expansion-item
						class="tw-bg-darkPage"
						expand-separator
						dense
						:label="promoteCandidateKey"
					>
						<q-separator></q-separator>
						<q-list separator>
							<q-item
								clickable
								:active="activePromotionCandidate === promotionCandidate.id"
								v-for="promotionCandidate of promotionCandidatesCategories.get(
									promoteCandidateKey,
								)"
								:key="promotionCandidate.id"
								active-class="tw-text-secondary tw-font-bold"
								@click="setActivePromotionCandidate(promotionCandidate.id)"
							>
								<q-item-section avatar>
									<q-icon
										:name="
											activePromotionCandidate === promotionCandidate.id
												? 'sym_o_check'
												: 'sym_o_check_box_outline_blank'
										"
										class="heavy"
										:color="
											activePromotionCandidate === promotionCandidate.id
												? 'positive'
												: undefined
										"
										size="sm"
									/>
								</q-item-section>
								<q-item-section class="tw-flex-grow">
									Version {{ promotionCandidate.configuration.version }},
									{{
										new Date(
											promotionCandidate.configuration?.effectiveDate,
										).toLocaleString()
									}}
								</q-item-section>
								<q-item-section
									side
									@click="
										(event: MouseEvent) =>
											showPromotionCandidatePreviewDialog(
												event,
												promotionCandidate.configuration,
											)
									"
								>
									<q-btn flat padding="0.25rem">
										<q-icon name="sym_o_find_in_page" size="sm" />
										<q-tooltip>Preview</q-tooltip>
									</q-btn>
								</q-item-section>
							</q-item>
						</q-list>
					</q-expansion-item>
				</template>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn v-close-popup color="secondary" flat label="Cancel" />
				<q-btn
					v-close-popup
					color="positive"
					flat
					label="Promote"
					@click="promote"
					:disable="!activePromotionCandidate"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
	<q-dialog v-model="promotionCandidatesPreviewDialog">
		<q-card class="tw-min-w-[30%]">
			<q-card-section class="tw-bg-darkPage">
				<div class="text-h6">Preview {{ previewLabel }}</div>
			</q-card-section>

			<q-card-section class="tw-max-w-[90vw] tw-max-h-[70vh] tw-overflow-auto">
				<div class="tw-grid tw-grid-cols-2 tw-gap-3">
					<template
						v-for="variable of promotionCandidatePreviewConfig?.variables"
						:key="variable.name"
					>
						<div class="fullWordWrap">{{ variable.name }}</div>
						<div class="fullWordWrap">{{ variable.value }}</div>
					</template>
				</div>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn v-close-popup color="secondary" flat label="Close preview" />
			</q-card-actions>
		</q-card>
	</q-dialog>
	<q-card
		class="tw-bg-darkPage tw-text-secondary tw-gap-3 row tw-pt-2 tw-rounded tw-flex-1 tower-min-height"
		flat
	>
		<q-inner-loading :showing="loading">
			<q-spinner-clock color="secondary" size="3em" />
			<div class="tw-mt-3">Please wait, loading...</div>
		</q-inner-loading>
		<div
			v-if="configurationWithCurrentArchive.length === 0 && !loading && !filter"
			class="tw-w-full tw-flex tw-justify-center tw-items-center"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				There aren't any variables in this configuration
				<div
					class="tw-text-center tw-text-xs tw-text-gray-500"
					v-if="userCanModify"
				>
					You can create one using panel below
				</div>
			</div>
		</div>
		<div
			v-if="configurationWithCurrentArchive.length === 0 && !loading && filter"
			class="tw-w-full tw-flex tw-justify-center tw-items-center"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				All variables have been filtered out
				<div class="tw-text-center tw-text-xs tw-text-gray-500">
					Please update your filter in the panel above
				</div>
			</div>
		</div>
		<div
			v-if="!loading && configurationWithCurrentArchive.length > 0"
			class="tw-w-full"
		>
			<div
				:class="{
					'tw-grid-cols-5': configurationVariablesArchive.length > 0,
					'tw-grid-cols-2': configurationVariablesArchive.length === 0,
				}"
				class="tw-grid tw-w-full tw-px-2 tw-gap-3 tw-justify-items-stretch tw-place-items-center tw-text-sm tw-font-semibold"
			>
				<div class="tw-text-center tw-w-full">Name</div>
				<div
					v-if="configurationVariablesArchive.length > 0"
					class="tw-flex tw-col-span-2"
				>
					<div>
						<q-btn
							:disable="version <= 0 || loading"
							class="tw-flex-none"
							flat
							icon="sym_o_first_page"
							padding="sm"
							@click="version = 0"
						/>
						<q-btn
							:disable="version <= 0 || loading"
							class="tw-flex-none"
							flat
							icon="sym_o_chevron_left"
							padding="sm"
							@click="version--"
						/>
					</div>
					<div class="tw-grow tw-self-center tw-flex tw-justify-center">
						<div class="tw-self-center tw-flex tw-mr-3">
							<q-btn
								:disable="promoted"
								flat
								padding="sm"
								@click="promoteConfiguration"
							>
								<q-icon
									:class="{ filled: promoted }"
									:color="promoted ? 'accent' : undefined"
									name="sym_o_star"
								/>
								<q-tooltip v-if="differentThanShownVersion && !promoted"
									>Promote</q-tooltip
								>
							</q-btn>
							<q-separator inset vertical />
						</div>
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
					<div>
						<q-btn
							:disable="version >= configurationVariablesArchive.length - 1"
							class="tw-flex-none"
							flat
							icon="sym_o_chevron_right"
							padding="sm"
							@click="version++"
						/>
						<q-btn
							:disable="version >= configurationVariablesArchive.length - 1"
							flat
							icon="sym_o_last_page"
							padding="sm"
							@click="version = configurationVariablesArchive.length - 1"
						/>
					</div>
				</div>
				<div
					:class="{ 'tw-col-span-2': configurationVariablesArchive.length > 0 }"
					class="tw-text-center tw-w-full"
				>
					Value
				</div>
			</div>
			<div
				:class="{
					'tw-col-span-2': configurationVariablesArchive.length > 0,
					'tower-max-height': userCanModify,
					'tower-max-height-readOnly': !userCanModify,
				}"
			>
				<template v-if="configurationWithCurrentArchive.length >= 100">
					<q-intersection
						once
						v-for="row of configurationWithCurrentArchive"
						:key="row.name"
						class="tower-configuration-row"
						ssr-prerender
					>
						<configuration-variable-row
							v-model:type="row.type"
							v-model:value="row.value"
							v-model:value-key="row.valueKey"
							:allow-delete="!row.addIfAbsent && userCanModify"
							:current-archive="configurationArchiveVersion(row.name)"
							:deleted="row.deleted"
							:error="row.error"
							:forced="row.forced || !userCanModify"
							:grid="configurationVariablesArchive.length > 0 ? 3 : 2"
							:is-constant-variable="row.constantVariable"
							:name="row.name"
							:source-base="row.sourceBase"
							:source-model="row.sourceModel"
							:showDiff="showDiff"
							@addVariable="addNewVariable"
							@removeVariable="removeVariable"
						/>
					</q-intersection>
				</template>
				<template v-else>
					<transition-group
						enter-active-class="animated fadeIn"
						leave-active-class="animated fadeOut"
					>
						<configuration-variable-row
							v-for="row of configurationWithCurrentArchive"
							:key="row.name"
							v-model:type="row.type"
							v-model:value="row.value"
							v-model:value-key="row.valueKey"
							:allow-delete="!row.addIfAbsent && userCanModify"
							:current-archive="configurationArchiveVersion(row.name)"
							:deleted="row.deleted"
							:error="row.error"
							:forced="row.forced || !userCanModify"
							:grid="configurationVariablesArchive.length > 0 ? 3 : 2"
							:is-constant-variable="row.constantVariable"
							:name="row.name"
							:showDiff="showDiff"
							@addVariable="addNewVariable"
							@removeVariable="removeVariable"
						/>
					</transition-group>
				</template>
			</div>
		</div>
	</q-card>
	<div v-if="userCanModify">
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<new-configuration-variable-panel
				v-if="!loading"
				:existing-variable-names="configurationVariableNames as string[]"
				@addNewVariable="addNewVariable"
			/>
		</transition>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<save-panel
				v-if="configurationVariables?.variables"
				:has-errors="hasErrors"
				:save-enabled="isDifferent && !loading"
				@saveClicked="
					commentNeeded ? showCommentsDialog() : saveConfiguration()
				"
			/>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, Ref, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { basesStore } from 'stores/bases';
import {
	ConfigurationModel,
	ConfigurationModelRule,
} from 'components/configurationModel/configurationModel';
import {
	Configuration,
	ConfigurationVariable,
	ConfigurationVariableToDisplay,
} from 'components/configuration/configuration';
import { towerAxios } from 'boot/axios';
import {
	ConfigurationVariableType,
	ConstantVariableValueToDisplay,
	valueAsString,
	valueConverter,
} from 'components/constantVariables/constantVariable';
import ConfigurationVariableRow from 'components/configuration/configurationVariableRow.vue';
import NewConfigurationVariablePanel from 'components/configuration/newConfigurationVariablePanel.vue';
import SavePanel from 'components/basic/savePanel.vue';
import { Import, ImportDetails } from 'components/models';
import { userStore } from 'stores/user';
import { navigationStore } from 'stores/navigation';
import { v4 as uuidv4 } from 'uuid';
import { AxiosError } from 'axios';
import { cloneDeep, isNil } from 'lodash';
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
interface configurationPanelProps {
	configModel: Array<ConfigurationModel>;
	filter: string | null;
	showDiff: boolean;
}

const props = withDefaults(defineProps<configurationPanelProps>(), {
	configModel: () => [],
	filter: '',
	showDiff: true,
});

//====================================================
// Data
//====================================================
const loading = ref(false);
const configurationVariables: Ref<Configuration | null> = ref(null);
const configurationVariablesArchive: Ref<Array<Configuration>> = ref([]);
const constVariables: Ref<Array<ConstantVariableValueToDisplay>> = ref([]);

const configurationModelRules: Ref<Array<ConfigurationModelRule>> = ref([]);

const hasErrors = ref(false);

const version = ref(-1);

const localPromotionCandidates: Ref<Array<Configuration>> = ref([]);

const promotionCandidatesDialog = ref(false);
const activePromotionCandidate = ref('');
const promotionCandidatesPreviewDialog = ref(false);
const promotionCandidatePreviewConfig: Ref<Configuration | null> = ref(null);

const commentsDialog = ref(false);
const comment = ref('');

//====================================================
// beforeMounted
//====================================================
onBeforeMount(async () => {
	await getConfiguration();
});

//====================================================
// Emits
//====================================================
const emit = defineEmits(['update:promotionCandidates']);

//====================================================
// Computed
//====================================================
/**
 * promotionCandidatesCategories
 */
const promotionCandidatesCategories = computed(() => {
	if (localPromotionCandidates.value.length > 0) {
		const all = new Map<string, Array<any>>();

		localPromotionCandidates.value.forEach((promote: any) => {
			props.configModel.forEach((model) => {
				if (promote[model.base] !== model.name) {
					const key = `${promote[model.base]} ${model.base}`;

					if (all.has(key)) {
						all.get(key)?.push({
							id: uuidv4(),
							base: model.base,
							name: promote[model.base],
							configuration: promote,
						});
					} else {
						all.set(key, [
							{
								id: uuidv4(),
								base: model.base,
								name: promote[model.base],
								configuration: promote,
							},
						]);
					}
				}
			});
		});

		return all;
	}

	return null;
});

const commentNeeded = computed(() => {
	return props.configModel.some((el) => {
		return el.options.forceComment === true;
	});
});

/**
 * currentVersionDate
 */
const currentVersionDate = computed(() => {
	if (version.value >= 0) {
		const date = new Date(
			configurationVariablesArchive.value[version.value]?.effectiveDate,
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
		return configurationVariablesArchive.value[version.value]?.createdBy
			?.username;
	}

	return '';
});

/**
 * promoted
 */
const promoted = computed(() => {
	if (version.value >= 0) {
		return configurationVariablesArchive.value[version.value]?.promoted;
	}

	return false;
});

/**
 * userCanModify
 */
const userCanModify = computed(() => {
	if (userSt.hasAdminRights) {
		return true;
	}

	const data: any = {};

	props.configModel.forEach((el) => {
		if (el && el.name !== '__NONE__') {
			data[el.base] = el.name;
		}
	});

	for (let base of baseSt.getBases) {
		if (configurationVariables.value) {
			const permissionPrefix = `configurationModel.${base.name}.${
				data[base.name]
			}`;

			if (
				userSt.getRoles.includes(`${permissionPrefix}.view`) &&
				!userSt.getRoles.includes(`${permissionPrefix}.modify`)
			) {
				return false;
			}
		}
	}

	return userSt.getRoles.includes('configuration.modify');
});

/**
 * configurationWithCurrentArchive
 */
const configurationWithCurrentArchive = computed(() => {
	let array: Array<ConfigurationVariableToDisplay> = [];

	if (configurationVariables.value?.variables) {
		array = [...configurationVariables.value.variables];
	}

	if (constVariables.value.length > 0) {
		constVariables.value.forEach((el) => {
			const currentIndex = array.findIndex((current) => {
				return current.name === el.name;
			});

			if (currentIndex >= 0) {
				if (el.forced) {
					array[currentIndex].constantVariable = true;
					array[currentIndex].forced = true;
					array[currentIndex].value = el.value;
					array[currentIndex].valueKey = el.valueKey;
					array[currentIndex].type = el.type;
					array[currentIndex].sourceModel = el.sourceModel;
					array[currentIndex].sourceBase = el.sourceBase;
				}
			} else {
				if (el.addIfAbsent) {
					array.push({
						name: el.name,
						type: el.type,
						value: el.value,
						valueKey: el.valueKey,
						forced: el.forced,
						addIfAbsent: el.addIfAbsent,
						constantVariable: true,
						sourceBase: el.sourceBase,
						sourceModel: el.sourceModel,
					});
				}
			}
		});
	}

	if (
		configurationVariablesArchive.value.length > 0 &&
		configurationVariablesArchive.value[version.value]?.variables
	) {
		configurationVariablesArchive.value[version.value].variables.forEach(
			(archiveEl) => {
				const exists = array.some((currentEl) => {
					return archiveEl.name === currentEl.name;
				});

				if (!exists) {
					array.push({
						name: archiveEl.name,
						type: archiveEl.type,
						value: archiveEl.value,
						valueKey: archiveEl.valueKey,
						deleted: true,
					});
				}
			},
		);
	}

	array = checkForErrors(array);

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
 * configurationVariableNames
 */
const configurationVariableNames = computed(() => {
	const set = new Set();

	if (configurationVariables.value?.variables) {
		configurationVariables.value.variables.forEach((el) => {
			set.add(el.name);
		});
	}

	constVariables.value.forEach((el) => {
		if (el.addIfAbsent) {
			set.add(el.name);
		}
	});

	return Array.from(set);
});

/**
 * isDifferent
 */
const isDifferent = computed(() => {
	return isDifferentThan();
});

/**
 * differentThanShownVersion
 */
const differentThanShownVersion = computed(() => {
	return isDifferentThan(version.value);
});

/**
 * importEnabled
 */
const importEnabled = computed(() => {
	return (
		!!configurationVariables.value?.variables &&
		configurationVariables.value?.variables.length > 0
	);
});

/**
 * previewLabel
 */
const previewLabel = computed(() => {
	if (promotionCandidatePreviewConfig.value) {
		let label = '';
		const config = promotionCandidatePreviewConfig.value as any;

		for (let base of baseSt.getBases) {
			if (config[base.name]) {
				if (label) {
					label += '/';
				}
				label += config[base.name];
			}
		}

		label += ` version. ${config.version}`;

		return label;
	}

	return '';
});

//====================================================
// Methods
//====================================================
/**
 * getConfiguration
 */
const getConfiguration = async () => {
	configurationVariables.value = null;
	constVariables.value = [];
	configurationModelRules.value = [];
	configurationVariablesArchive.value = [];
	localPromotionCandidates.value = [];
	version.value = -1;

	const rowsLimit = 20;

	if (!props.configModel) {
		return;
	}

	const allEmpty = !props.configModel.some((el) => {
		return el;
	});

	if (allEmpty) {
		return;
	}

	loading.value = true;

	const rulesFilter: any = {
		where: { or: [], rules: { $gt: { $size: 0 } } },
	};

	const filter: any = {
		order: 'effectiveDate DESC',
		limit: rowsLimit,
		include: ['member'],
		where: {},
	};

	const constVariablesWhere: any = {};

	baseSt.getBases.forEach((el) => {
		filter.where[`__metadata.${el.name}`] = { $eq: null };
	});

	props.configModel.forEach((el) => {
		if (el && el.name !== '__NONE__') {
			filter.where[`__metadata.${el.base}`] = el.name;
			rulesFilter.where.or.push({ name: el.name });
			constVariablesWhere[`${el.base}`] = el.name;
		}
	});

	try {
		const request = towerAxios.get(
			`configurations?filter=${JSON.stringify(filter, null, '')}`,
		);

		const countFilter = cloneDeep(filter);
		countFilter.limit = undefined;
		countFilter.order = undefined;

		const countRequest = towerAxios.get(
			`configurations/count?filter=${JSON.stringify(countFilter, null, '')}`,
		);

		const constVariablesRequest = towerAxios.get(
			`constantVariables/findLatest?filter=${JSON.stringify(
				constVariablesWhere,
				null,
				'',
			)}`,
		);

		const configurationModelRequest = towerAxios.get(
			`configurationModels?filter=${JSON.stringify(rulesFilter, undefined, '')}`,
		);

		let response, constVariablesResponse, configurationModelResponse;

		const fullResponse = await Promise.all([
			request,
			constVariablesRequest,
			configurationModelRequest,
			countRequest,
		]);
		response = fullResponse[0];
		constVariablesResponse = fullResponse[1];
		configurationModelResponse = fullResponse[2];

		const count = fullResponse[3];

		if (response.status === 200) {
			configurationVariables.value = null;
			configurationVariablesArchive.value = [];
			if (response.data.length > 0) {
				// Deep copy
				configurationVariables.value = structuredClone(response.data[0]);
				if (count.data > rowsLimit) {
					configurationVariablesArchive.value = [
						...[...Array(count.data - rowsLimit).keys()].map(() => {
							return {} as Configuration;
						}),
						...response.data.reverse(),
					];
				} else {
					configurationVariablesArchive.value = [...response.data.reverse()];
				}

				if (configurationVariablesArchive.value.length > 0) {
					version.value = count.data - 1;

					if (userCanModify.value) {
						getPromotionCandidates()
							.then(() => {
								// Ignore async
							})
							.catch(() => {
								// Ignore errors
							});
					}
				}
			}
		}

		if (constVariablesResponse.status === 200) {
			constVariables.value = constVariablesResponse.data;
			constVariables.value.map((el) => {
				el.currentType = el.type;
				el.currentValue = el.value;
				el.from = '';
				baseSt.getBases.forEach((base) => {
					if ((el as any)[base.name]) {
						if (el.from) {
							el.from = (el as any)[base.name];
						} else {
							el.from += `/${(el as any)[base.name]}`;
						}
					}
				});
			});
		}

		if (
			configurationModelResponse.status === 200 &&
			configurationModelResponse.data.length > 0
		) {
			configurationModelResponse.data.forEach((el: ConfigurationModel) => {
				configurationModelRules.value = [
					...configurationModelRules.value,
					...el.rules,
				];
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

	loading.value = false;
};

/**
 * configurationArchiveVersion
 * @param variableName
 */
const configurationArchiveVersion = (variableName: string) => {
	if (
		version.value < 0 ||
		!configurationVariablesArchive.value[version.value]
	) {
		return undefined;
	}

	const variables =
		configurationVariablesArchive.value[version.value].variables;
	return variables.find((el) => {
		return el.name === variableName;
	});
};

/**
 * addNewVariable
 */
const addNewVariable = (variable: ConfigurationVariable) => {
	if (!configurationVariables.value) {
		configurationVariables.value = {
			createdBy: undefined,
			description: '',
			draft: false,
			effectiveDate: new Date(),
			version: -1,
			id: '',
			promoted: false,
			variables: [],
		};
	}
	if (
		!configurationVariables.value?.variables.some((el) => {
			return el.name === variable.name;
		})
	) {
		configurationVariables.value?.variables.push(variable);
	}
};

/**
 * removeVariable
 */
const removeVariable = (name: string) => {
	if (configurationVariables.value) {
		configurationVariables.value.variables =
			configurationVariables.value.variables.filter((el) => {
				return el.name !== name;
			});
	}
};

/**
 * checkForErrors
 */
const checkForErrors = (array: Array<ConfigurationVariableToDisplay>) => {
	hasErrors.value = false;

	if (configurationModelRules.value.length > 0) {
		array.map((el) => {
			el.error = undefined;
			return el;
		});

		array.map((el) => {
			if (el.constantVariable && el.forced) {
				return el;
			}

			const anyEl: any = el;
			configurationModelRules.value.forEach((rule) => {
				let valid = false;

				if (rule.targetRegEx) {
					const regEx = new RegExp(rule.targetValue);
					if (regEx.test(anyEl[rule.targetType])) {
						valid = true;
					}
				} else {
					if (anyEl[rule.targetType] === rule.targetValue) {
						valid = true;
					}
				}

				if (valid) {
					if (rule.conditionRegEx) {
						const regEx = new RegExp(rule.conditionValue);
						if (!regEx.test(valueAsString(anyEl[rule.conditionType]))) {
							el.error = rule.error;
							hasErrors.value = true;
							return el;
						}
					} else {
						if (
							valueAsString(anyEl[rule.conditionType]) !== rule.conditionValue
						) {
							el.error = rule.error;
							hasErrors.value = true;
							return el;
						}
					}
				}
			});
		});
	}

	return array;
};

const showCommentsDialog = () => {
	comment.value = '';
	commentsDialog.value = true;
};

/**
 * saveConfiguration
 */
const saveConfiguration = async () => {
	if (configurationVariables.value?.variables) {
		loading.value = true;

		let response = null;
		try {
			const data: any = {
				variables: configurationVariables.value?.variables,
				promoted: false,
				description: '',
				draft: false,
				comment: comment.value,
			};
			props.configModel.forEach((el) => {
				if (el && el.name !== '__NONE__') {
					data[el.base] = el.name;
				}
			});

			response = await towerAxios.post('/configurations', data);
		} catch (err) {
			let error = (err as any).message;

			if (err instanceof AxiosError) {
				error = err.response?.data?.message
					? err.response?.data?.message
					: err.message;
			}

			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: `Error saving configuration data: ${error}`,
			});
		}

		if (response && response.status === 201) {
			$q.notify({
				color: 'positive',
				position: 'top',
				textColor: 'secondary',
				message: 'Configuration saved successfully',
			});
			await getConfiguration();
		}

		loading.value = false;
	}
};

/**
 * exportConfiguration
 */
const exportConfiguration = () => {
	if (!configurationVariables.value?.variables) {
		return;
	}

	let exportDetails: ImportDetails | null | string;

	exportDetails = exportJSON();
	return JSON.stringify(exportDetails);
};

/**
 * importJSON
 */
const exportJSON = () => {
	const obj: ImportDetails = {
		configurationVariables: [],
	};

	configurationVariables.value?.variables.forEach((el) => {
		if (obj.configurationVariables) {
			obj.configurationVariables.push({
				name: el.name,
				type: el.type,
				value: el.value,
			});
		}
	});

	return obj;
};

/**
 * importConfiguration
 * @param importDetails
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
		if (
			!data.configurationVariables ||
			data.configurationVariables.length === 0
		) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message:
					'Error importing configuration - configuration data not present',
			});

			return;
		}
		if (!configurationVariables.value) {
			configurationVariables.value = {
				createdBy: undefined,
				description: '',
				draft: false,
				effectiveDate: new Date(),
				version: -1,
				id: '',
				promoted: false,
				variables: [],
			};
		}

		const newVariables: Array<ConfigurationVariable> = [];

		data.configurationVariables.forEach((el: ConfigurationVariable) => {
			newVariables.push({
				name: el.name,
				type: el.type,
				value: valueConverter(el.value, el.type),
			});
		});

		configurationVariables.value.variables = newVariables;

		$q.notify({
			color: 'positive',
			position: 'top',
			textColor: 'secondary',
			message: 'Configuration imported successfully',
		});
	}
};

/**
 * isDifferentThan
 */
const isDifferentThan = (versionToCheck?: number) => {
	if (
		(configurationVariablesArchive.value.length === 0 &&
			configurationVariables.value?.variables.length === 0) ||
		!configurationVariablesArchive.value[version.value]?.variables
	) {
		return false;
	}

	if (
		configurationVariablesArchive.value.length === 0 &&
		configurationVariables.value?.variables.length !== 0 &&
		!!configurationVariables.value
	) {
		return true;
	}

	versionToCheck = !isNil(versionToCheck)
		? versionToCheck
		: configurationVariablesArchive.value.length - 1;

	if (configurationVariablesArchive.value.length > 0) {
		const currentVariables =
			configurationVariablesArchive.value[versionToCheck];

		if (
			currentVariables.variables?.length !==
			configurationVariables.value?.variables.length
		) {
			return true;
		}

		const isDiff = currentVariables.variables.some((el) => {
			const local = configurationVariables.value?.variables.find((Var) => {
				return Var.name === el.name;
			});

			if (!local) {
				return true;
			} else {
				const asConstVariable = local as ConfigurationVariableToDisplay;
				if (asConstVariable.constantVariable && asConstVariable.forced) {
					return false;
				}

				if (local.type === ConfigurationVariableType.AWS) {
					return (
						local.type !== el.type ||
						local.valueKey !== el.valueKey ||
						local.value !== el.value
					);
				} else if (local.type === ConfigurationVariableType.LIST) {
					const localArray = valueConverter(
						local.value,
						ConfigurationVariableType.STRING,
					);
					const elArray = valueConverter(
						el.value,
						ConfigurationVariableType.STRING,
					);
					return local.type !== el.type || elArray !== localArray;
				} else {
					if (local.type !== el.type) {
						return true;
					}

					const localValue = valueConverter(local.value, local.type);
					const elValue = valueConverter(el.value, el.type);

					return localValue !== elValue;
				}
			}
		});

		if (isDiff) {
			return true;
		}
	}

	return false;
};

/**
 * fullRevert
 */
const fullRevert = () => {
	if (configurationVariables.value) {
		configurationVariables.value.variables = cloneDeep(
			configurationVariablesArchive.value[version.value].variables,
		);
	}
};

/**
 * promoteConfiguration
 */
const promoteConfiguration = async () => {
	if (configurationVariables.value) {
		configurationVariablesArchive.value[version.value].promoted = true;

		try {
			await towerAxios.post(
				`/configurations/${
					configurationVariablesArchive.value[version.value]._id
				}/promote`,
			);
		} catch (e) {
			configurationVariablesArchive.value[version.value].promoted = false;

			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error promoting configuration',
			});
		}
	}
};

/**
 * promote
 */
const promote = () => {
	if (localPromotionCandidates.value && promotionCandidatesCategories.value) {
		let promoteFrom: Configuration | null = null;

		for (const array of promotionCandidatesCategories.value.values()) {
			for (let el of array) {
				if (el.id === activePromotionCandidate.value) {
					promoteFrom = el.configuration;
					break;
				}
			}
			if (promoteFrom) {
				break;
			}
		}

		if (promoteFrom && configurationVariables.value) {
			configurationVariables.value.variables = [];
			promoteFrom.variables.forEach((variable) => {
				configurationVariables.value?.variables.push({
					name: variable.name,
					type: variable.type,
					value:
						variable.type !== ConfigurationVariableType.LIST
							? variable.value
							: [...(variable.value as Array<string>)],
				});
			});
		}
	}
};

/**
 * getPromotionCandidates
 */
const getPromotionCandidates = async () => {
	const model: any = {};

	baseSt.getBases.forEach((el) => {
		model[el.name] = { $eq: null };
	});

	props.configModel.forEach((el) => {
		if (el && el.name !== '__NONE__') {
			model[el.base] = el.name;
		}
	});

	const response = await towerAxios.post(
		'/configurations/promotionCandidates',
		model,
	);

	if (response.status === 200) {
		localPromotionCandidates.value = response.data;
	}
};

/**
 * showPromotionCandidatesDialog
 */
const showPromotionCandidatesDialog = async () => {
	promotionCandidatesDialog.value = true;
};

/**
 * setActivePromotionCandidate
 */
const setActivePromotionCandidate = (id: string) => {
	if (activePromotionCandidate.value === id) {
		activePromotionCandidate.value = '';
	} else {
		activePromotionCandidate.value = id;
	}
};

/**
 * showPromotionCandidatePreviewDialog
 */
const showPromotionCandidatePreviewDialog = (
	event: MouseEvent,
	config: Configuration,
) => {
	event.stopPropagation();

	promotionCandidatesPreviewDialog.value = true;
	promotionCandidatePreviewConfig.value = config;
};

//====================================================
// Watch
//====================================================
watch(() => props.configModel, getConfiguration, {
	immediate: false,
	deep: true,
});

watch(
	isDifferent,
	(current: boolean) => {
		if (current && !loading.value) {
			navigationSt.preventNavigation();
		} else {
			navigationSt.allowNavigation();
		}
	},
	{ immediate: true },
);

watch(localPromotionCandidates, (current) => {
	emit('update:promotionCandidates', current);
});

watch(version, async (current) => {
	if (
		configurationVariablesArchive.value[current] &&
		!configurationVariablesArchive.value[current].variables
	) {
		loading.value = true;

		const rulesFilter: any = {
			where: { or: [], rules: { $gt: { $size: 0 } } },
		};

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
			if (el && el.name !== '__NONE__') {
				filter.where[el.base] = el.name;
				rulesFilter.where.or.push({ name: el.name });
			}
		});

		try {
			const request = await towerAxios.get(
				`configurations?filter=${JSON.stringify(filter, null, '')}`,
			);

			if (request.status === 200) {
				configurationVariablesArchive.value[current] = request.data[0];
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

		loading.value = false;
	}
});

//====================================================
// Expose
//====================================================
defineExpose({
	importConfiguration,
	exportConfiguration,
	importEnabled,
	userCanModify,
	showPromotionCandidatesDialog,
});
</script>

<style scoped>
.tower-max-height {
	overflow: auto;
	max-height: calc(100vh - 22rem);
}

.tower-max-height-readOnly {
	overflow: auto;
	max-height: calc(100vh - 14rem);
}

.tower-min-height {
	min-height: calc(100vh - 18rem);
}
</style>
