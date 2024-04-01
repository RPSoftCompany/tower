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
		:class="`tw-grid-cols-${configs?.length * 2 + 1} ${
			hasScroll ? 'tw-mr-[0.65rem]' : ''
		}`"
		class="tw-grid"
	>
		<div class="tw-text-sm tw-font-semibold tw-self-center tw-text-center">
			Variable names
		</div>
		<q-card
			v-for="config of configs"
			:id="config.id"
			:key="config.id"
			:draggable="configs.length > 1"
			class="tw-bg-darkPage tw-text-secondary tw-self-center tw-text-center tw-text-sm tw-font-semibold tw-min-h-[3.5rem] tw-col-span-2"
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
				<div class="tw-flex tw-justify-center tw-self-center">
					<slot name="header" v-bind="config">
						<div class="tw-self-center">
							<q-btn
								:disable="config.version <= 0"
								class="tw-flex-none"
								flat
								icon="sym_o_chevron_left"
								padding="sm"
								@click="versionChanged(config.id, config.version - 1)"
							/>
						</div>
						<div class="tw-flex-grow tw-flex tw-justify-center">
							<div>
								<div>
									{{ config.path }}
								</div>
								<div>
									Version #{{ config.version + 1 }}, created
									{{ config.configuration[config.version].effectiveDate }}
								</div>
								<div
									class="tw-text-center tw-text-gray-600 tw-font-light tw-text-xs"
								>
									created by
									<span
										class="tw-font-medium"
										v-if="
											config.configuration[config.version]?.createdBy?.username
										"
										>{{
											config.configuration[config.version]?.createdBy?.username
										}}</span
									>
								</div>
							</div>
							<div class="tw-self-center tw-flex tw-ml-3">
								<q-separator inset size="md" vertical />
								<q-btn flat padding="0.25rem">
									<q-icon
										name="sym_o_close"
										size="sm"
										@click="removeConfiguration(config.id)"
									></q-icon>
								</q-btn>
							</div>
						</div>
						<div class="tw-self-center">
							<q-btn
								:disable="config.version >= config.configuration.length - 1"
								class="tw-flex-none"
								flat
								icon="sym_o_chevron_right"
								padding="sm"
								@click="versionChanged(config.id, config.version + 1)"
							/>
						</div>
					</slot>
				</div>
			</template>
		</q-card>
	</div>
	<div
		ref="contentRef"
		:class="`tw-grid-cols-${configs.length * 2 + 1}`"
		class="tw-grid tower-max-height"
	>
		<template v-for="variableName of filteredVariables" :key="variableName">
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
							!config.loading && !(dragStarted && draggedId === `${config.id}`)
						"
					>
						<template
							v-if="
								getVariableFromConfiguration(
									variableName,
									config.configuration[config.version].variables,
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
									v-for="(diff, index) of diffStrings(
										valueAsString(
											getVariableFromConfiguration(
												variableName,
												config.configuration[config.version].variables,
											),
										),
										valueAsString(
											getVariableFromConfiguration(
												variableName,
												configs[0].configuration[configs[0].version].variables,
											),
										),
									)"
									:key="`${diff.value}_${index}`"
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
								<div class="tw-self-center">
									{{
										getVariableFromConfiguration(
											variableName,
											config.configuration[config.version].variables,
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
										config.configuration[config.version].variables,
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
					config.configuration &&
					config.configuration[config.version as number].variables
				) {
					const variable = getVariableFromConfiguration(
						el,
						config.configuration[config.version as number].variables,
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
 * hasScroll
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
 * getVariableFromConfiguration
 * @param variableName
 * @param variables
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
 * removeConfiguration
 */
const removeConfiguration = (configId: number) => {
	emit('removeConfiguration', configId);
};

/**
 * diffStrings
 * @param current
 * @param archive
 */
const diffStrings = (current: string, archive: string) => {
	return diffChars(archive, current);
};

/**
 * versionChanged
 * @param configId
 * @param version
 */
const versionChanged = (configId: number, version: number) => {
	emit('versionChanged', {
		configId,
		version,
	});
};

/**
 *
 * @param data
 */
const onDragStart = (data: DragEvent) => {
	dragStarted.value = true;
	draggedId.value = (data.target as any).id;
};

/**
 *
 * @param data
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
 *
 * @param data
 */
const allowDrop = (data: DragEvent) => {
	if ((data.target as any).id && (data.target as any).id !== draggedId.value) {
		data.preventDefault();
	}
};
</script>

<style scoped>
.tower-max-height {
	overflow: auto;
	max-height: calc(100vh - 14rem);
}

.dropCover {
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 2;
}
</style>
