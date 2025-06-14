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
	<div class="flex tw-flex-col tw-h-full tw-max-h-full">
		<q-dialog v-model="deleteDialog">
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">
						Delete {{ model?.name }} {{ route.params.base }}
					</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove {{ model?.name }}
					{{ route.params.base }}?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="deleteModel"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="deleteRuleDialog">
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Remove rule</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove this rule?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="deleteRule"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="deleteRestrictionDialog">
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6 tw-text-primary">Remove restriction</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove this restriction?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="deleteRestriction"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div class="tw-flex tw-justify-center tw-text-secondary tw-py-3">
			<tower-select
				v-model="model"
				v-model:filter="modelFilter"
				:clearable="false"
				:disable="false"
				:label="`Choose or create ${route.params.base}`"
				:loading="loading"
				:options="baseModels as Array<object>"
				class="tw-w-[33.3%]"
				option-label="name"
				@input-value="inputValueChange"
			>
				<template #prepend>
					<q-icon :name="currentIcon" />
				</template>
				<template v-if="userCanModify" #after>
					<q-btn
						v-if="addOrDeleteIcon || modelFilter"
						:disable="!enableAddDeleteButton"
						flat
						padding="sm"
						@click="addOrDeleteModel"
					>
						<q-icon :name="addOrDeleteIcon as string" />
					</q-btn>
				</template>
			</tower-select>
		</div>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<search-toolbar
				v-if="model"
				:export-enabled="false"
				:filter="filter"
				:import-enabled="false"
				:showDiffEnabled="false"
				:title="`${model.name} ${model.base}`"
				class="tw-mt-3"
			/>
		</transition>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<q-tabs
				v-if="model"
				v-model="tab"
				active-color="secondary"
				align="left"
				animated
				class="tw-mt-3 tw-text-gray-500"
				dense
				indicator-color="secondary"
				keep-alive
				narrow-indicator
			>
				<q-tab class="tw-rounded" label="Rules" name="rules" />
				<q-tab
					v-if="model?.base !== baseSt.getBases[0]?.name"
					class="tw-rounded"
					label="Restrictions"
					name="restrictions"
				/>
				<q-tab class="tw-rounded" label="Other settings" name="other"></q-tab>
				<q-tab
					v-if="model?.base === baseSt.getBases[0]?.name"
					class="tw-rounded"
					label="Configuration Template"
					name="template"
				></q-tab>
			</q-tabs>
		</transition>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<q-tab-panels
				v-if="model"
				v-model="tab"
				animated
				class="tw-bg-darkPage tw-flex tw-flex-col tw-flex-1 tw-items-center"
			>
				<q-tab-panel
					name="rules"
					class="tw-flex tw-flex-1 tw-flex-col overflow-auto"
					:class="{
						'items-center': model.rules.length === 0 && !loading,
						'tw-justify-center': model.rules.length === 0 && !loading,
						'tw-min-h-20': model.rules.length === 0 && !loading,
						'tw-min-h-40': model.rules.length > 0 && !loading,
					}"
				>
					<div class="tw-flex tw-items-center tw-flex-col">
						<rule-row
							v-for="rule of model.rules"
							:id="rule._id"
							:key="rule._id"
							v-model:condition-reg-ex="rule.conditionRegEx"
							v-model:condition-type="rule.conditionType"
							v-model:condition-value="rule.conditionValue"
							v-model:error="rule.error"
							v-model:target-reg-ex="rule.targetRegEx"
							v-model:target-type="rule.targetType"
							v-model:target-value="rule.targetValue"
							:is-new="false"
							:read-only="!userCanModify"
							@deleteClicked="showDeleteDialog"
						/>
						<div
							v-if="model.rules.length === 0 && !loading"
							class="tw-w-full tw-flex tw-justify-center tw-items-center"
						>
							<div
								class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400"
							>
								There aren't any rules in this model
								<div
									class="tw-text-center tw-text-xs tw-text-gray-500"
									v-if="userCanModify"
								>
									You can create one using panel below
								</div>
							</div>
						</div>
					</div>
				</q-tab-panel>
				<q-tab-panel name="restrictions" class="tw-flex tw-flex-1 tw-flex-col">
					<q-checkbox
						v-if="tab === 'restrictions'"
						v-model="model.options.hasRestrictions"
						:disable="!userCanModify"
						label="Enable restrictions"
					/>
					<div
						class="tw-flex tw-flex-1 tw-flex-col overflow-auto tw-min-h-40"
						:class="{
							'items-center': model.restrictions.length === 0 && !loading,
							'tw-justify-center': model.restrictions.length === 0 && !loading,
						}"
					>
						<div
							v-if="tab === 'restrictions'"
							:class="{
								'tw-justify-center':
									model.restrictions.length === 0 && !loading,
							}"
							class="tw-flex tw-flex-col"
						>
							<restriction-row
								v-for="(restrict, index) of model.restrictions"
								:key="restrict.__id"
								v-model="model.restrictions[index]"
								:base-models="previousBaseModels"
								:is-new="false"
								:read-only="!model.options.hasRestrictions || !userCanModify"
								@deleteRestriction="showDeleteRestrictionDialog"
							/>
							<div
								v-if="model.restrictions.length === 0 && !loading"
								class="tw-w-full tw-flex tw-justify-center tw-justify-self-center tw-self-center tw-items-center"
							>
								<div
									class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400"
								>
									There aren't any restrictions in this model
									<div
										class="tw-text-center tw-text-xs tw-text-gray-500"
										v-if="userCanModify"
									>
										You can create one using panel below
									</div>
								</div>
							</div>
						</div>
					</div>
				</q-tab-panel>
				<q-tab-panel name="other">
					<div class="flex tw-flex-col tw-flex-1">
						<q-checkbox
							v-model="modelForceComment"
							:disable="!userCanModify"
							label="Force comment"
							class="tower_checkbox"
						/>
					</div>
				</q-tab-panel>
				<q-tab-panel name="template">
					<div class="flex tw-flex-col tw-flex-1">
						<q-checkbox
							v-model="modelTemplateEnabled"
							:disable="!userCanModify"
							label="Enable template"
							class="tower_checkbox"
						/>
						<div class="flex tw-flex-col tw-flex-1">
							<template v-for="(base, i) of baseSt.getBases" :key="base.id">
								<q-toggle
									color="accent"
									:disable="!modelTemplateEnabled || i == 0"
									v-model="templateValues[i]"
									:label="base.name"
								/>
							</template>
						</div>
					</div>
				</q-tab-panel>
			</q-tab-panels>
		</transition>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<div v-if="model">
				<rule-row
					v-if="tab === 'rules' && userCanModify"
					ref="newRuleRow"
					v-model:condition-reg-ex="newRule.conditionRegEx"
					v-model:condition-type="newRule.conditionType"
					v-model:condition-value="newRule.conditionValue"
					v-model:error="newRule.error"
					v-model:target-reg-ex="newRule.targetRegEx"
					v-model:target-type="newRule.targetType"
					v-model:target-value="newRule.targetValue"
					:is-new="true"
					@addClicked="addNewRule"
				/>
				<restriction-row
					v-if="tab === 'restrictions' && userCanModify"
					v-model="newRestriction"
					:base-models="previousBaseModels"
					:is-new="true"
					:read-only="!model?.options.hasRestrictions"
					@addNewRestriction="addNewRestriction"
				/>
				<save-panel
					v-if="userCanModify"
					:has-errors="hasErrors"
					:loading="loading"
					:save-enabled="isDifferent"
					@saveClicked="saveModel"
				></save-panel>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
