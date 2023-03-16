<template>
	<div>
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
					<q-btn v-close-popup color="secondary" flat label="Cancel"/>
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
					<q-btn v-close-popup color="secondary" flat label="Cancel"/>
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
					<div class="text-h6">Remove restriction</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove this restriction?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel"/>
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
				:label="`Choose or create new ${route.params.base}`"
				:loading="loading"
				:options="baseModels"
				class="tw-w-[33.3%]"
				option-label="name"
				@input-value="inputValueChange"
			>
				<template #prepend>
					<q-icon :name="currentIcon"/>
				</template>
				<template v-if="userCanModify" #after>
					<q-btn
						v-if="addOrDeleteIcon || modelFilter"
						:disable="!enableAddDeleteButton"
						flat
						padding="sm"
						@click="addOrDeleteModel"
					>
						<q-icon :name="addOrDeleteIcon"/>
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
				<q-tab class="tw-rounded" label="Rules" name="rules"/>
				<q-tab
					v-if="model?.base !== baseSt.getBases[0].name"
					class="tw-rounded"
					label="Restrictions"
					name="restrictions"
				/>
			</q-tabs>
		</transition>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<q-tab-panels
				v-if="model"
				v-model="tab"
				:class="
					userCanModify ? 'tower-min-height' : 'tower-min-height-readOnly'
				"
				animated
				class="tw-bg-darkPage"
			>
				<q-tab-panel name="rules">
					<div
						:class="{
							'tower-min-panel-height': userCanModify,
							'tower-min-panel-height-readOnly': !userCanModify,
							'tw-justify-center': model.rules.length === 0 && !loading
						}"
						class="tw-flex tw-flex-col"
					>
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
							class="tw-w-full tw-flex tw-justify-center tw-justify-self-center tw-self-center tw-items-center"
						>
							<div
								class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400"
							>
								There aren't any rules in this model
								<div class="tw-text-center tw-text-xs tw-text-gray-500" v-if="userCanModify">
									You can create one using panel below
								</div>
							</div>
						</div>
					</div>
				</q-tab-panel>
				<q-tab-panel name="restrictions">
					<div>
						<q-checkbox
							v-if="tab === 'restrictions'"
							v-model="model.options.hasRestrictions"
							:disable="!userCanModify"
							label="Enable restrictions"
						/>
						<div
							v-if="tab === 'restrictions'"
							:class="{
								'tw-justify-center':
									model.restrictions.length === 0 && !loading,
								'tower-min-restriction-panel-height': userCanModify,
								'tower-min-restriction-panel-height-readOnly': !userCanModify
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
									<div class="tw-text-center tw-text-xs tw-text-gray-500" v-if="userCanModify">
										You can create one using panel below
									</div>
								</div>
							</div>
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
					:read-only="!model.options.hasRestrictions"
					@addNewRestriction="addNewRestriction"
				/>
				<save-panel
					v-if="userCanModify"
					:has-errors="hasErrors"
					:loading="loading"
					:save-enabled="isDifferent"
					class="tw-mt-1"
					@saveClicked="saveModel"
				></save-panel>
			</div>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import {useRoute} from 'vue-router';
import TowerSelect from 'components/basic/towerSelect.vue';
import {computed, nextTick, onMounted, Ref, ref, watch} from 'vue';
import {towerAxios} from 'boot/axios';
import {basesStore} from 'stores/bases';
import {
	ConfigurationModel,
	ConfigurationModelRule,
	ConfigurationModelRuleConditionType,
	ConfigurationModelRuleTargetType
} from 'components/configurationModel/configurationModel';
import SearchToolbar from 'components/configuration/searchToolbar.vue';
import SavePanel from 'components/basic/savePanel.vue';
import RuleRow from 'components/configurationModel/ruleRow.vue';
import cryptoRandomString from 'crypto-random-string';
import {useQuasar} from 'quasar';
import {userStore} from 'stores/user';
import RestrictionRow from 'components/configurationModel/restrictionRow.vue';
import {navigationStore} from 'stores/navigation';

//====================================================
// Const
//====================================================
const route = useRoute();
const baseSt = basesStore();
const userSt = userStore();
const $q = useQuasar();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const model: Ref<ConfigurationModel | null> = ref(null);
const modelFilter = ref('');
const rules: Ref<Array<ConfigurationModelRule>> = ref([]);
const restrictions: Ref<Array<any>> = ref([]);
const modelHasRestrictions = ref(false);
const baseModels: Ref<Array<ConfigurationModel>> = ref([]);
const previousBaseModels: Ref<Array<Array<string>>> = ref([]);

const newRule = ref({
	targetValue: '',
	targetType: ConfigurationModelRuleTargetType.NAME,
	targetRegEx: false,
	conditionValue: '',
	conditionType: ConfigurationModelRuleConditionType.TYPE,
	conditionRegEx: false,
	error: ''
});

const loading = ref(false);

const inputValue = ref('');

