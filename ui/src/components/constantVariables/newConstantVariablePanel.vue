<template>
	<q-card
		class="tw-bg-darkPage tw-text-secondary tw-px-4 tw-pb-1 tw-pt-1 tw-rounded"
		flat
	>
		<div class="tw-w-full tw-grid tw-grid-cols-3 tw-gap-3 tw-content-center">
			<!-- Name -->
			<q-input
				ref="nameRef"
				v-model="name"
				:rules="[
					val =>
						!existingVariableNames.includes(val) ||
						'Variable with this name exists already'
				]"
				color="secondary"
				dense
				label="New constant variable name"
			/>
			<!-- Type -->
			<type-select
				v-model="type"
				:standard="true"
				:withLabel="true"
			></type-select>
			<!-- value -->
			<div class="tw-flex">
				<div class="tw-flex-grow tw-mx-2">
					<!-- String -->
					<template v-if="type.value === ConfigurationVariableType.STRING">
						<q-input
							v-model="value"
							color="secondary"
							dense
							label="New constant variable value"
						/>
					</template>
					<!-- Password -->
					<template v-if="type.value === ConfigurationVariableType.PASSWORD">
						<q-input
							v-model="value"
							:type="passwordVisible ? 'text' : 'password'"
							color="secondary"
							dense
							label="New constant variable value"
						>
							<template #append>
								<q-btn
									:icon="passwordVisible ? 'sym_o_lock' : 'sym_o_lock_open'"
									flat
									padding="sm"
									@click="passwordVisible = !passwordVisible"
								></q-btn>
							</template>
						</q-input>
					</template>
					<!-- Number -->
					<template v-if="type.value === ConfigurationVariableType.NUMBER">
						<q-input
							v-model="value"
							color="secondary"
							dense
							label="New constant variable value"
							type="number"
						/>
					</template>
					<!-- Boolean -->
					<template v-if="type.value === ConfigurationVariableType.BOOLEAN">
						<q-btn-toggle
							v-model="value"
							:options="[
								{ label: 'True', value: true },
								{ label: 'False', value: false }
							]"
							class="tw-mt-1.5"
							dense
							spread
							toggle-color="primary"
						/>
					</template>
					<!-- Text -->
					<template v-if="type.value === ConfigurationVariableType.TEXT">
						<q-input
							v-model="value"
							color="secondary"
							dense
							label="New constant variable value"
							type="textarea"
						/>
					</template>
					<!-- List -->
					<template v-if="type.value === ConfigurationVariableType.LIST">
						<q-select
							v-model="value"
							color="secondary"
							dense
							hide-dropdown-icon
							input-debounce="0"
							label="New constant variable value"
							multiple
							new-value-mode="add"
							use-chips
							use-input
						/>
					</template>
					<!-- Vault -->
					<template v-if="type.value === ConfigurationVariableType.VAULT">
						<q-input
							v-model="value"
							color="secondary"
							dense
							label="New constant variable value"
						/>
					</template>
				</div>
				<!-- Forced -->
				<q-checkbox
					v-model="forced"
					checked-icon="sym_o_edit_off"
					size="lg"
					unchecked-icon="sym_o_edit"
				>
					<q-tooltip>Editable in configuration</q-tooltip>
				</q-checkbox>
				<!-- Add if absent -->
				<q-checkbox
					v-model="addIfAbsent"
					checked-icon="sym_o_published_with_changes"
					size="lg"
					unchecked-icon="sym_o_sync_disabled"
				>
					<q-tooltip>Add variable if not in configuration</q-tooltip>
				</q-checkbox>
				<!-- delete variable -->
				<q-separator inset vertical />
				<q-btn
					:disable="!name || nameRef.hasError"
					flat
					icon="sym_o_add"
					padding="sm"
					@click="addNewVariable"
				>
					<q-tooltip v-if="name && !nameRef.hasError"
						>Add new constant variable
					</q-tooltip>
				</q-btn>
			</div>
		</div>
	</q-card>
</template>

<script lang="ts" setup>
import {
	ConfigurationVariableType,
	typeOptions,
	valueConverter
} from 'components/constantVariables/constantVariable';
//====================================================
// Data
//====================================================
import { Ref, ref, watch } from 'vue';
import TypeSelect from 'components/basic/typeSelect.vue';

//====================================================
// Props
//====================================================
withDefaults(
	defineProps<{
		existingVariableNames?: Array<string>;
	}>(),
	{
		existingVariableNames: () => []
	}
);

const name: Ref<string | null> = ref(null);
const type = ref(typeOptions[0]);
const value: Ref<
	string | number | boolean | string[] | null | undefined | unknown
> = ref('');
const forced = ref(true);
const addIfAbsent = ref(true);

const passwordVisible = ref(false);

const nameRef = ref(null);

//====================================================
// Emits
//====================================================
const emit = defineEmits(['addNewConstantVariable']);

//====================================================
// Methods
//====================================================

/**
 * addNewVariable
 */
const addNewVariable = () => {
	emit('addNewConstantVariable', {
		name: name.value,
		type: type.value.value,
		value: value.value,
		forced: forced.value,
		addIfAbsent: addIfAbsent.value,
		isNew: true
	});

	name.value = null;
	type.value = typeOptions[0];
	value.value = '';
	forced.value = true;
	addIfAbsent.value = true;
};

//====================================================
// Watch
//====================================================
watch(
	() => type.value.value,
	() => {
		value.value = valueConverter(value.value, type.value.value);
	}
);
</script>

<style scoped></style>