// This component manages the creation, modification, and deletion of Configuration Models.
// It allows users to select a base type (e.g. 'device', 'interface'), then choose an existing
// model or create a new one. Users can define rules, restrictions, and other settings for the model.

import { useRoute } from 'vue-router';
import TowerSelect from 'components/basic/towerSelect.vue';
import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue';
import { towerAxios } from 'boot/axios';
import { basesStore } from 'stores/bases';
import {
	ConfigurationModel,
	ConfigurationModelRule,
	ConfigurationModelRuleConditionType,
	ConfigurationModelRuleTargetType,
} from 'components/configurationModel/configurationModel';
import SearchToolbar from 'components/configuration/searchToolbar.vue';
import SavePanel from 'components/basic/savePanel.vue';
import RuleRow from 'components/configurationModel/ruleRow.vue';
import { v4 as uuidv4 } from 'uuid';
import { useQuasar } from 'quasar';
import { userStore } from 'stores/user';
import RestrictionRow from 'components/configurationModel/restrictionRow.vue';
import { navigationStore } from 'stores/navigation';
import { cloneDeep, isEqual, isNil } from 'lodash';

//====================================================
// Const
//====================================================
const route = useRoute(); // Access to the current route information.
const baseSt = basesStore(); // Pinia store for base configurations.
const userSt = userStore(); // Pinia store for user information and permissions.
const $q = useQuasar(); // Quasar framework utilities (notifications, dialogs, etc.).
const navigationSt = navigationStore(); // Pinia store for navigation guards.

