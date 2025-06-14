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
	<div class="tw-relative">
		<q-dialog v-model="deleteDialog" persistent>
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Remove constant variable</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove
					<span class="tw-italic">{{ localName }}</span> constant variable?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="removeVariable"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>

		<div
			:class="{
				'tw-grid-cols-2': grid === 2,
				'tw-grid-cols-5': grid === 3,
				'tw-rounded': wasModified || !!error,
				configurationRowModified: wasModified && !error && !isConstantVariable,
				'tw-bg-negative-200': !!error,
			}"
			class="tw-grid tw-w-full tw-gap-3 tw-min-h-[2.75rem] tw-pl-2 tw-mr-2 tw-my-px"
		>
			<div
				:class="{
					'tw-line-through': deleted,
					'tw-italic': deleted,
					'tw-text-gray-500': deleted,
				}"
				class="tw-self-center fullWordWrap tw-flex"
			>
				<q-icon
					v-if="isConstantVariable"
					class="tw-pr-2 filled tw-self-center"
					name="sym_o_bookmark"
					size="sm"
				>
					<q-tooltip :delay="300">Constant variable</q-tooltip>
				</q-icon>
				<div class="tw-my-auto">
					{{ localName }}
				</div>
			</div>
			<div
				v-if="grid === 3"
				class="tw-text-center tw-self-center tw-col-span-2"
			>
				<template v-if="!currentArchive">
					<div class="tw-italic tw-text-gray-500">
						Variable doesn't exist in this version
					</div>
				</template>
				<template v-else>
					<div class="tw-flex 2xl:tw-flex-row tw-flex-col tw-my-0.5">
						<!-- Type -->
						<div class="tw-flex tw-grow">
							<q-icon
								v-if="!forced"
								:class="{
									'tw-bg-secondary':
										currentArchive.type !==
											(localType as typeInterface)?.value &&
										!deleted &&
										showDiff,
									deleted: deleted,
								}"
								:color="
									currentArchive.type !== (localType as typeInterface)?.value &&
									showDiff
										? 'dark'
										: undefined
								"
								:name="currentArchiveTypeIcon"
								class="tw-flex-none tw-p-2 tw-mx-0.5 tw-rounded tw-self-center"
								size="sm"
							/>
							<!-- Variable -->
							<div class="tw-text-center tw-grow tw-self-center fullWordWrap">
								<div v-if="valueExists(currentArchive) && !deleted && !forced">
									<template
										v-if="
											localTypeComputed ===
												ConfigurationVariableType.PASSWORD && !passwordVisible
										"
									>
										&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;
									</template>
									<template v-else>
										<template v-if="showDiff">
											<template
												v-for="(diff, index) of diffStrings(
													valueAsString(
														(localType as typeInterface)?.value ===
															ConfigurationVariableType.AWS
															? `${localValue} : ${localKey}`
															: localValue,
													),
													valueAsString(
														currentArchive?.type ===
															ConfigurationVariableType.AWS
															? `${currentArchive.value} : ${currentArchive.valueKey}`
															: currentArchive?.value,
													),
												)"
												:key="`${diff.value}_${index}`"
											>
												<span
													v-if="diff.removed"
													class="tw-text-negative tw-line-through"
												>
													{{ diff.value }}
												</span>
												<span v-else-if="diff.added" class="tw-text-positive">
													{{ diff.value }}
												</span>
												<span v-else>
													{{ diff.value }}
												</span>
											</template>
										</template>
										<template v-else
											>{{
												valueAsString(
													currentArchive?.type === ConfigurationVariableType.AWS
														? `${currentArchive.value}:${currentArchive.valueKey}`
														: currentArchive?.value,
												)
											}}
										</template>
									</template>
								</div>
								<div
									v-else-if="currentArchive?.value === null"
									:class="{ 'tw-line-through': deleted }"
									class="tw-italic tw-text-gray-500"
								>
									Empty value
								</div>
								<div
									v-else-if="deleted"
									class="tw-italic tw-text-gray-500 tw-line-through"
								>
									{{ localValue }}
								</div>
							</div>
							<div v-if="!forced" class="tw-flex tw-ml-3 tw-self-center">
								<!-- revert -->
								<q-separator inset vertical />
								<q-btn
									:disable="!revertEnabled"
									flat
									icon="sym_o_undo"
									padding="sm"
									@click="revert"
								>
									<q-tooltip v-if="revertEnabled"
										>{{ deleted ? 'Recreate variable' : 'Undo changes' }}
									</q-tooltip>
								</q-btn>
							</div>
						</div>
					</div>
				</template>
			</div>
			<div
				v-if="!deleted"
				:class="{ 'tw-col-span-2': grid === 3 }"
				class="tw-flex tw-self-center"
			>
				<!-- Type -->
				<type-select
					v-model="localType"
					:disabled="forced"
					class="tw-self-center"
				/>
				<!-- value -->
				<div class="tw-flex-grow tw-mx-2">
					<!-- String -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.STRING
						"
					>
						<q-input
							v-model="localValue as string"
							:debounce="300"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hint="
								!!sourceBase && !!sourceModel && forced
									? `Variable value forced by the ${sourceBase}`
									: undefined
							"
							:hide-bottom-space="true"
							color="secondary"
							dense
						/>
					</template>
					<!-- Password -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.PASSWORD
						"
					>
						<q-input
							v-model="localValue as string"
							:debounce="300"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hide-bottom-space="true"
							:type="passwordVisible ? 'text' : 'password'"
							autocomplete="off"
							:hint="
								!!sourceBase && !!sourceModel && forced
									? `Variable value forced by the ${sourceBase}`
									: undefined
							"
							color="secondary"
							dense
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
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.NUMBER
						"
					>
						<q-input
							v-model="localValue"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hide-bottom-space="true"
							:hint="
								!!sourceBase && !!sourceModel && forced
									? `Variable value forced by the ${sourceBase}`
									: undefined
							"
							color="secondary"
							dense
							input-debounce="300"
							type="number"
						/>
					</template>
					<!-- Boolean -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.BOOLEAN
						"
					>
						<q-btn-toggle
							v-model="localValue"
							:disable="forced"
							:options="[
								{ label: 'True', value: true },
								{ label: 'False', value: false },
							]"
							:toggle-color="!!error ? 'negative' : 'secondary'"
							toggle-text-color="primary"
							class="tw-mt-1.5"
							dense
							spread
							unelevated
						/>
						<div
							v-if="!!error"
							class="tw-text-negative tw-pt-2 tw-pb-px booleanErrorField tw-break-words"
						>
							{{ error }}
						</div>
						<div
							v-else-if="!!sourceBase && !!sourceModel && forced"
							v-text="`Variable value forced by the ${sourceBase}`"
							class="tw-text-disabled booleanErrorField tw-break-words"
						></div>
					</template>
					<!-- Text -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.TEXT
						"
					>
						<q-input
							v-model="localValue"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hint="
								!!sourceBase && !!sourceModel && forced
									? `Variable value forced by the ${sourceBase}`
									: undefined
							"
							:hide-bottom-space="true"
							color="secondary"
							dense
							type="textarea"
						/>
					</template>
					<!-- List -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.LIST
						"
					>
						<q-select
							v-model="localValue"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:class="{
								configurationVariableSelectModified: wasModified && !error,
							}"
							:hint="
								!!sourceBase && !!sourceModel && forced
									? `Variable value forced by the ${sourceBase}`
									: undefined
							"
							:hide-bottom-space="true"
							color="secondary"
							dense
							hide-dropdown-icon
							input-debounce="300"
							multiple
							new-value-mode="add"
							use-chips
							use-input
						>
						</q-select>
					</template>
					<!-- Vault -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.VAULT
						"
					>
						<q-input
							v-model="localValue"
							:disable="forced"
							:error="!!error"
							:hint="
								!!sourceBase && !!sourceModel && forced
									? `Variable value forced by the ${sourceBase}`
									: undefined
							"
							:error-message="error"
							:hide-bottom-space="true"
							color="secondary"
							dense
							input-debounce="300"
						/>
					</template>
					<!-- AWS -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.AWS
						"
					>
						<div class="tw-flex tw-gap-1">
							<q-input
								v-model="localValue"
								class="tw-flex-grow"
								:disable="forced"
								:error="!!error"
								label="Secret name"
								:hint="
									!!sourceBase && !!sourceModel && forced
										? `Variable value forced by the ${sourceBase}`
										: undefined
								"
								:error-message="error"
								:hide-bottom-space="true"
								color="secondary"
								dense
								input-debounce="300"
							/>
							<q-input
								v-model="localKey"
								class="tw-flex-grow"
								:disable="forced"
								label="Key"
								:hide-bottom-space="true"
								color="secondary"
								dense
								input-debounce="300"
							/>
						</div>
					</template>
					<!-- Azure -->
					<template
						v-if="
							(localType as typeInterface)?.value ===
							ConfigurationVariableType.AZURE
						"
					>
						<q-input
							v-model="localValue"
							:disable="forced"
							:error="!!error"
							:hint="
								!!sourceBase && !!sourceModel && forced
									? `Variable value forced by the ${sourceBase}`
									: undefined
							"
							:error-message="error"
							:hide-bottom-space="true"
							color="secondary"
							dense
							input-debounce="300"
						/>
					</template>
				</div>
				<!-- delete variable -->
				<q-separator inset vertical />
				<q-btn
					:disable="!allowDelete"
					flat
					padding="sm"
					:color="deleteButtonColor"
					@mouseenter="allowDelete ? (deleteButtonColor = 'negative') : null"
					@mouseleave="allowDelete ? (deleteButtonColor = undefined) : null"
					@click="deleteDialog = true"
				>
					<q-icon name="sym_o_delete" :color="deleteButtonColor"></q-icon>
				</q-btn>
			</div>
			<div
				v-else
				class="tw-text-center tw-self-center tw-italic tw-text-gray-500 tw-col-span-2"
			>
				Deleted variable
			</div>
		</div>
		<q-separator color="dark"></q-separator>
	</div>
