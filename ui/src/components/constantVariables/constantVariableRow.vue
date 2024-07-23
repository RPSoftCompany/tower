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
	<div>
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
				'tw-rounded': wasModified || isNew || deleted,
				configurationRowModified: wasModified || isNew || deleted,
			}"
			class="tw-grid tw-w-full tw-gap-3 tw-min-h-[2.75rem] tw-pl-2 tw-mr-2 tw-my-px"
		>
			<div
				:class="{
					'tw-line-through': deleted,
					'tw-italic': deleted,
					'tw-text-gray-500': deleted,
				}"
				class="tw-self-center fullWordWrap"
			>
				{{ localName }}
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
								:class="{
									'tw-bg-secondary':
										currentArchive.type !== localType.value &&
										!deleted &&
										showDiff,
									deleted: deleted,
								}"
								:color="
									currentArchive.type !== localType.value && showDiff
										? 'dark'
										: undefined
								"
								:name="currentArchiveTypeIcon"
								class="tw-flex-none tw-p-2 tw-mx-0.5 tw-rounded tw-self-center"
								size="sm"
							/>
							<!-- Variable -->
							<div class="tw-text-center tw-grow tw-self-center fullWordWrap">
								<div
									v-if="
										localType.value === ConfigurationVariableType.PASSWORD &&
										!passwordVisible
									"
								>
									&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;
								</div>
								<div v-else-if="valueExists(currentArchive) && !deleted">
									<template v-if="showDiff">
										<template
											v-for="(diff, index) of diffStrings(
												valueAsString(localValue),
												valueAsString(currentArchive?.value),
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
									<template v-else>
										{{ valueAsString(currentArchive.value) }}
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
						</div>
						<div class="tw-flex tw-self-center">
							<!-- Forced -->
							<q-icon
								:class="{
									'tw-bg-secondary':
										currentArchive.forced !== localForced &&
										!deleted &&
										showDiff,
									deleted: deleted,
								}"
								:color="
									currentArchive?.forced !== localForced && showDiff
										? 'dark'
										: undefined
								"
								:name="currentArchive?.forced ? 'sym_o_edit_off' : 'sym_o_edit'"
								class="tw-flex-none tw-p-2 tw-mx-0.5 tw-rounded"
								size="sm"
							/>
							<!-- Add if absent -->
							<q-icon
								:class="{
									'tw-bg-secondary':
										currentArchive.addIfAbsent !== localAddIfAbsent &&
										!deleted &&
										showDiff,
									deleted: deleted,
								}"
								:color="
									currentArchive.addIfAbsent !== localAddIfAbsent && showDiff
										? 'dark'
										: undefined
								"
								:name="
									currentArchive.addIfAbsent ? 'sym_o_share' : 'sym_o_share_off'
								"
								class="tw-flex-none tw-p-2 tw-mx-0.5 tw-rounded"
								size="sm"
							/>
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
				</template>
			</div>
			<div
				v-if="!deleted"
				:class="{ 'tw-col-span-2': grid === 3 }"
				class="tw-flex tw-self-center"
			>
				<!-- Type -->
				<type-select v-model="localType" :disable="disable" />
				<!-- value -->
				<div class="tw-flex-grow tw-mx-2">
					<!-- String -->
					<template v-if="localType.value === ConfigurationVariableType.STRING">
						<q-input
							v-model="localValue"
							:disable="disable"
							color="secondary"
							dense
						/>
					</template>
					<!-- Password -->
					<template
						v-if="localType.value === ConfigurationVariableType.PASSWORD"
					>
						<q-input
							v-model="localValue"
							:disable="disable"
							autocomplete="off"
							:type="passwordVisible ? 'text' : 'password'"
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
					<template v-if="localType.value === ConfigurationVariableType.NUMBER">
						<q-input
							v-model="localValue"
							:disable="disable"
							color="secondary"
							dense
							type="number"
						/>
					</template>
					<!-- Boolean -->
					<template
						v-if="localType.value === ConfigurationVariableType.BOOLEAN"
					>
						<q-btn-toggle
							v-model="localValue"
							:disable="disable"
							:options="[
								{ label: 'True', value: true },
								{ label: 'False', value: false },
							]"
							class="tw-mt-1.5"
							dense
							spread
							toggle-color="dark"
							unelevated
						/>
					</template>
					<!-- Text -->
					<template v-if="localType.value === ConfigurationVariableType.TEXT">
						<q-input
							v-model="localValue"
							:disable="disable"
							color="secondary"
							dense
							type="textarea"
						/>
					</template>
					<!-- List -->
					<template v-if="localType.value === ConfigurationVariableType.LIST">
						<q-select
							v-model="localValue"
							:disable="disable"
							color="secondary"
							:class="{
								configurationVariableSelectModified:
									wasModified || isNew || deleted,
							}"
							dense
							hide-dropdown-icon
							input-debounce="0"
							multiple
							new-value-mode="add"
							use-chips
							use-input
						/>
					</template>
					<!-- Vault -->
					<template v-if="localType.value === ConfigurationVariableType.VAULT">
						<q-input
							v-model="localValue"
							:disable="disable"
							color="secondary"
							dense
						/>
					</template>
					<!-- AWS -->
					<template v-if="localType.value === ConfigurationVariableType.AWS">
						<div class="tw-flex tw-gap-1">
							<q-input
								v-model="localValue"
								class="tw-flex-grow"
								:disable="disable"
								label="Secret name"
								:hide-bottom-space="true"
								color="secondary"
								dense
								input-debounce="300"
							/>
							<q-input
								v-model="localKey"
								class="tw-flex-grow"
								:disable="disable"
								label="Key"
								:hide-bottom-space="true"
								color="secondary"
								dense
								input-debounce="300"
							/>
						</div>
					</template>
					<!-- Azure -->
					<template v-if="localType.value === ConfigurationVariableType.AZURE">
						<q-input
							v-model="localValue"
							label="Secret Name"
							:disable="disable"
							color="secondary"
							dense
						/>
					</template>
				</div>
				<!-- Forced -->
				<q-checkbox
					v-model="localForced"
					:disable="disable"
					checked-icon="sym_o_edit_off"
					color="secondary"
					keep-color
					size="lg"
					unchecked-icon="sym_o_edit"
				>
					<q-tooltip>Editable in configuration</q-tooltip>
				</q-checkbox>
				<!-- Add if absent -->
				<q-checkbox
					v-model="localAddIfAbsent"
					:disable="disable"
					checked-icon="sym_o_share"
					color="secondary"
					keep-color
					size="lg"
					unchecked-icon="sym_o_share_off"
				>
					<q-tooltip>Add variable if not in configuration</q-tooltip>
				</q-checkbox>
				<!-- delete variable -->
				<q-separator inset vertical />
				<q-btn
					:disable="disable"
					flat
					padding="sm"
					:color="deleteButtonColor"
					@mouseenter="!disable ? (deleteButtonColor = 'negative') : null"
					@mouseleave="!disable ? (deleteButtonColor = undefined) : null"
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