const filter = ref('');

const tab = ref('rules');

const newRuleRow: Ref<typeof RuleRow | null> = ref(null);

const newRestriction: any = ref({});

const deleteRuleDialog = ref(false);
const toDeleteRuleId = ref('');

const deleteRestrictionDialog = ref(false);
const toDeleteRestrictionId = ref('');

const deleteDialog = ref(false);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getBaseModels();
});

//====================================================
// Computed
//====================================================
/**
 * currentIcon
 */
const currentIcon = computed(() => {
	const found = baseSt.getBases.find(el => {
		return el.name === route.params.base;
	});

	if (found) {
		return found.icon;
	}

	return null;
});

/**
 * addOrDeleteIcon
 */
const addOrDeleteIcon = computed(() => {
	if (!inputValue.value) {
		if (model.value) {
			return 'sym_o_delete';
		}
		return null;
	}

	const found = baseModels.value.some(el => {
		return el.name === inputValue.value;
	});

	if (!found) {
		return 'sym_o_add';
	}

	return null;
});

/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (!model.value) {
		return false;
	}

	if (!model.value.id) {
		return true;
	}

	if (rules.value.length !== model.value?.rules.length) {
		return true;
	}

	if (restrictions.value.length !== model.value?.restrictions.length) {
		return true;
	}

	if (modelHasRestrictions.value !== model.value?.options.hasRestrictions) {
		return true;
	}

	const diffRules = model.value.rules.some(el => {
		return !rules.value.some(rule => {
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

	return model.value?.restrictions.some(el => {
		const found = restrictions.value.find(restriction => {
			return restriction.__id === el.__id;
		});

		if (found) {
			const restrictionKeys = Object.keys(el);
			const foundKeys = Object.keys(found);

			if (restrictionKeys.length !== foundKeys.length) {
				return true;
			}

			for (const key of restrictionKeys) {
				if (el[key] !== found[key]) {
					return true;
				}
			}

			return false;
		}

		return true;
	});
});

/**
 * hasErrors
 */
const hasErrors = computed(() => {
	if (!model.value) {
		return false;
	}

	if (model.value.options.hasRestrictions) {
		if (model.value.restrictions.length > 0) {
			return !model.value.restrictions.some(el => {
				return Object.keys(el).some(key => {
					return !!el[key];
				});
			});
		}
	}

	return false;
});

/**
 * userCanModify
 */
const userCanModify = computed(() => {
	if (userSt.getUsername === 'admin') {
		return true;
	}

	if (userSt.getRoles.includes('admin')) {
		return true;
	}

	if (model.value) {
		const prefix = `configurationModel.${model.value.base}.${model.value.name}`;

		if (userSt.getRoles.includes('configurationModel.modify')) {
			if (
				userSt.getRoles.includes(`${prefix}.modify`) ||
				!userSt.getRoles.includes(`${prefix}.view`)
			) {
				return true;
			}
		}

		return (
			userSt.getRoles.includes('constantVariable.modify') ||
			userSt.getRoles.includes('admin')
		);
	}

	return false;
});

/**
 * disableAddDeleteButton
 */
const enableAddDeleteButton = computed(() => {
	return (
		!!(model.value && model.value.name && model.value.id) ||
		(!model.value && modelFilter.value)
	);
});

//====================================================
// Methods
//====================================================
/**
 * getBaseModels
 */
const getBaseModels = async () => {
	loading.value = true;

	const filter = {
		order: 'name ASC',
		where: {
			base: route.params.base
		}
	};
	const response = await towerAxios.get(
		`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`
	);

	if (response.status === 200) {
		baseModels.value = response.data;
	}

	await getPreviousBaseModels();

	loading.value = false;
};

/**
 * getPreviousBaseModels
 */
const getPreviousBaseModels = async () => {
	previousBaseModels.value = [];
	for (let baseModel of baseSt.getBases) {
		if (baseModel.name == route.params.base) {
			break;
		}

		const filter = {
			order: 'name ASC',
			where: {
				base: baseModel.name
			}
		};

		const response = await towerAxios.get(
			`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`
		);

		if (response.status === 200) {
			const array: Array<string> = [];
			response.data.forEach((el: ConfigurationModel) => {
				array.push(el.name);
			});

			previousBaseModels.value.push(array);
		}
	}
};

/**
 * inputValueChange
 */
const inputValueChange = (value: string) => {
	inputValue.value = value;
};

/**
 * addNewRule
 */
const addNewRule = () => {
	if (!model.value) {
		return;
	}

	if (!model.value.rules) {
		model.value.rules = [];
	}

	model.value.rules.push({
		_id: cryptoRandomString({length: 10}),
		error: newRule.value.error,
		conditionRegEx: newRule.value.conditionRegEx,
		conditionType: newRule.value.conditionType,
		conditionValue: newRule.value.conditionValue,
		targetType: newRule.value.targetType,
		targetRegEx: newRule.value.targetRegEx,
		targetValue: newRule.value.targetValue
	});

	newRule.value = {
		targetValue: '',
		targetType: ConfigurationModelRuleTargetType.NAME,
		targetRegEx: false,
		conditionValue: '',
		conditionType: ConfigurationModelRuleConditionType.TYPE,
		conditionRegEx: false,
		error: ''
	};

	nextTick(() => {
		if (newRuleRow.value) {
			newRuleRow.value.resetValidation();
		}
	});
};

const showDeleteDialog = (id: string) => {
	toDeleteRuleId.value = id;
	deleteRuleDialog.value = true;
};

/**
 * deleteRule
 */
const deleteRule = () => {
	if (model.value && model.value.rules) {
		model.value.rules = model.value.rules.filter(el => {
			return el._id !== toDeleteRuleId.value;
		});
	}
};

/**
 * addNewRestriction
 */
const addNewRestriction = () => {
	if (model.value) {
		if (!model.value.restrictions) {
			model.value.restrictions = [];
		}

		const copy = {...newRestriction.value};
		copy.__id = cryptoRandomString({length: 10});
		model.value.restrictions.push(copy);

		newRestriction.value = {};
	}
};

const showDeleteRestrictionDialog = (id: string) => {
	toDeleteRestrictionId.value = id;
	deleteRestrictionDialog.value = true;
};

/**
 * deleteRestriction
 */
const deleteRestriction = () => {
	if (model.value?.restrictions) {
		model.value.restrictions = model.value.restrictions.filter(el => {
			return el.__id !== toDeleteRestrictionId.value;
		});
	}
};

/**
 * saveModel
 */
const saveModel = async () => {
	if (model.value) {
		loading.value = true;

		const toSave: ConfigurationModel = {
			rules: model.value?.rules,
			name: model.value.name,
			base: model.value?.base,
			options: model.value?.options,
			restrictions: model.value?.restrictions
		};

		try {
			const response = await towerAxios.put('/configurationModels', toSave);

			if (response.status === 201) {
				await getBaseModels();
				updateCurrentData(response.data);

				$q.notify({
					color: 'positive',
					position: 'top',
					textColor: 'secondary',
					message: `${model.value.name} ${model.value.base} saved successfully`
				});

				model.value = response.data;
			}
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: `Error saving ${model?.value?.name} ${model?.value?.base}`
			});
		}

		loading.value = false;
	}
};

