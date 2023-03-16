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
				configurationRowModified: wasModified,
				configurationRowError: !!error,
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
				<div>
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
								<div v-if="valueExists(currentArchive) && !deleted">
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
													valueAsString(localValue),
													valueAsString(currentArchive.value)
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
											>{{ valueAsString(currentArchive.value) }}
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
						</div>
						<div v-if="!forced" class="tw-flex tw-self-center">
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
				<type-select
					v-model="localType"
					:disabled="forced"
					class="tw-self-center"
				/>
				<!-- value -->
				<div class="tw-flex-grow tw-mx-2">
					<!-- String -->
					<template v-if="localType.value === ConfigurationVariableType.STRING">
						<q-input
							v-model="localValue"
							:debounce="300"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hide-bottom-space="true"
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
							:debounce="300"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hide-bottom-space="true"
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
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hide-bottom-space="true"
							color="secondary"
							dense
							input-debounce="300"
							type="number"
						/>
					</template>
					<!-- Boolean -->
					<template
						v-if="localType.value === ConfigurationVariableType.BOOLEAN"
					>
						<q-btn-toggle
							v-model="localValue"
							:disable="forced"
							:options="[
								{ label: 'True', value: true },
								{ label: 'False', value: false },
							]"
							:toggle-color="!!error ? 'negative' : 'dark'"
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
					</template>
					<!-- Text -->
					<template v-if="localType.value === ConfigurationVariableType.TEXT">
						<q-input
							v-model="localValue"
							:disable="forced"
							:error="!!error"
							:error-message="error"
							:hide-bottom-space="true"
							color="secondary"
							dense
							type="textarea"
						/>
					</template>
					<!-- List -->
					<template v-if="localType.value === ConfigurationVariableType.LIST">
						<q-select
							v-model="localValue"
							:disable="forced"
							:error="!!error"
							:error-message="error"
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
					<template v-if="localType.value === ConfigurationVariableType.VAULT">
						<q-input
							v-model="localValue"
							:disable="forced"
							:error="!!error"
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
					icon="sym_o_delete"
					padding="sm"
					@click="deleteDialog = true"
				/>
			</div>
			<div
				v-else
				class="tw-text-center tw-self-center tw-italic tw-text-gray-500"
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
	value?: string | number | Array<string> | boolean | null | undefined;
	deleted?: boolean;
	isConstantVariable?: boolean;
	forced?: boolean;
	allowDelete?: boolean;
	error?: string;
	disable?: boolean;
	showDiff?: boolean;
	currentArchive?: {
		type: ConfigurationVariableType;
		value: string | number | Array<string> | boolean | null | undefined;
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
		});

		return;
	}

	if (
		props.currentArchive?.type &&
		localType.value !== props.currentArchive?.type
	) {
		const value = typeOptions.find((el: typeInterface) => {
			return el.value === props.currentArchive?.type;
		});
		if (value !== undefined) {
			localType.value = value;
		}
	}

	if (
		props.currentArchive?.value !== undefined &&
		localValue.value !== props.currentArchive?.value
	) {
		localValue.value = props.currentArchive?.value;
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

let localChanges = true;
const localType: Ref<typeInterface | string> = ref('');

localChanges = true;
if (typeof props.type === 'string') {
	localType.value = {
		label: '',
		value: props.type,
		icon: getTypeIcon(props.type),
	};
} else {
	localType.value = ref(props.type);
}
localChanges = true;
const localValue = ref(props.value);

const deleteDialog = ref(false);

const passwordVisible = ref(false);

//====================================================
// Computed
//====================================================
/**
 * currentArchiveTypeIcon
 */
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
		const localTypeValue =
			typeof localType.value === 'string'
				? localType.value
				: localType.value.value;

		const archive = props.currentArchive;
		return (
			archive.type !== localTypeValue ||
			valueAsString(archive.value) !== valueAsString(localValue.value)
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

	if (!props.currentArchive && !props.isConstantVariable) {
		return true;
	} else if (props.currentArchive) {
		const localTypeValue =
			typeof localType.value === 'string'
				? localType.value
				: localType.value.value;

		const archive = props.currentArchive;
		return (
			archive.type !== localTypeValue ||
			valueConverter(archive.value, ConfigurationVariableType.STRING) !==
				valueConverter(localValue.value, ConfigurationVariableType.STRING)
		);
	}

	return false;
});

const localTypeComputed = computed(() => {
	return typeof localType.value === 'string'
		? localType.value
		: localType.value.value;
});

//====================================================
// Emit
//====================================================
const emit = defineEmits([
	'removeVariable',
	'update:value',
	'update:type',
	'addVariable',
]);

//====================================================
// Watch
//====================================================
watch(
	localType,
	() => {
		const localTypeValue =
			typeof localType.value === 'string'
				? localType.value
				: localType.value.value;

		localValue.value = valueConverter(
			localValue.value,
			localTypeValue as ConfigurationVariableType
		);
		emit('update:type', localTypeValue);
		emit('update:value', localValue.value);

		if (props.isConstantVariable && !props.forced && !localChanges) {
			emit('addVariable', {
				name: localName.value,
				type: localTypeValue,
				value: localValue.value,
			});
		}

		localChanges = false;
	},
	{
		immediate: true,
	}
);

watch(localValue, () => {
	emit('update:value', localValue.value);
	if (props.isConstantVariable && !props.forced && !localChanges) {
		const localTypeValue =
			typeof localType.value === 'string'
				? localType.value
				: localType.value.value;

		emit('addVariable', {
			name: localName.value,
			type: localTypeValue,
			value: localValue.value,
		});
	}

	localChanges = false;
});

watch(
	() => props.value,
	(current) => {
		if (current !== localValue.value) {
			localChanges = true;
			localValue.value = current;
		}
	}
);

watch(
	() => props.type,
	(current) => {
		if (current !== localType.value) {
			localChanges = true;
			localType.value = {
				label: '',
				value: current,
				icon: getTypeIcon(current),
			};
		}
	}
);
</script>

<style lang="scss"></style>
