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
		class="tw-bg-darkPage tw-text-secondary tw-px-4 tw-pb-1 tw-pt-1 tw-rounded"
		flat
	>
		<div class="tw-w-full tw-grid tw-grid-cols-3 tw-gap-3 tw-content-center">
			<!-- Name -->
			<q-input
				ref="nameRef"
				:autofocus="false"
				v-model="name"
				:rules="[
					(val) =>
						!existingVariableNames.includes(val) ||
						'Variable with this name exists already',
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
					<template v-if="type?.value === ConfigurationVariableType.STRING">
						<q-input
							v-model="value as string"
							:autofocus="false"
							color="secondary"
							dense
							label="New constant variable value"
						/>
					</template>
					<!-- Password -->
					<template v-if="type?.value === ConfigurationVariableType.PASSWORD">
						<q-input
							v-model="value as string"
							:autofocus="false"
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
					<template v-if="type?.value === ConfigurationVariableType.NUMBER">
						<q-input
							v-model="value as number"
							:autofocus="false"
							color="secondary"
							dense
							label="New constant variable value"
							type="number"
						/>
					</template>
					<!-- Boolean -->
					<template v-if="type?.value === ConfigurationVariableType.BOOLEAN">
						<q-btn-toggle
							v-model="value as boolean"
							:options="[
								{ label: 'True', value: true },
								{ label: 'False', value: false },
							]"
							class="tw-mt-1.5"
							dense
							spread
							toggle-color="primary"
						/>
					</template>
					<!-- Text -->
					<template v-if="type?.value === ConfigurationVariableType.TEXT">
						<q-input
							v-model="value as string"
							:autofocus="false"
							color="secondary"
							dense
							label="New constant variable value"
							type="textarea"
						/>
					</template>
					<!-- List -->
					<template v-if="type?.value === ConfigurationVariableType.LIST">
						<q-select
							v-model="value as Array<string>"
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
					<template v-if="type?.value === ConfigurationVariableType.VAULT">
						<q-input
							v-model="value as string"
							:autofocus="false"
							color="secondary"
							dense
							label="New constant variable value"
						/>
					</template>
					<!-- AWS -->
					<template v-if="type?.value === ConfigurationVariableType.AWS">
						<div class="flex tw-gap-1">
							<q-input
								v-model="value as string"
								:autofocus="false"
								color="secondary"
								class="tw-flex-grow"
								dense
								label="New constant variable secret name"
							/>
							<q-input
								v-model="valueKey as string"
								:autofocus="false"
								class="tw-flex-grow"
								color="secondary"
								dense
								label="New constant variable key"
							/>
						</div>
					</template>
					<!-- Azure -->
					<template v-if="type?.value === ConfigurationVariableType.AZURE">
						<div class="flex tw-gap-1">
							<q-input
								v-model="value as string"
								:autofocus="false"
								class="tw-flex-grow"
								color="secondary"
								dense
								label="New constant variable value"
							/>
						</div>
					</template>
				</div>
				<!-- Forced -->
				<q-checkbox
					v-model="forced"
					checked-icon="sym_o_edit_off"
					size="lg"
					color="secondary"
					keep-color
					unchecked-icon="sym_o_edit"
				>
					<q-tooltip>Editable in configuration</q-tooltip>
				</q-checkbox>
				<!-- Add if absent -->
				<q-checkbox
					v-model="addIfAbsent"
					checked-icon="sym_o_share"
					size="lg"
					color="secondary"
					keep-color
					unchecked-icon="sym_o_share_off"
				>
					<q-tooltip>Add variable if not in configuration</q-tooltip>
				</q-checkbox>
				<!-- delete variable -->
				<q-separator inset vertical />
				<q-btn
					:disable="!name || nameRef?.hasError"
					flat
					icon="sym_o_add"
					padding="sm"
					@click="addNewVariable"
				>
					<q-tooltip v-if="name && !nameRef?.hasError"
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
	valueConverter,
} from 'components/constantVariables/constantVariable';
//====================================================
// Data
//====================================================
import { Ref, ref, watch } from 'vue';
import TypeSelect from 'components/basic/typeSelect.vue';
import { QInput } from 'quasar';

//====================================================
// Props
//====================================================
withDefaults(
	defineProps<{
		existingVariableNames?: Array<string>;
	}>(),
	{
		existingVariableNames: () => [],
	},
);

const name: Ref<string | null> = ref(null);
const type = ref(typeOptions[0]);
const value: Ref<
	string | number | boolean | string[] | null | undefined | unknown
> = ref('');
const valueKey = ref('');
const forced = ref(true);
const addIfAbsent = ref(true);

const passwordVisible = ref(false);

const nameRef: Ref<QInput | null> = ref(null);

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
		type: type?.value?.value,
		value: value.value,
		valueKey: valueKey.value,
		forced: forced.value,
		addIfAbsent: addIfAbsent.value,
		isNew: true,
	});

	name.value = null;
	type.value = typeOptions[0];
	value.value = '';
	valueKey.value = '';
	forced.value = true;
	addIfAbsent.value = true;
};

//====================================================
// Watch
//====================================================
watch(
	() => type?.value?.value,
	() => {
		value.value = valueConverter(
			value.value,
			type?.value?.value ?? ConfigurationVariableType.STRING,
		);
	},
);
</script>

<style scoped></style>