//====================================================
// Data
//====================================================
/**
 * The currently selected or new configuration model being edited.
 * Null if no model is selected or being created.
 */
const model: Ref<ConfigurationModel | null> = ref(null);
/**
 * Filter string for the TowerSelect component, used when creating a new model.
 */
const modelFilter = ref('');
/**
 * A reactive copy of the rules from the loaded `model`. Used to detect changes.
 */
const rules: Ref<Array<ConfigurationModelRule>> = ref([]);
/**
 * A reactive copy of the restrictions from the loaded `model`. Used to detect changes.
 */
const restrictions: Ref<Array<any>> = ref([]); // TODO: Define a proper type for restrictions if possible
/**
 * A reactive copy of the `model.options.hasRestrictions` flag. Used to detect changes.
 */
const modelHasRestrictions = ref(false);
/**
 * A reactive copy of the `model.options.forceComment` flag. Used to detect changes.
 */
const modelForceComment = ref(false);
/**
 * A reactive copy of the `model.options.templateEnabled` flag. Used to detect changes.
 */
const modelTemplateEnabled = ref(false);
/**
 * A reactive copy of the `model.template` values. Used to detect changes.
 */
const templateValues: Ref<Array<boolean>> = ref([]);
/**
 * List of all configuration models available for the current base type (route.params.base).
 */
const baseModels: Ref<Array<ConfigurationModel>> = ref([]);
/**
 * List of model names from previous/parent base types, used for restriction selection.
 * Each inner array corresponds to a previous base type and contains its model names.
 */
const previousBaseModels: Ref<Array<Array<string>>> = ref([]);

/**
 * Object holding the data for a new rule before it's added to the model.
 */
const newRule = ref({
	targetValue: '',
	targetType: ConfigurationModelRuleTargetType.NAME,
	targetRegEx: false,
	conditionValue: '',
	conditionType: ConfigurationModelRuleConditionType.TYPE,
	conditionRegEx: false,
	error: '',
});

/**
 * Loading state indicator, true when data is being fetched or saved.
 */
const loading = ref(false);

/**
 * Stores the current input value from the TowerSelect component.
 * Used to determine if a new model name is being typed.
 */
const inputValue = ref('');

/**
 * Filter string for the SearchToolbar. Currently, its value is not being updated by any user input in this component.
 */
const filter = ref('');

/**
 * The currently active tab (e.g. 'rules', 'restrictions', 'other', 'template').
 */
const tab = ref('rules');

/**
 * Template ref for the RuleRow component used for adding new rules.
 * Allows calling methods on the child component (e.g. resetValidation).
 */
const newRuleRow: Ref<typeof RuleRow | null> = ref(null);

/**
 * Object holding the data for a new restriction before it's added to the model.
 */
const newRestriction: any = ref({});

/**
 * Controls the visibility of the rule deletion confirmation dialog.
 */
const deleteRuleDialog = ref(false);
/**
 * Stores the ID of the rule marked for deletion.
 */
const toDeleteRuleId = ref('');

