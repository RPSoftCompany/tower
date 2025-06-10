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
			<q-card-section class="tw-bg-dark">
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
		class="tw-bg-darkPage tw-text-secondary tw-gap-3 row tw-pt-2 tw-rounded tw-flex-1 tw-grow tw-max-h-full"
		flat
	>
		<q-inner-loading :showing="loading">
			<q-spinner-clock color="secondary" size="3em" />
			<div class="tw-mt-3">Please wait, loading...</div>
		</q-inner-loading>
		<div
			v-if="
				configurationWithCurrentArchive.length === 0 &&
				configurationVariablesArchive.length === 0 &&
				!loading &&
				!filter
			"
			class="tw-w-full tw-flex tw-justify-center tw-items-center"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				There are no variables in this configuration
				<div
					class="tw-text-center tw-text-xs tw-text-gray-500"
					v-if="userCanModify"
				>
					You can create one using the panel below
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
			v-if="
				!loading &&
				(configurationWithCurrentArchive.length > 0 ||
					configurationVariablesArchive.length > 0)
			"
			class="tw-w-full tw-flex tw-flex-col tw-max-h-full"
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
					<div class="tw-place-content-center tw-min-w-max">
						<q-btn
							:disable="version <= 0 || loading"
							class="tw-flex-none"
							flat
							icon="sym_o_first_page"
							padding="sm"
							@click="version = 0"
						>
							<q-tooltip :delay="1000" v-if="version > 0"
								>Go to the first version</q-tooltip
							>
						</q-btn>
						<q-btn
							:disable="version <= 0 || loading"
							class="tw-flex-none"
							flat
							icon="sym_o_chevron_left"
							padding="sm"
							@click="version--"
						>
							<q-tooltip :delay="1000" v-if="version > 0">
								Go to the {{ toOrdinal(version) }} version
							</q-tooltip>
						</q-btn>
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
								<q-tooltip v-if="!promoted" :delay="1000">Promote</q-tooltip>
							</q-btn>
							<q-separator inset vertical />
						</div>
						<div class="tw-mr-3 tw-self-center text-center">
							<div>
								Version #{{ version + 1 }}, created
								{{ currentVersionDate }}
							</div>
							<div
								class="tw-text-center tw-text-gray-600 tw-font-light tw-text-xs"
							>
								created by
								<div class="tw-font-medium tw-min-w-fit tw-break-all">
									{{ currentVersionAuthor }}
								</div>
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
								<q-tooltip v-if="differentThanShownVersion" :delay="1000"
									>Revert to this version
								</q-tooltip>
							</q-btn>
						</div>
					</div>
					<div class="tw-place-content-center tw-min-w-max">
						<q-btn
							:disable="version >= configurationVariablesArchive.length - 1"
							class="tw-flex-none"
							flat
							icon="sym_o_chevron_right"
							padding="sm"
							@click="version++"
						>
							<q-tooltip
								:delay="1000"
								v-if="version !== configurationVariablesArchive.length - 1"
								>Go to the {{ toOrdinal(version + 2) }} version</q-tooltip
							>
						</q-btn>
						<q-btn
							:disable="version >= configurationVariablesArchive.length - 1"
							flat
							icon="sym_o_last_page"
							padding="sm"
							@click="showLastVersion"
						>
							<q-tooltip
								:delay="1000"
								v-if="version !== configurationVariablesArchive.length - 1"
								>Go to the latest version</q-tooltip
							>
						</q-btn>
					</div>
				</div>
				<div
					:class="{ 'tw-col-span-2': configurationVariablesArchive.length > 0 }"
					class="tw-text-center tw-w-full"
				>
					Value
				</div>
			</div>
			<q-intersection
				v-if="
					configurationWithCurrentArchive.length === 0 &&
					configurationVariablesArchive.length > 0 &&
					!loading &&
					!filter
				"
				transition="fade"
				class="tw-w-full tw-h-full tw-my-auto tw-flex tw-justify-center tw-items-center"
			>
				<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
					There are no configuration variables in this version or the latest
					configuration
					<div
						class="tw-text-center tw-text-xs tw-text-gray-500"
						v-if="userCanModify"
					>
						There is no existing data set that can be used for comparison.
					</div>
				</div>
			</q-intersection>
			<q-intersection
				:class="{
					'tw-col-span-2': configurationVariablesArchive.length > 0,
				}"
				class="tw-overflow-auto"
				transition="fade"
				v-else
			>
				<q-intersection
					v-for="row of configurationWithCurrentArchive"
					:key="row.name"
					class="tower-configuration-row"
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
			</q-intersection>
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
						v-if="!loading"
						:has-errors="hasErrors"
						:save-enabled="isDifferent && !loading"
						@saveClicked="
							commentNeeded ? showCommentsDialog() : saveConfiguration()
						"
					/>
				</transition>
			</div>
		</div>
	</q-card>
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