//====================================================
// Props
//====================================================
const props = defineProps<{
	grid: number;

	name: string;
	type: ConfigurationVariableType;
	value: string | number | Array<string> | boolean | null | undefined;
	valueKey?: string;
	forced: boolean;
	addIfAbsent: boolean;
	deleted?: boolean;
	isNew?: boolean;
	disable?: boolean;
	showDiff: boolean;
	currentArchive?: {
		type: ConfigurationVariableType;
		value: string | number | Array<string> | boolean | null | undefined;
		forced: boolean;
		valueKey?: string;
		addIfAbsent: boolean;
	};
	currentVersion?: {
		type: ConfigurationVariableType;
		value: string | number | Array<string> | boolean | null | undefined;
		forced: boolean;
		addIfAbsent: boolean;
	};
}>();

//====================================================
// Methods
//====================================================
/**
 * getTypeIcon
 * @param type
 */
const getTypeIcon = (type: string) => {
	const found = typeOptions.find((el) => {
		return el.value === type;
	});

	if (found) {
		return found.icon;
	}

	return '';
};

/**
 * removeVariable
 */
const removeVariable = () => {
	emit('removeVariable', localName.value);
};

/**
 * revert
 */
const revert = () => {
	if (props.deleted) {
		emit('addVariable', {
			name: localName.value,
			type: props.currentArchive?.type,
			value: props.currentArchive?.value,
			valueKey: props.currentArchive?.valueKey,
			forced: props.currentArchive?.forced,
			addIfAbsent: props.currentArchive?.addIfAbsent,
		});

		return;
	}

	if (
		props.currentArchive?.type &&
		localType.value.value !== props.currentArchive?.type
	) {
		const value = typeOptions.find((el: typeInterface) => {
			return el.value === props.currentArchive?.type;
		});
		if (value !== undefined) {
			localType.value = value;
		}
	}

	if (
		props.currentArchive?.forced !== undefined &&
		localForced.value !== props.currentArchive?.forced
	) {
		localForced.value = props.currentArchive.forced;
	}

	if (
		props.currentArchive?.addIfAbsent !== undefined &&
		localAddIfAbsent.value !== props.currentArchive?.addIfAbsent
	) {
		localAddIfAbsent.value = props.currentArchive?.addIfAbsent;
	}

	if (
		props.currentArchive?.value !== undefined &&
		localValue.value !== props.currentArchive?.value
	) {
		localValue.value = props.currentArchive?.value;
	}

	if (
		props.currentArchive?.valueKey !== undefined &&
		localKey.value !== props.currentArchive?.valueKey
	) {
		localKey.value = props.currentArchive?.valueKey;
	}
};