/**
 * Controls the visibility of the restriction deletion confirmation dialog.
 */
const deleteRestrictionDialog = ref(false);
/**
 * Stores the ID of the restriction marked for deletion.
 */
const toDeleteRestrictionId = ref('');

/**
 * Controls the visibility of the model deletion confirmation dialog.
 */
const deleteDialog = ref(false);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	// Fetch initial data when the component is mounted.
	await getBaseModels();
	// Initialize the templateValues array based on the number of bases.
	// By default, all template values are true.
	for (let i = 0; i < baseSt.getBases.length; i++) {
		templateValues.value[i] = true;
	}
});

//====================================================
// Computed
//====================================================
/**
 * Computes the icon name for the current base type selected in the route.
 * @returns {string | undefined} The icon name or undefined if not found.
 */
const currentIcon = computed(() => {
	const found = baseSt.getBases.find((el) => {
		return el.name === route.params.base;
	});

	if (found) {
		return found.icon;
	}

	return undefined;
});

/**
 * Computes the icon for the add/delete button next to the model selector.
 * Shows 'sym_o_add' if a new model name is typed.
 * Shows 'sym_o_delete' if an existing model is selected and no new name is typed.
 * @returns {string | null} The icon name or null if no icon should be shown.
 */
const addOrDeleteIcon = computed(() => {
	if (!inputValue.value) {
		// If no text input in the selector
		if (model.value) {
			// And a model is selected
			return 'sym_o_delete'; // Show delete icon
		}
		return null; // Otherwise, no icon
	}

	// If there is text input, check if it matches an existing model name
	const found = baseModels.value.some((el) => {
		return el.name === inputValue.value;
	});

	if (!found) {
		// If not found, it's a new model name
		return 'sym_o_add'; // Show add icon
	}

	return null; // Otherwise (name matches existing), no icon
});

/**
 * Checks if the current model data (including rules, restrictions, and options)
 * has been modified compared to its original state (when it was loaded or created).
 * @returns {boolean} True if there are unsaved changes, false otherwise.
 */
const isDifferent = computed(() => {
	if (!model.value) {
		return false; // No model selected/loaded, so no changes.
	}

	if (!model.value._id) {
		return true; // New model (no _id yet), so it's different by definition.
	}

	// Check for differences in the number of rules.
	if (rules.value.length !== model.value?.rules.length) {
		return true;
	}

	// Check for differences in the number of restrictions.
	if (restrictions.value.length !== model.value?.restrictions.length) {
		return true;
	}

	// Check for changes in the 'hasRestrictions' option.
	if (modelHasRestrictions.value !== model.value?.options.hasRestrictions) {
		return true;
	}

	// Check for changes in the 'forceComment' option.
	if (isNil(model.value?.options.forceComment) && modelForceComment.value) {
		return true;
	} else if (
		!isNil(model.value?.options.forceComment) &&
		modelForceComment.value !== model.value?.options.forceComment
	) {
		return true;
	}

	// Check for changes in the 'templateEnabled' option.
	if (
		isNil(model.value?.options.templateEnabled) &&
		modelTemplateEnabled.value
	) {
		return true;
	} else if (
		!isNil(model.value?.options.templateEnabled) &&
		modelTemplateEnabled.value !== model.value?.options.templateEnabled
	) {
		return true;
	}

	// Check for changes in template values if the template is enabled.
	if (
		!isEqual(model.value.template, templateValues.value) &&
		modelTemplateEnabled.value
	) {
		return true;
	}

	// Check if any rule has been modified.
	const diffRules = model.value.rules.some((el) => {
		return !rules.value.some((rule) => {
			// Compare all properties of a rule.
			return (
				rule._id === el._id &&
				rule.targetRegEx === el.targetRegEx &&
				rule.targetType === el.targetType &&
				rule.targetValue === el.targetValue &&
				rule.conditionRegEx === el.conditionRegEx &&
				rule.conditionType === el.conditionType &&
				rule.conditionValue === el.conditionValue &&
				rule.error === el.error
			);
		});
	});

	if (diffRules) {
		return true;
	}

	// Check if any restriction has been modified.
	return model.value?.restrictions.some((el) => {
		const found = restrictions.value.find((restriction) => {
			return restriction.__id === el.__id;
		});

		if (found) {
			// Compare all properties of a restriction.
			const restrictionKeys = Object.keys(el);
			const foundKeys = Object.keys(found);

			if (restrictionKeys.length !== foundKeys.length) {
				return true; // Different number of keys implies change.
			}

			for (const key of restrictionKeys) {
				if (el[key] !== found[key]) {
					return true; // Different value for a key implies change.
				}
			}
			return false; // No differences found for this restriction.
		}
		return true; // Restriction exists in an original model but not in the local copy (or vice-versa, handled by length check).
	});
});