let currentConfigurationFilter: any = {};

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
 * Computed variable that generates and categorizes promotion candidate configurations.
 *
 * This variable computes a mapping of categorized promotion candidates based on the input data.
 * It processes the `localPromotionCandidates` against `configModel` to create groups of candidate
 * configurations under specific category keys. Each candidate configuration includes an ID, base,
 * name, and details of the candidate's full configuration.
 *
 * The computed value is derived as follows:
 * - If `localPromotionCandidates` is not empty, for each candidate, the function iterates through
 *   `configModel` to categorize candidates based on a composed key (`[value] [base]`).
 * - If a category for the key exists, the corresponding candidate is added to the category.
 * - If the category does not exist, a new category is created with the candidate added to it.
 * - Each candidate configuration includes a unique ID generated using `uuidv4`, the base property,
 *   corresponding name, and the raw candidate configuration.
 * - If `localPromotionCandidates` is empty, the computed value is `null`.
 *
 * @return {Map<string, Array<any>> | null} A map object where keys represent categories and values
 * represent arrays of promotion candidate configurations, or null if no candidates are available.
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

/**
 * A computed property that evaluates whether a comment is required based on the `configModel` property
 * in the `props` object. The computation iterates through the elements of `configModel` and determines
 * if any of the elements have their `options.forceComment` property set to `true`.
 *
 * The result will be `true` if at least one element in `configModel` meets the condition; otherwise, `false`.
 *
 * Dependencies:
 * - `props.configModel`: An array where each element is inspected to check the `forceComment` property.
 *
 * Returns:
 * - {boolean} `true` if a comment is needed as determined by the `forceComment` property of an element in `configModel`.
 *   Otherwise, `false`.
 */
const commentNeeded = computed(() => {
	return props.configModel.some((el) => {
		if (el) {
			return el.options.forceComment === true;
		}
	});
});

/**
 * A computed property that determines the current version's effective date.
 * If the `version.value` is non-negative, it retrieves the effective date from the
 * `configurationVariablesArchive` based on the `version.value` and formats it as
 * a localized string. Otherwise, it returns the current date.
 *
 * Dependencies:
 * - `version.value`: The current version index.
 * - `configurationVariablesArchive.value`: The archive containing configuration variables
 *   with effective dates mapped by version indices.
 *
 * Returns:
 * - {string} The localized string representation of the effective date for the current version
 *   or the current date if no valid version is provided.
 */
const currentVersionDate = computed(() => {
	if (version.value >= 0) {
		const effectiveDate =
			configurationVariablesArchive.value[version.value]?.effectiveDate;
		if (effectiveDate) {
			const date = new Date(effectiveDate);
			return date.toLocaleString();
		}
	}

	return new Date().toLocaleString();
});

/**
 * Represents the author of the current version based on the provided configuration variables and version.
 * The value is computed dynamically and determines the author's identity based on the type of the `createdBy` field.
 * If the `createdBy` type is 'ldap', it returns the display name; otherwise, it returns the username.
 * If no valid author is found or version is invalid, it returns an empty string.
 */
const currentVersionAuthor = computed(() => {
	if (version.value >= 0) {
		const createdBy =
			configurationVariablesArchive.value[version.value]?.createdBy;

		if (createdBy) {
			return createdBy.type === 'ldap' ? createdBy.display : createdBy.username;
		}
	}

	return '';
});