/**
 * diffStrings
 * @param current
 * @param archive
 */
const diffStrings = (current: string, archive: string) => {
	if (props.deleted) {
		return diffChars(archive, '');
	}
	return diffChars(archive, current);
};
//====================================================
// Data
//====================================================
const localName = ref(props.name);
const localType: Ref<typeInterface> = ref({
	label: '',
	value: props.type,
	icon: getTypeIcon(props.type),
});
const localValue = ref(props.value);
const localKey = ref(props.valueKey);
const localForced = ref(props.forced);
const localAddIfAbsent = ref(props.addIfAbsent);

const deleteDialog = ref(false);
const deleteButtonColor: Ref<string | undefined> = ref(undefined);

const passwordVisible = ref(false);

//====================================================
// Computed
//====================================================
const currentArchiveTypeIcon = computed(() => {
	if (props.currentArchive) {
		const found = typeOptions.find((el) => {
			return el.value === props.currentArchive?.type;
		});

		if (found) {
			return found.icon;
		}
	}

	return undefined;
});

const revertEnabled = computed(() => {
	if (props.deleted) {
		return true;
	}

	if (!props.currentArchive) {
		return false;
	} else {
		const archive = props.currentArchive;
		return (
			archive.type !== localType.value.value ||
			valueAsString(archive.value) !== valueAsString(localValue.value) ||
			archive.addIfAbsent !== localAddIfAbsent.value ||
			archive.forced !== localForced.value ||
			archive.valueKey !== localKey.value
		);
	}
});

/**
 * wasModified
 */
const wasModified = computed(() => {
	if (props.deleted) {
		return true;
	}

	if (props.currentVersion) {
		const archive = props.currentVersion;
		return (
			archive.type !== localType.value.value ||
			valueAsString(archive.value) !== valueAsString(localValue.value) ||
			archive.addIfAbsent !== localAddIfAbsent.value ||
			archive.forced !== localForced.value
		);
	}

	return false;
});

//====================================================
// Emit
//====================================================
const emit = defineEmits([
	'removeVariable',
	'update:value',
	'update:valueKey',
	'update:type',
	'update:forced',
	'update:addIfAbsent',
	'addVariable',
]);

//====================================================
// Watch
//====================================================
watch(
	localType,
	() => {
		localValue.value = valueConverter(localValue.value, localType.value.value);
		emit('update:type', localType.value.value);
		emit('update:value', localValue.value);
	},
	{
		immediate: true,
	},
);

watch(localValue, () => {
	emit('update:value', localValue.value);
});

watch(localForced, () => {
	emit('update:forced', localForced.value);
});

watch(localAddIfAbsent, () => {
	emit('update:addIfAbsent', localAddIfAbsent.value);
});

watch(localKey, () => {
	emit('update:valueKey', localKey.value);
});

watch(
	() => props.value,
	() => {
		localValue.value = props.value;
	},
);

watch(
	() => props.type,
	(current) => {
		if (current !== localType.value.value) {
			localType.value = {
				label: '',
				value: current,
				icon: getTypeIcon(current),
			};
		}
	},
);

watch(
	() => props.addIfAbsent,
	(current) => {
		localAddIfAbsent.value = current;
	},
);

watch(
	() => props.forced,
	(current) => {
		localForced.value = current;
	},
);

watch(
	() => props.valueKey,
	(current) => {
		localKey.value = current;
	},
);
</script>

<style scoped></style>