/**
 * updateRules
 */
const updateCurrentData = (current: ConfigurationModel) => {
	rules.value = [];
	restrictions.value = [];
	modelHasRestrictions.value = current.options.hasRestrictions;

	current.rules.forEach(el => {
		rules.value.push({...el});
	});

	current.restrictions.forEach(el => {
		restrictions.value.push({...el});
	});
};

/**
 * addOrDeleteModel
 */
const addOrDeleteModel = () => {
	if (model.value && !modelFilter.value) {
		// Remove
		deleteDialog.value = true;
	} else if (modelFilter.value) {
		// Add
		model.value = {
			name: modelFilter.value,
			base: route.params.base as string,
			restrictions: [],
			options: {
				hasRestrictions: false
			},
			rules: []
		};
	}
};

/**
 * deleteModel
 */
const deleteModel = async () => {
	try {
		if (model.value) {
			const idToDelete = model.value.id;

			model.value = null;

			await towerAxios.delete(`/configurationModels/${idToDelete}`);

			await getBaseModels();

			$q.notify({
				color: 'positive',
				position: 'top',
				textColor: 'secondary',
				message: 'Model removed successfully'
			});
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error deleting model'
		});
	}
};

//====================================================
// Watch
//====================================================
watch(
	() => route.path,
	async () => {
		model.value = null;
		tab.value = 'rules';
		await getBaseModels();
	}
);

watch(
	() => model.value,
	current => {
		if (current) {
			updateCurrentData(current);
		}
	}
);

watch(isDifferent, (current: boolean) => {
	if (current && !loading.value) {
		navigationSt.preventNavigation();
	} else {
		navigationSt.allowNavigation();
	}
});
</script>

<style scoped>
.tower-min-height {
	min-height: calc(100vh - 20rem);
}

.tower-min-height-readOnly {
	min-height: calc(100vh - 14rem);
}

.tower-min-panel-height {
	min-height: max(calc(100vh - 22rem), 6rem);
	max-height: calc(100vh - 22rem);
	overflow: auto;
}

.tower-min-panel-height-readOnly {
	min-height: max(calc(100vh - 15rem), 6rem);
	max-height: calc(100vh - 15rem);
	overflow: auto;
}

.tower-min-restriction-panel-height {
	min-height: max(calc(100vh - 24rem), 6rem);
	max-height: calc(100vh - 24rem);
	overflow: auto;
}

.tower-min-restriction-panel-height-readOnly {
	min-height: max(calc(100vh - 20rem), 6rem);
	max-height: calc(100vh - 20rem);
	overflow: auto;
}
</style>