/**
 * A computed property that determines if a specific version of a configuration variable
 * is marked as promoted. The `promoted` property is retrieved from an archive of configuration
 * variables based on the current version value.
 *
 * If the `version` value is less than 0, the returned value will be `false`.
 * Otherwise, the promoted status is extracted from the corresponding record in the
 * `configurationVariablesArchive`, indexed by the `version` value.
 *
 * Dependencies:
 * - `version.value`: Represents the current version index.
 * - `configurationVariablesArchive.value`: An archive containing configuration variable records.
 *
 * @type {import('vue').ComputedRef<boolean>}
 */
const promoted = computed(() => {
	if (version.value >= 0) {
		return configurationVariablesArchive.value[version.value]?.promoted;
	}

	return false;
});

/**
 * A computed property that determines if a user has permission to modify a configuration.
 *
 * The variable evaluates the user's administrative rights and role-based permissions in the context of the provided configuration model.
 * It checks the following conditions:
 * - If the user has administrative rights, they are granted modify access without further checks.
 * - If the user lacks administrative rights, the function iterates through the configuration model and associated roles for the bases.
 * - If the user has view permission but lacks modify permission for any configuration model base, modify access is denied.
 * - Otherwise, modify access is determined based on the presence of a specific role (`configuration.modify`).
 *
 * This property is useful for implementing fine-grained access control in applications where permissions are calculated dynamically based on roles and configuration details.
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
 * A computed property that dynamically generates and returns a list of configuration variables,
 * incorporating modifications, constant variables, archived variables, and filtering logic based on the provided states or properties.
 *
 * The resulting array consists of configuration variables prioritizing current variables, constant variables,
 * and archived variables while applying filters, sorting, and error-checking logic where applicable.
 *
 * The computation includes:
 * - Combining the current configuration variables with additional constant variables and archived variables.
 * - Updating variable details (e.g., type, value, source) if certain conditions are met, such as `forced` state.
 * - Adding missing variables from constant variables or archive if the `addIfAbsent` condition is present.
 * - Marking archived variables that no longer exist in the current configuration as `deleted`.
 * - Checking for any errors in configuration and sorting the resulting list by variable names in a case-insensitive manner.
 * - Applying a user-provided filter to the variable name, type, or value.
 *
 * The computed array of configuration variables is designed to account for multiple data sources while ensuring consistency and flexibility.
 *
 * @return {Array<ConfigurationVariableToDisplay>} The processed and filtered list of configuration variables to display.
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
				if (el.forced && array[currentIndex]) {
					array[currentIndex].constantVariable = true;
					array[currentIndex].forced = true;
					array[currentIndex].value = el.value;
					array[currentIndex].valueKey = el.valueKey ?? '';
					array[currentIndex].type = el.type;
					array[currentIndex].sourceModel = el.sourceModel ?? '';
					array[currentIndex].sourceBase = el.sourceBase ?? '';
				}
			} else {
				if (el.addIfAbsent) {
					array.push({
						name: el.name ?? '',
						type: el.type ?? ConfigurationVariableType.STRING,
						value: el.value,
						valueKey: el.valueKey ?? '',
						forced: el.forced ?? false,
						addIfAbsent: el.addIfAbsent ?? false,
						constantVariable: true,
						sourceBase: el.sourceBase ?? '',
						sourceModel: el.sourceModel ?? '',
					});
				}
			}
		});
	}

	if (
		configurationVariablesArchive.value.length > 0 &&
		configurationVariablesArchive.value[version.value] &&
		configurationVariablesArchive.value[version.value]?.variables
	) {
		configurationVariablesArchive.value[version.value]?.variables.forEach(
			(archiveEl) => {
				const exists = array.some((currentEl) => {
					return archiveEl.name === currentEl.name;
				});

				if (!exists) {
					array.push({
						name: archiveEl.name,
						type: archiveEl.type,
						value: archiveEl.value,
						valueKey: archiveEl.valueKey ?? '',
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
 * A computed property that generates a unique list of configuration variable names.
 * It collects variable names from two sources: `configurationVariables.value?.variables`
 * and `constVariables.value`. The names are added to a `Set` to ensure uniqueness.
 *
 * If `configurationVariables.value?.variables` exists, their `name` properties are
 * added to the `Set`. Additionally, for each element in `constVariables.value`,
 * the `name` is added to the `Set` if the `addIfAbsent` property of the element is `true`.
 *
 * The `Set` is then converted to an array and returned.
 *
 * @type {import('vue').ComputedRef<string[]>}
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
 * A computed property that determines whether a specific condition or state is different
 * based on the result of the `isDifferentThan` function. The value updates reactively
 * whenever the dependencies of the computed property change.
 *
 * @type {boolean}
 */