</template>

<script lang="ts" setup>
import { computed, Ref, ref, watch } from 'vue';
import {
	ConfigurationVariableType,
	typeInterface,
	typeOptions,
	valueAsString,
	valueConverter,
	valueExists,
} from 'components/constantVariables/constantVariable';
import TypeSelect from 'components/basic/typeSelect.vue';
import { diffChars } from 'diff';
import { isNil } from 'lodash';
import { ConfigurationVariable } from 'components/configuration/configuration';

//====================================================
// Props
//====================================================
const props = defineProps<{
	grid: number;
	name: string;
	type: ConfigurationVariableType;
	value?: string | number | Array<string> | boolean | null | undefined;
	valueKey?: string;
	deleted?: boolean;
	isConstantVariable?: boolean;
	forced?: boolean;
	allowDelete?: boolean;
	error?: string;
	disable?: boolean;
	showDiff?: boolean;
	sourceBase?: string;
	sourceModel?: string;
	currentArchive?: ConfigurationVariable;
}>();

//====================================================
// Emits
//====================================================
const emit = defineEmits([
	'removeVariable',
	'update:value',
	'update:type',
	'update:valueKey',
	'addVariable',
]);

//====================================================
// Data
//====================================================
const localName = ref(props.name);
const localType: Ref<typeInterface | string> = ref('');
const localValue = ref(props.value);
const localKey = ref(props.valueKey);
const deleteDialog = ref(false);
const deleteButtonColor: Ref<string | undefined> = ref(undefined);
const passwordVisible = ref(false);