/**
 * Checks for errors in the model configuration.
 * Currently, it only checks if restrictions are enabled, but no restrictions are defined.
 * @returns {boolean} True if there are errors, false otherwise.
 */
const hasErrors = computed(() => {
	if (!model.value) {
		return false;
	}

	// If restrictions are enabled but there are no restrictions defined, it's considered an error.
	if (model.value.options.hasRestrictions) {
		if (model.value.restrictions.length > 0) {
			// This logic seems to check if *all* restrictions are empty, which might be an error.
			// It returns true (hasErrors = true) if *none* of the restrictions have at least one truthy value.
			return !model.value.restrictions.some((el) => {
				return Object.keys(el).some((key) => {
					return !!el[key]; // Check if any property in the restriction object is truthy.
				});
			});
		}
		// If hasRestrictions is true but length is 0, this implies an error state too.
		// The current logic might need refinement if empty restrictions list with hasRestrictions=true is an error.
	}

	return false; // No errors found by this logic.
});

/**
 * Determines if the current user has permission to modify the configuration model.
 * Checks for 'admin' username, 'admin' role, or specific 'configurationModel.modify' roles.
 * @returns {boolean} True if the user can modify, false otherwise.
 */
const userCanModify = computed(() => {
	if (userSt.getUsername === 'admin') {
		return true;
	}

	if (userSt.getRoles.includes('admin')) {
		return true;
	}

	if (model.value) {
		// Construct a permission prefix based on the model's base and name.
		const prefix = `configurationModel.${model.value.base}.${model.value.name}`;

		// Check for general modify permission and specific model permissions.
		if (userSt.getRoles.includes('configurationModel.modify')) {
			if (
				userSt.getRoles.includes(`${prefix}.modify`) || // Has specific modify permission
				!userSt.getRoles.includes(`${prefix}.view`) // Or doesn't even have a view (implies modify if general modify is present)
			) {
				return true;
			}
		}
		// Fallback for users who might have a general modify role but not specific ones.
		// This part seems redundant if the above `if` block correctly handles it.
		// However, it ensures that if a user has 'configurationModel.modify', they can modify.
		// This might be intended as a broader permission.
		return (
			userSt.getRoles.includes('configurationModel.modify') ||
			userSt.getRoles.includes('admin') // Double check for an admin role
		);
	}
	// If no model is selected, default to false (or could be based on a general "create" permission if applicable).
	return false;
});

/**
 * Determines if the add/delete button next to the model selector should be enabled.
 * Enabled if a model is selected and has an ID (for delete), or if no model is selected but there's filter text (for add).
 * @returns {boolean} True if the button should be enabled, false otherwise.
 */
const enableAddDeleteButton = computed(() => {
	return (
		// Enable if a model is selected, has a name, and an ID (existing model, can be deleted)
		!!(model.value && model.value.name && model.value._id) ||
		// Or, enable if no model is selected, but there is text in the filter (new model, can be added)
		(!model.value && modelFilter.value)
	);
});

//====================================================
// Methods
//====================================================
/**
 * Fetches all configuration models for the current base type (from `route.params.base`).
 * Populates `baseModels` and then calls `getPreviousBaseModels`.
 */