const isDifferent = computed(() => {
	return isDifferentThan();
});

/**
 * A computed property that evaluates whether the current version differs from the shown version.
 *
 * The property depends on a reactive `version` value and determines if it is different
 * based on the result of the `isDifferentThan` function.
 *
 * @type {import('vue').ComputedRef<boolean>}
 */
const differentThanShownVersion = computed(() => {
	return isDifferentThan(version.value);
});

/**
 * Reactive computed property that determines if the import functionality is enabled.
 * The value is derived based on the existence and non-empty state of the `variables` in the
 * `configurationVariables` object.
 *
 * @type {boolean}
 */
const importEnabled = computed(() => {
	return (
		!!configurationVariables.value?.variables &&
		configurationVariables.value?.variables.length > 0
	);
});

/**
 * A computed property that generates a label string based on the promotion candidate preview configuration.
 *
 * The label is constructed by iterating over the bases provided by `baseSt.getBases` and appending base-specific
 * information from the `promotionCandidatePreviewConfig` object. If multiple base information exists, they are
 * separated by a forward slash. Additionally, the version from the configuration is appended to the label string.
 *
 * If the `promotionCandidatePreviewConfig` is not defined or does not exist, the computed property resolves to
 * an empty string.
 *
 * @type {import('vue').ComputedRef<string>}
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
 * Asynchronously fetches and processes configuration data for a given system setup.
 * This function retrieves data from multiple API endpoints, applies filtering, processes the retrieved
 * data, and updates corresponding variables in the current state of the application.
 *
 * The function handles configuration model rules, constant variables, and configuration history
 * and applies base-specific and metadata-based filtering criteria. Additionally, it manages potential
 * promotions if the user has modification permissions for the loaded configurations.
 *
 * Key operations:
 * - Initializes various configuration-related variables and sets up filtering parameters.
 * - Validates the presence of a `configModel` in the provided properties.
 * - Fetches configuration data, rules, count, and constant variables from the server using
 *   parallel API requests.
 * - Processes the retrieved data to update state variables such as `configurationVariables`,
 *   `configurationModelRules`, and `constVariables`.
 * - Notifies the user in case of data-fetching errors.
 *
 * The function also handles additional scenarios:
 * - Maintains a local archive of configuration records for history purposes.
 * - Adjusts the current configuration version based on received data.
 * - Handles specific criteria for constant variables and updates their properties based
 *   on associated metadata.
 * - Initiates promotion candidate fetching asynchronously if modification permissions are enabled.
 *
 * @function
 * @async
 *
 * @returns {Promise<void>} Resolves when the configuration data has been successfully processed and
 * state variables have been updated. Handles errors internally and does not return any result or throw errors.
 */