//====================================================
// Methods
//====================================================
/**
 * Retrieves the corresponding icon for the given type.
 * @param {string} type - The type for which the icon should be retrieved.
 * @returns {string} The icon associated with the given type. If the type is not found, an empty string is returned.
 */
const getTypeIcon = (type: string): string => {
	const found = typeOptions.find((el) => el.value === type);
	return found ? found.icon : '';
};

/**
 * Initializes the localType ref based on the prop type.
 * @param {ConfigurationVariableType | typeInterface} typeProp - The type from props.
 */
const initializeLocalType = (
	typeProp: ConfigurationVariableType | typeInterface,
) => {
	if (typeof typeProp === 'string') {
		localType.value = {
			label: '',
			value: typeProp,
			valueKey: '',
			icon: getTypeIcon(typeProp),
		};
	} else {
		localType.value = typeProp;
	}
};

/**
 * Removes a variable by emitting a 'removeVariable' event.
 */
const removeVariable = () => {
	emit('removeVariable', localName.value);
};

/**
 * Adds a variable, typically used when a deleted variable is "reverted" back.
 * @param {ConfigurationVariable} variable - The variable to add.
 */
const addVariable = (variable: ConfigurationVariable) => {
	emit('addVariable', variable);
};

/**
 * Reverts the local state or configuration to align with current archive or deleted properties.
 */