const getBaseModels = async () => {
	loading.value = true;

	const filter = {
		order: 'name ASC',
		where: {
			base: route.params.base,
		},
	};
	try {
		const response = await towerAxios.get(
			`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`,
		);

		if (response.status === 200) {
			baseModels.value = response.data;
		}
	} catch (error) {
		console.error('Failed to get base models:', error);
		$q.notify({
			color: 'negative',
			position: 'top',
			message: `Failed to load models for base ${route.params.base}`,
		});
		baseModels.value = []; // Clear or set to empty on error
	}

	await getPreviousBaseModels();

	loading.value = false;
};

/**
 * Fetches model names from all base types that hierarchically precede the current base type.
 * This data is used for populating selection options in restrictions.
 * Populates `previousBaseModels`.
 */
const getPreviousBaseModels = async () => {
	previousBaseModels.value = [];
	for (let base of baseSt.getBases) {
		if (base.name == route.params.base) {
			break; // Stop once the current base is reached in the hierarchy.
		}

		const filter = {
			order: 'name ASC',
			where: {
				base: base.name,
			},
		};
		try {
			const response = await towerAxios.get(
				`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`,
			);

			if (response.status === 200) {
				const modelNames: Array<string> = [];
				response.data.forEach((el: ConfigurationModel) => {
					modelNames.push(el.name);
				});
				previousBaseModels.value.push(modelNames);
			}
		} catch (error) {
			console.error(
				`Failed to get previous base models for ${base.name}:`,
				error,
			);
			// Optionally notify user or handle error, e.g., push an empty array
			previousBaseModels.value.push([]);
		}
	}
};

/**
 * Updates the `inputValue` ref with the current text from the TowerSelect input field.
 * @param {string} value - The new input value from the select component.
 */
const inputValueChange = (value: string) => {
	inputValue.value = value;
};

/**
 * Adds the rule defined in `newRule` to the `model.rules` array.
 * Resets `newRule` and the validation state of the new rule row.
 */
const addNewRule = () => {
	if (!model.value) {
		return;
	}

	if (!model.value.rules) {
		model.value.rules = [];
	}

	model.value.rules.push({
		_id: uuidv4(), // Generate a unique ID for the new rule.
		error: newRule.value.error,
		conditionRegEx: newRule.value.conditionRegEx,
		conditionType: newRule.value.conditionType,
		conditionValue: newRule.value.conditionValue,
		targetType: newRule.value.targetType,
		targetRegEx: newRule.value.targetRegEx,
		targetValue: newRule.value.targetValue,
	});

	// Reset the newRule object for the next entry.
	newRule.value = {
		targetValue: '',
		targetType: ConfigurationModelRuleTargetType.NAME,
		targetRegEx: false,
		conditionValue: '',
		conditionType: ConfigurationModelRuleConditionType.TYPE,
		conditionRegEx: false,
		error: '',
	};

	// Reset validation on the new rule input row.
	nextTick(() => {
		if (newRuleRow.value) {
			newRuleRow.value.resetValidation();
		}
	});
};

/**
 * Shows the rule deletion confirmation dialog.
 * @param {string} id - The ID of the rule to be deleted.
 */
const showDeleteDialog = (id: string) => {
	toDeleteRuleId.value = id;
	deleteRuleDialog.value = true;
};

/**
 * Deletes the rule with ID `toDeleteRuleId` from the `model.rules` array.
 */
const deleteRule = () => {
	if (model.value && model.value.rules) {
		model.value.rules = model.value.rules.filter((el) => {
			return el._id !== toDeleteRuleId.value;
		});
	}
	toDeleteRuleId.value = ''; // Clear the ID after deletion
};

/**
 * Adds the restriction defined in `newRestriction` to the `model.restrictions` array.
 * Resets `newRestriction`.
 */
const addNewRestriction = () => {
	if (model.value) {
		if (!model.value.restrictions) {
			model.value.restrictions = [];
		}

		const copy = { ...newRestriction.value };
		copy.__id = uuidv4(); // Generate a unique ID for the new restriction.
		model.value.restrictions.push(copy);

		newRestriction.value = {}; // Reset the newRestriction object.
	}
};