const getConfiguration = async () => {
	configurationVariables.value = null;
	constVariables.value = [];
	configurationModelRules.value = [];
	configurationVariablesArchive.value = [];
	localPromotionCandidates.value = [];
	version.value = -1;
	currentConfigurationFilter = {};

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

	currentConfigurationFilter = filter;

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
 * Retrieves a configuration variable by its name from the archived configuration versions.
 *
 * This function searches for a specific variable within the archived configuration versions
 * based on the provided variable name. If the archive does not contain the desired configuration
 * version or the version is invalid, it will return `undefined`.
 *
 * @param {string} variableName - The name of the variable to be retrieved from the archive.
 * @returns {Object|undefined} The configuration variable object if found, otherwise `undefined`.
 */
const configurationArchiveVersion = (variableName: string) => {
	if (
		version.value < 0 ||
		!configurationVariablesArchive.value[version.value]
	) {
		return undefined;
	}

	const variables =
		configurationVariablesArchive.value[version.value]?.variables;
	return variables?.find((el) => {
		return el.name === variableName;
	});
};

/**
 * Adds a new variable to the configuration if it does not already exist.
 *
 * This function checks if the provided variable exists in the list of variables
 * stored in `configurationVariables`. If the variable does not exist, it is added
 * to the list. If `configurationVariables.value` is not initialized, it initializes
 * the configuration with default values before attempting to add the variable.
 *
 * @param {ConfigurationVariable} variable - The variable to be added to the configuration.
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
 * Removes a variable with the specified name from the configuration variables list.
 *
 * This function modifies the `configurationVariables` object by filtering out
 * the variable with the given name from its `variables` array, if it exists.
 *
 * @param {string} name - The name of the variable to be removed.
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
 * Validates an array of configuration variables against predefined rules and assigns error messages if validation fails.
 *
 * The function checks each configuration variable in the provided array against a set of rules. If a variable does not satisfy
 * the conditions specified in the rules, it assigns an error message to the variable and indicates that errors were found by
 * updating the `hasErrors.value` flag.
 *
 * Rules may include:
 * - Matching specific values or regular expressions for a target property of the variable.
 * - Validating conditions for specific properties based on matching rules.
 *
 * Variables with `constantVariable` and `forced` properties are exempt from validation.
 *
 * @param {Array<ConfigurationVariableToDisplay>} array - The array of configuration variables to validate.
 * @returns {Array<ConfigurationVariableToDisplay>} The array of configuration variables, which may include error messages for invalid entries.
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

/**
 * A function that resets the comment field and displays the comments dialog.
 *
 * Resets the value of the `comment` variable to an empty string
 * and sets the `commentsDialog` variable to `true` to trigger the display
 * of the dialog interface for comments.
 */
const showCommentsDialog = () => {
	comment.value = '';
	commentsDialog.value = true;
};

/**
 * Asynchronously saves the current configuration to the server.
 *
 * This function checks whether a configuration with a higher version already exists.
 * If a newer version exists, it aborts the save operation and fetches the latest configuration.
 * Otherwise, it attempts to save the provided configuration variables along with additional metadata.
 *
 * Notifications are displayed to the user to indicate the status of the operation, such as:
 * - Errors encountered during the save process.
 * - Successful completion of the operation.
 *
 * Dependencies:
 * - Axios for making HTTP requests.
 * - Quasar's notification system ($q.notify) for user feedback.
 *
 * The process includes:
 * - Verifying if the configuration version matches the latest version.
 * - Constructing a payload for the save operation based on defined variables and metadata.
 * - Sending the payload to the server via a POST request.
 * - Handling responses or errors from the server.
 *
 * The function updates UI indicators like loading states and fetches the configuration data
 * after a successful save or when an error necessitates version synchronization.
 *
 * Note: Handles async operations with proper use of `try-catch` blocks and async/await syntax.
 */
const saveConfiguration = async () => {
	// Check if configuration with a higher version exists already
	currentConfigurationFilter.limit = 1;
	const currentConfigurationRequest = await towerAxios.get(
		`configurations?filter=${JSON.stringify(currentConfigurationFilter, null, '')}`,
	);

	if (
		currentConfigurationRequest.status === 200 &&
		currentConfigurationRequest.data[0]
	) {
		let currentVersion = 0;
		if (
			configurationVariablesArchive.value &&
			configurationVariablesArchive.value.length > 0
		) {
			currentVersion =
				configurationVariablesArchive.value[
					configurationVariablesArchive.value.length - 1
				]?.version ?? 0;
		}

		if (currentVersion !== currentConfigurationRequest.data[0].version) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Trying to update old configuration version, save aborted',
			});

			await getConfiguration();

			return;
		}
	}

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
 * Exports the current configuration in JSON format.
 *
 * This function checks if the required configuration variables are available.
 * If they are present, it retrieves the export details through `exportJSON` and
 * returns the serialized JSON string representation of the configuration.
 * If configuration variables are missing, the function returns undefined.
 *
 * @function
 * @returns {string|undefined} The exported configuration as a JSON string, or undefined if the configuration is not available.
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
 * Exports configuration variables in JSON format.
 *
 * The function processes a list of configuration variables and creates an object that includes the name, type,
 * and value of each variable. It returns the constructed object containing these details.
 *
 * @returns {ImportDetails} A JSON object containing the exported configuration variables
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
 * Imports and processes configuration data from a file.
 *
 * This function parses configuration data, validates its structure, and updates the application's variable store if the data is valid.
 * If the imported data is invalid or missing key components, appropriate error notifications are displayed to the user.
 *
 * @param {Import} importDetails - The import details containing the file data to be parsed.
 * @throws Will notify the user if the file data cannot be parsed or if the configuration data is invalid or incomplete.
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
 * Determines whether the current state of configuration variables differs from a given archived state or from the latest archive.
 *
 * The function evaluates discrepancies between the `configurationVariables` and `configurationVariablesArchive` values based on several conditions:
 * - If no archived or current configuration variables exist, returns `false`.
 * - If there are no archived variables, but the current configuration variables are present, returns `true`.
 * - Compares a specific version of the archive (determined by the `versionToCheck` parameter or defaults to the latest archive version) with the current variables to identify differences, such as:
 *   - Variation in the number of variables.
 *   - Differences in variable properties, including `type`, `valueKey`, `value`, or specific transformations for `AWS` or `LIST` variable types.
 *   - Excludes constant variables that are marked as forced.
 *
 * @param {number} [versionToCheck] - An optional version index of the archived configuration variables to compare against. Defaults to the last version in the archive if not provided.
 * @returns {boolean} - Returns `true` if differences are detected, otherwise `false`.
 */
