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
		<div class="tw-flex tw-justify-center tw-text-secondary tw-py-3">
			<div class="tw-flex tw-w-[33.3%]">
				<q-select
					v-model="targetType"
					:options="Object.values(['name', 'value'])"
					borderless
					class="tw-mr-1"
					color="secondary"
					dense
					options-dense
					:disable="loading"
					popup-content-class="shadow-black"
				>
					<template v-slot:selected>
						<q-icon
							:name="targetType === 'name' ? 'sym_o_badge' : 'sym_o_variables'"
							size="sm"
						/>
					</template>
					<template v-slot:option="{ itemProps, opt }">
						<q-item class="tw-text-secondary" v-bind="itemProps">
							<q-item-section class="tw-flex">
								<q-icon
									:name="
										opt === NameValue.NAME ? 'sym_o_badge' : 'sym_o_variables'
									"
									size="sm"
								/>
							</q-item-section>
							<q-item-section>
								<q-item-label class="tw-min-w-[5rem]">{{ opt }}</q-item-label>
							</q-item-section>
						</q-item>
					</template>
				</q-select>
				<q-input
					v-model="searchValue"
					:label="`Find all variables with ${
						targetType === 'name' ? 'name' : 'value'
					}${isRegex ? ' using regular expression' : ''}`"
					class="tw-flex-grow"
					dense
					:loading="loading"
					:disable="loading"
					color="secondary"
					@keyup.enter="search"
				>
					<template #append>
						<q-icon
							v-if="!isRegex"
							class="tw-cursor-pointer"
							name="sym_o_text_fields"
							@click="isRegex = !isRegex"
						>
							<q-tooltip>Switch to regular expression</q-tooltip>
						</q-icon>
						<q-icon
							v-else
							class="tw-cursor-pointer"
							name="sym_o_function"
							@click="isRegex = !isRegex"
						>
							<q-tooltip>Switch to text</q-tooltip>
						</q-icon>
					</template>
				</q-input>
				<q-btn flat dense class="tw-ml-3" :disable="loading" @click="search">
					<q-icon name="sym_o_search" />
					<div class="tw-ml-1.5">Search</div>
				</q-btn>
			</div>
		</div>
		<q-splitter
			v-if="treeNodes.length > 0 && !loading"
			v-model="splitterModel"
			class="tw-flex tower-max-height tw-mt-3"
		>
			<template v-slot:before>
				<q-tree
					ref="treeRef"
					:nodes="treeNodes"
					node-key="id"
					selected-color="accent"
					v-model:selected="selectedTreeNode"
				>
					<template #default-header="{ node }">
						<q-icon v-if="node.icon" :name="node.icon" size="sm" />
						<div class="tw-ml-2" :class="{ 'tw-font-semibold': !!node.value }">
							{{ node.name }}
						</div>
					</template>
				</q-tree>
			</template>
			<template
				v-slot:after
				v-if="
					treeRef &&
					selectedTreeNode &&
					treeRef?.getNodeByKey(selectedTreeNode)?.value
				"
			>
				<div
					class="tw-grid tw-grid-cols-2 tw-px-2 tw-gap-3 tw-justify-items-stretch tw-place-items-center tw-text-sm tw-font-semibold tw-min-h-[2.5rem]"
				>
					<div class="tw-text-center">Name</div>
					<div class="tw-text-center">Value</div>
				</div>
				<q-intersection
					v-for="(value, index) of treeRef?.getNodeByKey(selectedTreeNode)
						?.value"
					:key="`${value.name}_${value.value}_${index}`"
					class="tw-min-h-[2rem]"
					ssr-prerender
				>
					<div
						class="tw-grid tw-grid-cols-2 tw-gap-3 tw-ml-3 tw-justify-items-stretch tw-place-items-center"
					>
						<div class="fullWordWrap">
							<q-icon
								v-if="value.global"
								class="tw-pr-2 filled tw-self-center"
								name="sym_o_bookmark"
								size="sm"
							>
								<q-tooltip :delay="300">Constant variable</q-tooltip>
							</q-icon>
							{{ value.name }}
						</div>
						<div
							class="tw-min-h-[2rem] tw-flex tw-items-center tw-gap-3 tw-text-center"
						>
							<q-icon :name="currentTypeIcon(value.type)" size="sm">
								<q-tooltip>{{ currentTypeText(value.type) }}</q-tooltip>
							</q-icon>
							<div class="fullWordWrap tw-flex-grow">
								{{ value.value }}
							</div>
						</div>
					</div>
				</q-intersection>
			</template>
		</q-splitter>
		<div
			v-else-if="!loading && !emptyOutput"
			class="tw-w-full tw-flex tw-justify-center tw-items-center tower-max-height"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				Use input at the top of the page to find the variable you need
				<div class="tw-text-center tw-text-xs tw-text-gray-500">
					Don't forget to hit the Enter key or click the Search button after you
					set your criteria
				</div>
			</div>
		</div>
		<div
			v-else-if="!loading && emptyOutput"
			class="tw-w-full tw-flex tw-justify-center tw-items-center tower-max-height"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				It looks like there aren't any variable that fulfill your criteria
				<div class="tw-text-center tw-text-xs tw-text-gray-500">
					Please make sure your criteria are correct
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { towerAxios } from 'boot/axios';
import { ConfigurationVariable } from 'components/configuration/configuration';
import { QTree, QTreeNode } from 'quasar';
import { basesStore } from 'stores/bases';
import { v4 as uuidv4 } from 'uuid';
import { typeOptions } from 'components/constantVariables/constantVariable';
import { Base } from 'components/bases/base';

//====================================================
// Interfaces
//====================================================
enum NameValue {
	NAME = 'name',
	VALUE = 'value',
}

interface ConfigurationFindItem {
	_id: string;
	variables: Array<ConfigurationVariable>;

	[x: string]: unknown;
}

//====================================================
// Const
//====================================================
const baseSt = basesStore();

//====================================================
// Data
//====================================================
const targetType: Ref<NameValue> = ref(NameValue.NAME);
const searchValue = ref('');
const isRegex = ref(false);
const loading = ref(false);
const emptyOutput = ref(false);

const treeNodes: Ref<Array<QTreeNode>> = ref([]);
const selectedTreeNode: Ref<QTreeNode | null> = ref(null);
const treeRef: Ref<QTree | null> = ref(null);

const splitterModel = ref(50);

//====================================================
// Methods
//====================================================
/**
 * search
 */
const search = async () => {
	loading.value = true;

	treeNodes.value = [];

	const params = `searchText=${searchValue.value}&valueOrName=${
		targetType.value === NameValue.VALUE
	}&isRegex=${isRegex.value}`;

	const response = await towerAxios.get(
		`/configurations/findVariable?${params}`
	);
	if (response.status === 200) {
		if (
			response.data.variables.length === 0 &&
			response.data.constantVariables.length === 0
		) {
			emptyOutput.value = true;
		} else {
			emptyOutput.value = false;
			createResponseTree(response.data.variables);
			createResponseTreeForGlobals(response.data.constantVariables);

			sortTree(treeNodes.value);
		}
	}

	loading.value = false;
};

/**
 * createResponseTree
 */
const createResponseTree = (configs: Array<ConfigurationFindItem>) => {
	for (const config of configs) {
		let parent = treeNodes.value;
		let parentIndex = -1;
		for (let i = 0; i < baseSt.getBases.length; i++) {
			const base = baseSt.getBases[i];
			const name = config[base.name]
				? (config[base.name] as string)
				: '__NONE__';
			const parentIndexTemp = parent.findIndex((el) => {
				return el.name === name;
			});

			if (parentIndexTemp === -1) {
				parent.push({
					id: uuidv4(),
					name: name,
					label: name === '__NONE__' ? 'EMPTY' : name,
					icon: base.icon,
					selectable: false,
				});

				parentIndex = parent.length - 1;
			} else {
				parentIndex = parentIndexTemp;
			}

			if (i + 1 < baseSt.getBases.length) {
				if (!parent[parentIndex].children) {
					parent[parentIndex].children = [] as Array<QTreeNode>;
				}
				parent = parent[parentIndex].children as QTreeNode<unknown>[];
			}
		}

		if (parent[parentIndex]) {
			parent[parentIndex].value = config.variables;
			parent[parentIndex].selectable = true;
		}
	}
};

/**
 * createResponseTreeForGlobals
 * @param configs
 */
const createResponseTreeForGlobals = (
	configs: Array<ConfigurationFindItem>
) => {
	for (const config of configs) {
		const allBasesInGlobal: Array<Base> = [];
		for (const base of baseSt.getBases) {
			if (config[base.name]) {
				allBasesInGlobal.push(base);
			}
		}

		let parent = treeNodes.value;
		let parentIndex = -1;

		for (let i = 0; i < allBasesInGlobal.length; i++) {
			const base = allBasesInGlobal[i];

			const parentIndexTemp = parent.findIndex((el) => {
				return el.name === config[base.name];
			});

			if (parentIndexTemp === -1) {
				parent.push({
					id: uuidv4(),
					name: config[base.name],
					label: config[base.name] as string,
					icon: base.icon,
					selectable: false,
				});

				parentIndex = parent.length - 1;
			} else {
				parentIndex = parentIndexTemp;
			}

			if (i + 1 < allBasesInGlobal.length) {
				if (!parent[parentIndex].children) {
					parent[parentIndex].children = [] as Array<QTreeNode>;
				}
				parent = parent[parentIndex].children as QTreeNode<unknown>[];
			}
		}

		if (parent[parentIndex]) {
			parent[parentIndex].value = config.variables;
			parent[parentIndex].selectable = true;
			parent[parentIndex].value.map((el: any) => {
				el.global = true;
				return el;
			});
		}
	}
};

/**
 * sortTree
 */
const sortTree = (tree: Array<QTreeNode>) => {
	if (tree.length > 0) {
		for (let item of tree) {
			if (item.children) {
				item.children = sortTree(item.children);
			}
		}

		return tree.sort((a: QTreeNode, b: QTreeNode) => {
			if (a.label && b.label) {
				return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
			}

			return 1;
		});
	}

	return [];
};

/**
 * curentTypeIcon
 * @param currentType
 */
const currentTypeIcon = (currentType: string) => {
	if (currentType) {
		const found = typeOptions.find((el) => {
			return el.value === currentType;
		});

		if (found) {
			return found.icon;
		}
	}

	return undefined;
};

/**
 * currentTypeText
 * @param currentType
 */
const currentTypeText = (currentType: string) => {
	if (currentType) {
		const found = typeOptions.find((el) => {
			return el.value === currentType;
		});

		if (found) {
			return found.label;
		}
	}

	return undefined;
};
</script>

<style scoped>
.tower-max-height {
	height: calc(100vh - 7rem);
}
</style>