const revert = () => {
	if (props.deleted) {
		const variable: ConfigurationVariable = {
			name: localName.value,
			type: props.currentArchive?.type ?? ConfigurationVariableType.STRING,
			value: props.currentArchive?.value,
		};
		if (props.currentArchive?.type === ConfigurationVariableType.AWS) {
			variable.valueKey = props.currentArchive?.valueKey;
		}
		addVariable(variable);
		return;
	}

	if (props.currentArchive) {
		if (
			props.currentArchive.type &&
			localTypeComputed.value !== props.currentArchive.type
		) {
			const foundType = typeOptions.find((el: typeInterface) => {
				return el.value === props.currentArchive?.type;
			});
			if (foundType) {
				localType.value = foundType;
			}
		}

		if (
			props.currentArchive.value !== undefined &&
			localValue.value !== props.currentArchive.value
		) {
			localValue.value = props.currentArchive.value;
		}

		if (!isNil(props.currentArchive.valueKey)) {
			localKey.value = props.currentArchive.valueKey;
		}
	}
};

/**
 * Calculates the difference between two strings.
 * @param current - The current string.
 * @param archive - The archive string.
 */
const diffStrings = (current: string, archive: string) => {
	return props.deleted ? diffChars(archive, '') : diffChars(archive, current);
};

//====================================================
// Computed
//====================================================
/**
 * Computed property for the icon of the current archive type.
 */
const currentArchiveTypeIcon = computed(() => {
	if (props.currentArchive?.type) {
		return getTypeIcon(props.currentArchive.type);
	}
	return undefined;
});

/**
 * Computed property indicating if revert functionality is enabled.
 */
const revertEnabled = computed(() => {
	if (props.deleted) {
		return true;
	}
	if (!props.currentArchive) {
		return false;
	}

	const archive = props.currentArchive;
	const currentLocalTypeValue = localTypeComputed.value;

	if (currentLocalTypeValue === ConfigurationVariableType.AWS) {
		if (localKey.value !== archive.valueKey) {
			return true;
		}
	}

	return (
		archive.type !== currentLocalTypeValue ||
		valueAsString(archive.value) !== valueAsString(localValue.value)
	);
});

/**
 * Computed property indicating if the variable was modified.
 */
const wasModified = computed(() => {
	if (props.deleted) {
		return true;
	}
	if (!props.currentArchive && !props.isConstantVariable) {
		return true;
	} else if (props.currentArchive) {
		const archive = props.currentArchive;
		const currentLocalTypeValue = localTypeComputed.value;

		return (
			archive.type !== currentLocalTypeValue ||
			valueConverter(archive.value, ConfigurationVariableType.STRING) !==
				valueConverter(localValue.value, ConfigurationVariableType.STRING)
		);
	}
	return false;
});

/**
 * Computed property for the actual string value of localType.
 */
const localTypeComputed = computed(() => {
	return typeof localType.value === 'string'
		? localType.value
		: localType.value.value;
});

//====================================================
// Watchers
//====================================================
// Initialize localType on component setup
initializeLocalType(props.type);

watch(
	localType,
	(newValue, oldValue) => {
		const currentLocalTypeValue = localTypeComputed.value;
		localValue.value = valueConverter(
			localValue.value,
			currentLocalTypeValue as ConfigurationVariableType,
		);
		emit('update:type', currentLocalTypeValue);
		emit('update:value', localValue.value);

		// Only add variable if it's a constant variable and not forced, and it's not the initial setup.
		// The initial setup is handled by calling initializeLocalType and the immediate watch.
		if (
			props.isConstantVariable &&
			!props.forced &&
			oldValue !== undefined // Check to ensure it's not the initial immediate run
		) {
			emit('addVariable', {
				name: localName.value,
				type: currentLocalTypeValue,
				value: localValue.value,
			});
		}
	},
	{
		immediate: true,
	},
);

watch(localValue, (newValue, oldValue) => {
	emit('update:value', newValue);
	if (
		props.isConstantVariable &&
		!props.forced &&
		oldValue !== undefined // Check to ensure it's not the initial immediate run
	) {
		emit('addVariable', {
			name: localName.value,
			type: localTypeComputed.value,
			value: newValue,
		});
	}
});

watch(localKey, (newValue) => {
	emit('update:valueKey', newValue);
});

watch(
	() => props.value,
	(current) => {
		if (current !== localValue.value) {
			localValue.value = current;
		}
	},
);

watch(
	() => props.type,
	(current) => {
		if (current !== localType.value) {
			initializeLocalType(current);
		}
	},
);
</script>

<style lang="scss"></style>