const isDifferentThan = (versionToCheck?: number) => {
	if (
		configurationVariablesArchive.value.length === 0 &&
		configurationVariables.value?.variables.length === 0
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
			currentVariables?.variables?.length !==
			configurationVariables.value?.variables.length
		) {
			return true;
		}

		const isDiff = currentVariables?.variables.some((el) => {
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
 * Restores the `configurationVariables` to the state stored in the archive for a specific version.
 * This method clones the variables associated with the specified version in the archive and assigns them
 * to the current `configurationVariables`. No operation is performed if the `configurationVariables` or
 * the archive for the desired version is undefined.
 *
 * The restoration is deep to avoid mutating the archived data or introducing unintended shared references.
 */
const fullRevert = () => {
	if (configurationVariables.value) {
		const variables = cloneDeep(
			configurationVariablesArchive.value[version.value]?.variables,
		);
		if (variables) {
			configurationVariables.value.variables = variables;
		}
	}
};

/**
 * Asynchronously promotes a configuration version if certain conditions are met.
 *
 * This function checks if specific configuration variables and their archive are present and properly defined.
 * It updates the configuration version's promotion status and notifies the user of the operation's success or failure.
 * If an error occurs during the promotion process, the promotion status is rolled back and an error notification is displayed.
 *
 * The promotion request is sent to the server using a `POST` request to the specified endpoint for the targeted configuration version.
 * Notifications are shown to indicate whether the promotion succeeded or failed.
 */
const promoteConfiguration = async () => {
	if (
		configurationVariables.value &&
		configurationVariablesArchive.value &&
		configurationVariablesArchive.value[version.value]
	) {
		const archiveConfig = configurationVariablesArchive.value[version.value];
		if (archiveConfig && 'promoted' in archiveConfig) {
			archiveConfig.promoted = true;
		}

		try {
			await towerAxios.post(
				`/configurations/${
					configurationVariablesArchive.value[version.value]?._id
				}/promote`,
			);
		} catch (e) {
			const archiveConfig = configurationVariablesArchive.value[version.value];
			if (archiveConfig && 'promoted' in archiveConfig) {
				archiveConfig.promoted = false;
			}

			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error promoting configuration',
			});

			return;
		}

		$q.notify({
			color: 'positive',
			position: 'top',
			textColor: 'secondary',
			message: 'Configuration has been promoted successfully',
		});
	}
};

/**
 * Handles the promotion process by selecting a candidate's configuration
 * and updating configuration variables accordingly.
 *
 * This function evaluates the available promotion candidates and their categories.
 * It identifies the currently active promotion candidate based on its ID
 * and retrieves its associated configuration. Once identified, it updates
 * the `configurationVariables` collection by replacing existing variables
 * with those from the active promotion candidate's configuration.
 *
 * Preconditions:
 * - `localPromotionCandidates.value` and `promotionCandidatesCategories.value`
 *   must contain valid data structures for processing.
 * - The candidate's configuration is expected to contain a "variables" property
 *   holding details like name, type, and value.
 *
 * Notes:
 * - If the candidate's configuration variable type is a list, the function
 *   makes a deep copy of the variable's value.
 * - The function safely ensures that no operations proceed unless required
 *   values and structures are present and valid.
 */
const promote = () => {
	if (localPromotionCandidates.value && promotionCandidatesCategories.value) {
		let promoteFrom: Configuration | null = null;

		for (const array of promotionCandidatesCategories.value.values()) {
			for (const el of array as Array<{
				id: string;
				configuration: Configuration;
			}>) {
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
 * Fetches and processes the list of promotion candidates by constructing a model
 * based on provided configurations and sending it to an API endpoint.
 *
 * This function integrates information from `baseSt.getBases` and `props.configModel`
 * to dynamically build a request payload. The payload is then sent via a POST
 * request to the `/configurations/promotionCandidates` endpoint. On successful
 * response (status 200), the returned data is stored in `localPromotionCandidates.value`.
 *
 * @async
 * @function getPromotionCandidates
 * @returns {Promise<void>} A Promise that resolves once the promotion candidates
 * list is fetched and processed.
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
 * Updates the current `version.value` based on the number of archived configuration variables.
 * If `configurationVariablesArchive.value` contains some entries, the last version number is set to one less
 * than the archive's length; otherwise, it defaults to 1.
 */
const showLastVersion = () => {
	version.value = configurationVariablesArchive.value?.length
		? configurationVariablesArchive.value.length - 1
		: 1;
};

/**
 * Asynchronous function to display the promotion candidates dialog.
 *
 * This function sets the state of the promotionCandidatesDialog to true,
 * which indicates that the dialog should be displayed to the user.
 *
 * The function does not take any parameters and does not return
 * any value. It is executed asynchronously.
 */
const showPromotionCandidatesDialog = async () => {
	promotionCandidatesDialog.value = true;
};

/**
 * Toggles the active promotion candidate based on the provided ID.
 *
 * If the given `id` matches the current active promotion candidate's value,
 * it resets the value to an empty string, effectively deactivating it.
 * Otherwise, it sets the active promotion candidate's value to the given `id`.
 *
 * @param {string} id - The identifier of the promotion candidate to activate or deactivate.
 */
const setActivePromotionCandidate = (id: string) => {
	if (activePromotionCandidate.value === id) {
		activePromotionCandidate.value = '';
	} else {
		activePromotionCandidate.value = id;
	}
};

/**
 * Displays the promotion candidate preview dialog with the specified configuration.
 *
 * @function showPromotionCandidatePreviewDialog
 * @param {MouseEvent} event - The mouse event triggering the function.
 * The event's propagation will be stopped.
 * @param {Configuration} config - The configuration object for the promotion candidate preview dialog.
 */
const showPromotionCandidatePreviewDialog = (
	event: MouseEvent,
	config: Configuration,
) => {
	event.stopPropagation();

	promotionCandidatesPreviewDialog.value = true;
	promotionCandidatePreviewConfig.value = config;
};

/**
 * Updates the application's configuration variables for a specific version if they are not already loaded.
 *
 * The `versionChanged` function is triggered when the current version is updated. It performs the following tasks:
 * - Retrieves and updates configuration variables for the specified version if they are not already loaded.
 * - Constructs and sends a request to fetch configuration data based on specified filters.
 * - Updates the application state with the fetched configuration data.
 * - Notifies the user in case of an error during the request.
 *
 * @param {number} current - The current version index to be checked and potentially updated.
 */
const versionChanged = async (current: number) => {
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
	await versionChanged(current);
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

<style scoped></style>
