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
	<div
		:class="`tw-grid-cols-${configs ? configs?.length * 2 + 1 : 1} ${
			hasScroll ? 'tw-mr-[0.65rem]' : ''
		}`"
		class="tw-grid tw-sticky tw-px-1 tw-top-0 tw-z-10 tw-bg-darkPage tw-overflow-auto tw-max-h-full"
	>
		<div class="tw-text-sm tw-font-semibold tw-self-center tw-text-center">
			Variable names
		</div>
		<q-card
			v-for="config of configs"
			:id="config.id"
			:key="config.id"
			:draggable="configs ? configs.length > 1 : false"
			class="tw-bg-darkPage tw-content-center tw-h-full tw-text-secondary tw-text-center tw-text-sm tw-font-semibold tw-min-h-[3.5rem] tw-col-span-2"
			:class="{ 'tw-cursor-grab': configs ? configs.length > 1 : false }"
			flat
			square
			@dragend="dragStarted = false"
			@dragstart="onDragStart"
			@drop="onDrop"
		>
			<div
				v-if="dragStarted"
				:id="config.id"
				class="tw-absolute dropCover"
				@dragover="allowDrop"
			></div>
			<q-inner-loading :showing="config.loading">
				<q-spinner-clock color="secondary" size="2rem" />
			</q-inner-loading>
			<template v-if="!config.loading">
				<div class="tw-flex tw-flex-1 tw-justify-center tw-self-center">
					<slot name="header" v-bind="config">
						<div class="tw-self-center">
							<q-btn
								:disable="config.version ? config.version <= 0 : true"
								class="tw-flex-none"
								flat
								icon="sym_o_chevron_left"
								padding="sm"
								@click="
									versionChanged(
										config.id,
										config.version ? config.version - 1 : 0,
									)
								"
							/>
						</div>
						<div
							class="tw-flex-grow tw-flex tw-justify-center"
							v-if="
								config.configuration &&
								config.configuration[config.version ? config.version : 1]
							"
						>
							<div>
								<div>
									{{ config.path }}
								</div>
								<div>
									Version #{{ config.version ? config.version + 1 : 1 }},
									created
									{{
										config.configuration
											? config?.configuration[
													config?.version ? config?.version : 0
												]?.effectiveDate
											: Date.now()
									}}
									<template
										v-if="
											config.configuration
												? config.configuration[config.version as number]
														?.comment
												: false
										"
									>
										<div class="tw-mt-1 tw-text-xs tw-font-medium">
											Comment:
										</div>
										<pre class="tw-mt-1 tw-text-xs tw-font-extralight">{{
											config.configuration
												? config.configuration[config.version as number]
														?.comment
												: ''
										}}</pre>
									</template>
								</div>
								<div
									class="tw-text-center tw-text-gray-600 tw-font-light tw-text-xs"
								>
									created by
									<span
										class="tw-font-medium"
										v-if="
											config.configuration
												? config.configuration[config.version as number]
														?.createdBy?.username
												: false
										"
										>{{ getUsernameForConfig(config) }}</span
									>
								</div>
							</div>
							<q-separator class="tw-ml-4 tw-mr-1" vertical />
							<div class="tw-self-center tw-flex">
								<q-btn flat padding="0.25rem" text-color="negative">
									<q-icon
										name="sym_o_close"
										color="negative"
										size="sm"
										@click="removeConfiguration(config.id)"
									></q-icon>
								</q-btn>
							</div>
						</div>
						<div class="tw-self-center">
							<q-btn
								:disable="
									config.version !== undefined && config.configuration
										? config.version >= config.configuration.length - 1
										: true
								"
								class="tw-flex-none"
								flat
								icon="sym_o_chevron_right"
								padding="sm"
								@click="
									versionChanged(
										config.id,
										config.version ? config.version + 1 : 1,
									)
								"
							/>
						</div>
					</slot>
				</div>
			</template>
		</q-card>
	</div>
	<div
		ref="contentRef"
		:class="`tw-grid-cols-${configs ? configs.length * 2 + 1 : 1}`"
		class="tw-grid tw-max-h-full tw-px-1"
	>
		<template
			v-for="(variableName, index) of filteredVariables"
			:key="variableName"
		>
			<div class="tw-text-center tw-self-center fullWordWrap">
				{{ variableName }}
			</div>
			<q-intersection
				once
				v-for="(config, index) of configs"
				:key="config.id"
				class="tw-col-span-2 tw-min-h-[2rem] tower-compareTableIntersection"
				transition="fade"
			>
				<q-card
					class="tw-bg-darkPage tw-text-center fullWordWrap tw-justify-center tw-flex tw-h-full"
					flat
					square
				>
					<q-inner-loading
						:showing="
							config.loading || (dragStarted && draggedId === `${config.id}`)
						"
					>
						<span></span>
					</q-inner-loading>
					<template
						v-if="
							config &&
							!config.loading &&
							!(dragStarted && draggedId === `${config.id}`)
						"
					>
						<template
							v-if="
								config.configuration &&
								getVariableFromConfiguration(
									variableName,
									config.configuration[config.version ?? 0]?.variables ?? [],
								) === undefined
							"
						>
							<div class="tw-italic tw-text-gray-500 tw-self-center">
								Variable doesn't exist in this version
							</div>
						</template>
						<template v-else-if="index > 0">
							<template v-if="showDiff">
								<template
									v-for="diff of diffStrings(
										valueAsString(
											getVariableFromConfiguration(
												variableName,
												config?.configuration?.[config.version ?? 0]
													?.variables ?? [],
											),
										),
										valueAsString(
											getVariableFromConfiguration(
												variableName,
												configs?.[0]?.configuration?.[configs[0]?.version ?? 0]
													?.variables ?? [],
											),
										),
									)"
									:key="Math.random()"
								>
									<div class="tw-self-center">
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
									</div>
								</template>
							</template>
							<template v-else>
								<div class="tw-text-start">
									{{
										getVariableFromConfiguration(
											variableName,
											config?.configuration?.[config.version ?? 0]?.variables ??
												[],
										)
									}}
								</div>
							</template>
						</template>
						<template
							v-else-if="!(dragStarted && draggedId === `${config.id}`)"
						>
							<div class="tw-self-center">
								{{
									getVariableFromConfiguration(
										variableName,
										config.configuration
											? (config.configuration[config.version ?? 0]?.variables ??
													[])
											: [],
									)
								}}
							</div>
						</template>
					</template>
				</q-card>
			</q-intersection>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { ArchiveConfig } from 'components/basic/basics';
import { ConfigurationVariable } from 'components/configuration/configuration';
import {
	ConfigurationVariableType,
	valueAsString,
	valueConverter,
} from 'components/constantVariables/constantVariable';
import { diffChars } from 'diff';
import { computed, ref } from 'vue';

//====================================================
// Interface
//====================================================
interface CompareTable {
	variables?: Array<string>;
	configs?: Array<ArchiveConfig>;
	showDiff?: boolean;
	filter?: string;
}

//====================================================
// Props
//====================================================
const props = defineProps<CompareTable>();

//====================================================
// Data
//====================================================
const draggedId = ref('-1');
const dragStarted = ref(false);
const contentRef = ref(null);

//====================================================
// Emits
//====================================================
const emit = defineEmits([
	'removeConfiguration',
	'versionChanged',
	'switchPlaces',
]);

//====================================================
// Computed
//====================================================
/**
 * A computed variable that filters a list of variables based on a given filter string and optional configuration.
 *
 * The filter is applied case-insensitively. If no filter is provided, the original list of variables is returned.
 * The filtering also supports checking against configuration-specific variables when a configuration is present.
 *
 * Dependency: This computed property depends on `props.filter`, `props.variables`, and optionally `props.configs` and their nested structures.
 *
 * @type {ComputedRef<Array<string>>} - A reactive reference that contains the filtered list of variables.
 */
const filteredVariables = computed(() => {
	if (!props.filter) {
		return props.variables;
	}

	const lowerFilter = props.filter.toLowerCase();

	return props.variables?.filter((el) => {
		if (props.configs) {
			if (el.toLowerCase().includes(lowerFilter)) {
				return true;
			}

			let exists = false;
			for (let config of props.configs) {
				if (
					config?.configuration &&
					config?.configuration[config.version ?? 0]?.variables
				) {
					const variable = getVariableFromConfiguration(
						el,
						config?.configuration[config.version ?? 0]?.variables ?? [],
					);

					const stringVariable = valueConverter(
						variable,
						ConfigurationVariableType.STRING,
					) as string;
					if (stringVariable.toLowerCase().includes(lowerFilter)) {
						exists = true;
						break;
					}
				}
			}

			return exists;
		}
	});
});

/**
 * A computed property that determines if the referenced content element has a vertical scroll.
 *
 * The computation checks:
 * - If the `contentRef` is defined and references a valid HTMLDivElement.
 * - If the `configs` property in `props` exists and has elements.
 * - It then evaluates whether the content's scroll height exceeds its client height,
 *   indicating the presence of vertical scrolling.
 *
 * Returns `true` if the content element has a vertical scroll, otherwise `false`.
 */
const hasScroll = computed(() => {
	if (contentRef.value && props.configs && props.configs.length > 0) {
		const div = contentRef.value as HTMLDivElement;
		return div.scrollHeight > div.clientHeight;
	}

	return false;
});

//====================================================
// Methods
//====================================================
/**
 * Retrieves the value of a specific variable from a given configuration.
 *
 * This function searches through an array of configuration variables to find a
 * variable that matches the provided name. If found, it converts and returns
 * the value of the variable into a string format using a value converter. If
 * the variable is not found, it returns undefined.
 *
 * @param {string} variableName - The name of the variable to retrieve from the configuration.
 * @param {Array<ConfigurationVariable>} variables - An array of configuration variables to search within.
 * @returns {string | undefined} The value of the matching variable as a string if found, or undefined if not found.
 */
const getVariableFromConfiguration = (
	variableName: string,
	variables: Array<ConfigurationVariable>,
) => {
	const variable = variables.find((el) => {
		return el.name === variableName;
	});

	if (variable) {
		return valueConverter(variable.value, ConfigurationVariableType.STRING);
	}

	return undefined;
};

/**
 * Retrieves the username associated with a given configuration.
 *
 * This function extracts the username from the `createdBy` field of the
 * supplied configuration object. If the `createdBy` field exists and
 * the type is 'ldap', it returns the `display` property; otherwise,
 * it returns the `username` property.
 *
 * If the configuration or `createdBy` field is not found, an empty
 * string is returned.
 *
 * @param {ArchiveConfig} config - The configuration object containing
 *                                 the necessary details to retrieve the
 *                                 username.
 * @returns {string} The extracted username or an empty string if not available.
 */
const getUsernameForConfig = (config: ArchiveConfig) => {
	if (config.configuration) {
		const createdBy = config?.configuration[config.version ?? 0]?.createdBy;
		if (createdBy) {
			return createdBy.type === 'ldap' ? createdBy.display : createdBy.username;
		}
	}

	return '';
};

/**
 * Removes a specified configuration by emitting an event.
 *
 * @param {string} configId - The unique identifier of the configuration to be removed.
 * @fires removeConfiguration - Signals the removal of a configuration.
 */
const removeConfiguration = (configId: string) => {
	emit('removeConfiguration', configId);
};

/**
 * Computes the character-level differences between two strings.
 *
 * This function compares two strings, `current` and `archive`, and
 * identifies the differences at the character level. It leverages the
 * `diffChars` method to calculate these differences.
 *
 * @param {string} current - The current version of the string.
 * @param {string} archive - The archived or older version of the string.
 * @returns {Array} An array representing the differences between the two strings.
 * Each difference object may contain properties such as `added`, `removed`, and `value`.
 */
const diffStrings = (current: string, archive: string) => {
	return diffChars(archive, current);
};

/**
 * Emits a 'versionChanged' event with the provided configuration ID and version.
 *
 * @param {string} configId - The unique identifier for the configuration whose version has changed.
 * @param {number} version - The updated version number of the configuration.
 */
const versionChanged = (configId: string, version: number) => {
	emit('versionChanged', {
		configId,
		version,
	});
};

/**
 * A callback function triggered when a drag operation starts.
 *
 * @param {DragEvent} data - The drag event containing information about the drag operation.
 */
const onDragStart = (data: DragEvent) => {
	dragStarted.value = true;
	draggedId.value = (data.target as any).id;
};

/**
 * Handles the drop event triggered during a drag-and-drop operation.
 *
 * This function is invoked when a draggable item is dropped onto a valid target.
 * It prevents the default behavior of the drop event, resets the drag state,
 * and emits an event to switch positions of the dragged and target elements.
 *
 * @param {DragEvent} data - The drag event containing information about the drop action.
 */
const onDrop = (data: DragEvent) => {
	dragStarted.value = false;
	data.preventDefault();

	emit('switchPlaces', {
		sourceId: draggedId.value,
		targetId: (data.target as any).id,
	});
};

/**
 * Determines whether a drop action is allowed during a drag-and-drop operation.
 * Prevents the default behavior if the target element's ID exists and is not
 * equal to the dragged element's ID.
 *
 * @param {DragEvent} data - The drag event object containing information about the drag-and-drop operation.
 */
const allowDrop = (data: DragEvent) => {
	if ((data.target as any).id && (data.target as any).id !== draggedId.value) {
		data.preventDefault();
	}
};
</script>

<style scoped>
.dropCover {
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 2;
}
</style>