/**
 * Shows the restriction deletion confirmation dialog.
 * @param {string} id - The ID (`__id`) of the restriction to be deleted.
 */
const showDeleteRestrictionDialog = (id: string) => {
	toDeleteRestrictionId.value = id;
	deleteRestrictionDialog.value = true;
};

/**
 * Deletes the restriction with ID `toDeleteRestrictionId` from the `model.restrictions` array.
 */
const deleteRestriction = () => {
	if (model.value?.restrictions) {
		model.value.restrictions = model.value.restrictions.filter((el) => {
			return el.__id !== toDeleteRestrictionId.value;
		});
	}
	toDeleteRestrictionId.value = ''; // Clear the ID after deletion
};

/**
 * Saves the current configuration model to the backend.
 * Handles both creating new models and updating existing ones.
 * Shows notifications for success or failure.
 */
const saveModel = async () => {
	if (model.value) {
		loading.value = true;

		// Ensure options are set, defaulting to false if nil.
		model.value.options.forceComment = isNil(modelForceComment.value)
			? false
			: modelForceComment.value;

		model.value.options.templateEnabled = isNil(modelTemplateEnabled.value)
			? false
			: modelTemplateEnabled.value;

		// Only include template values if template is enabled.
		if (model.value.options.templateEnabled) {
			model.value.template = templateValues.value;
		} else {
			// Consider clearing model.value.template if not enabled, or ensure backend handles it.
			// model.value.template = []; // Or undefined, depending on API expectation
		}

		// Prepare the payload for saving.
		const toSave: ConfigurationModel = {
			rules: model.value?.rules ?? [],
			name: model.value.name,
			base: model.value?.base,
			options: model.value?.options,
			restrictions: model.value?.restrictions,
			template: model.value?.template ?? [],
			_id: model.value?._id, // Will be undefined for new models.
		};

		try {
			const response = await towerAxios.put('/configurationModels', toSave);

			if (response.status === 200) {
				// After a successful save, refresh the list of base models.
				await getBaseModels();
				// Update local reactive data with the response from the server (which might include new _id, etc.).
				updateCurrentData(response.data);
				// Ensure the model's _id is updated if it was a new model.
				if (model.value) {
					// model.value should still be defined here
					model.value._id = response.data._id;
				}

				$q.notify({
					color: 'positive',
					position: 'top',
					textColor: 'secondary',
					message: `${model.value?.name} ${model.value?.base} saved successfully`,
				});

				// Update the main model ref with the saved data to ensure consistency
				// and to reflect any server-side changes (like timestamps, if any).
				model.value = response.data;
				navigationSt.allowNavigation(); // Allow navigation as changes are saved.
			}
		} catch (e) {
			console.error('Error saving model:', e);
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: `Error saving ${model?.value?.name} ${model?.value?.base}`,
			});
		}

		loading.value = false;
	}
};

/**
 * Updates local reactive copies (`rules`, `restrictions`, options flags, `templateValues`)
 * based on the provided `current` ConfigurationModel. This is used when a model is loaded
 * or after it's saved to synchronize the editing state with the canonical model data.
 * @param {ConfigurationModel} current - The configuration model to use as the source.
 */
const updateCurrentData = (current: ConfigurationModel) => {
	// Deep clone rules and restrictions to avoid direct mutation of the source model's arrays
	// and to correctly track differences for the `isDifferent` computed property.
	rules.value = cloneDeep(current.rules || []);
	restrictions.value = cloneDeep(current.restrictions || []);

	modelHasRestrictions.value = current.options.hasRestrictions;
	modelForceComment.value = isNil(current.options.forceComment)
		? false
		: current.options.forceComment;

	modelTemplateEnabled.value = isNil(current.options.templateEnabled)
		? false
		: current.options.templateEnabled;

	// Initialize templateValues: if current.template is nil or empty, default all to true.
	// Otherwise, use a deep clone of current.template.
	if (isNil(current.template) || current.template.length === 0) {
		templateValues.value = Array(baseSt.getBases.length).fill(true);
	} else {
		templateValues.value = cloneDeep(current.template);
	}
};

/**
 * Handles the action for the add/delete button next to the model selector.
 * If a model is selected and no filter text is present, it shows the model deletion dialog.
 * If a filter text is present (implying a new model name), it initializes `model.value`
 * with a new model structure.
 */
const addOrDeleteModel = () => {
	if (model.value && !modelFilter.value) {
		// If a model is selected and no filter text (i.e., not typing a new name),
		// assume the delete action for the currently selected model.
		deleteDialog.value = true;
	} else if (modelFilter.value) {
		// If there is a filter text, assume add action for a new model.
		// Initialize `model.value` with a new ConfigurationModel structure.
		model.value = {
			name: modelFilter.value, // Use the filter text as the new model's name.
			base: route.params.base as string,
			restrictions: [],
			options: {
				hasRestrictions: false,
				forceComment: false,
				// templateEnabled is not explicitly set here, will default or be handled by updateCurrentData/saveModel
			},
			rules: [],
			// template will be initialized by updateCurrentData or default logic
		};
		// modelFilter.value = ''; // Optionally clear the filter after creating the new model structure
		// inputValue.value = ''; // Optionally clear the input value
	}
};

/**
 * Deletes the currently selected configuration model from the backend.
 * Clears the `model.value` and refreshes the list of base models.
 * Shows notifications for success or failure.
 */
const deleteModel = async () => {
	try {
		if (model.value && model.value._id) {
			const idToDelete = model.value._id;
			const modelName = model.value.name;
			const modelBase = model.value.base;

			model.value = null; // Clear the current model selection.

			await towerAxios.delete(`/configurationModels/${idToDelete}`);

			await getBaseModels(); // Refresh the list of models.

			$q.notify({
				color: 'positive',
				position: 'top',
				textColor: 'secondary',
				message: `Model ${modelName} (${modelBase}) removed successfully`,
			});
			navigationSt.allowNavigation(); // Allow navigation as the model is deleted.
		}
	} catch (e) {
		console.error('Error deleting model:', e);
		// If deletion fails, the model might still be selected or in an inconsistent state.
		// Consider re-fetching or restoring model.value if necessary, or guiding the user.
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error deleting model',
		});
	}
};

//====================================================
// Watch
//====================================================
/**
 * Watches for changes in the route path.
 * If the path changes (e.g. navigating to a different base type),
 * it resets the current model and active tab, then reloads base models for the new route.
 */
watch(
	() => route.path,
	async () => {
		model.value = null; // Clear the selected model.
		tab.value = 'rules'; // Reset to the default tab.
		await getBaseModels(); // Fetch models for the new base type.
	},
);

/**
 * Watches for changes in the `model.value` (i.e., when a new model is selected or created).
 * If `model.value` changes to a non-null value, it calls `updateCurrentData`
 * to synchronize the local editing state (rules, restrictions, options) with the new model.
 * @param {ConfigurationModel | null} current - The new value of `model.value`.
 */
watch(
	() => model.value,
	(current) => {
		if (current) {
			// When a new model is selected or created, update the local reactive copies.
			updateCurrentData(current);
		} else {
			// If model is cleared, reset local copies as well.
			rules.value = [];
			restrictions.value = [];
			modelHasRestrictions.value = false;
			modelForceComment.value = false;
			modelTemplateEnabled.value = false;
			templateValues.value = Array(baseSt.getBases.length).fill(true);
		}
	},
);

/**
 * Watches the `isDifferent` computed property.
 * If `isDifferent` becomes true (meaning there are unsaved changes) and not loading,
 * it calls `navigationSt.preventNavigation()` to warn the user before navigating away.
 * If `isDifferent` becomes false (no unsaved changes), it allows navigation.
 * @param {boolean} current - The new value of `isDifferent`.
 */
watch(isDifferent, (current: boolean) => {
	if (current && !loading.value) {
		navigationSt.preventNavigation(); // Prevent navigation if there are unsaved changes.
	} else {
		navigationSt.allowNavigation(); // Allow navigation if no unsaved changes or if loading.
	}
});
</script>

<style></style>
