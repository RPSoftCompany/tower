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
	<div class="tw-h-full tw-flex tw-flex-col">
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
			class="tw-flex tw-h-full tw-mt-3"
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
						<div
							class="tw-ml-2"
							:class="{
								'tw-font-semibold': !!node.value,
								'tw-text-disabled': node.name === '__NONE__',
								'tw-italic': node.name === '__NONE__',
							}"
						>
							{{ node.name === '__NONE__' ? 'EMPTY' : node.name }}
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
// This component provides a page for users to search for configuration variables
// across different configurations based on variable name or value, with an option
// for regular expression matching. Results are displayed in a tree structure.

import { ref, Ref } from 'vue';
import { towerAxios } from 'boot/axios';
import { ConfigurationVariable } from 'components/configuration/configuration';
import { QTree, QTreeNode } from 'quasar';
import { basesStore } from 'stores/bases';
import { v4 as uuidv4 } from 'uuid';
import { typeOptions } from 'components/constantVariables/constantVariable';
import { Base } from 'components/bases/base';

//====================================================
// Interfaces & Enums
//====================================================

/**
 * Enum to define whether the search target is the variable's name or its value.
 */
enum NameValue {
	NAME = 'name',
	VALUE = 'value',
}

/**
 * Interface representing an item returned from the configuration find API.
 * It includes the item's ID, metadata (used for tree structure), and an array of found variables.
 * The `[x: string]: unknown;` allows for additional dynamic properties in `__metadata`.
 */
interface ConfigurationFindItem {
	_id: string; // The ID of the configuration item (e.g., device, interface).
	__metadata: any; // Metadata containing hierarchical information (e.g., device name, interface name).
	variables: Array<ConfigurationVariable>; // Array of variables found within this configuration item.

	[x: string]: unknown; // Allows for additional, unspecified properties, typically within __metadata.
}

//====================================================
// Const
//====================================================
/**
 * Access to the Pinia store for base configurations (e.g., device, interface types).
 */
const baseSt = basesStore();

//====================================================
// Data
//====================================================
/**
 * Reactive reference to the type of search target: 'name' or 'value'.
 * Defaults to searching by variable name.
 */
const targetType: Ref<NameValue> = ref(NameValue.NAME);
/**
 * Reactive reference to the search string input by the user.
 */
const searchValue = ref('');
/**
 * Reactive boolean indicating whether the `searchValue` should be treated as a regular expression.
 * Defaults to false (plain text search).
 */
const isRegex = ref(false);
/**
 * Reactive boolean indicating whether a search operation is currently in progress.
 * Used to disable inputs and show loading indicators.
 */
const loading = ref(false);
/**
 * Reactive boolean indicating whether the last search yielded no results.
 * Used to display an appropriate message to the user.
 */
const emptyOutput = ref(false);

/**
 * Reactive array holding the nodes for the QTree component, representing the search results.
 */
const treeNodes: Ref<Array<QTreeNode>> = ref([]);
/**
 * Reactive reference to the currently selected node in the QTree.
 * Can be a QTreeNode object or null if no node is selected.
 */
const selectedTreeNode: Ref<QTreeNode | null> = ref(null);
/**
 * Template ref for the QTree component. Allows direct interaction with the QTree instance.
 */
const treeRef: Ref<QTree | null> = ref(null);

/**
 * Reactive reference to the model for the QSplitter component, controlling the split position.
 * Defaults to 50 (50% split).
 */
const splitterModel = ref(50);

//====================================================
// Methods
//====================================================
/**
 * Performs the search for variables based on `searchValue`, `targetType`, and `isRegex`.
 * Fetches data from the backend, processes it into a tree structure, and updates UI state.
 */
const search = async () => {
	loading.value = true; // Set loading state to true.
	treeNodes.value = []; // Clear previous search results.
	emptyOutput.value = false; // Reset empty output flag.

	// Construct query parameters for the API request.
	const params = `searchText=${searchValue.value}&valueOrName=${
		targetType.value === NameValue.VALUE // API expects boolean for valueOrName
	}&isRegex=${isRegex.value}`;

	try {
		const response = await towerAxios.get(
			`/configurations/findVariable?${params}`,
		);
		if (response.status === 200) {
			// Check if both regular variables and constant variables are empty.
			if (
				response.data.variables.length === 0 &&
				response.data.constantVariables.length === 0
			) {
				emptyOutput.value = true; // Set flag if no results found.
			} else {
				emptyOutput.value = false;
				// Process and build the tree for regular configuration variables.
				createResponseTree(response.data.variables);
				// Process and build the tree for global/constant variables.
				createResponseTreeForGlobals(response.data.constantVariables);

				// Sort the entire tree alphabetically by label.
				sortTree(treeNodes.value);
			}
		} else {
			// Handle non-200 responses (e.g., display an error notification).
			console.error('Search request failed with status:', response.status);
			emptyOutput.value = true; // Assume empty output on error for simplicity.
		}
	} catch (error) {
		console.error('Error during search:', error);
		emptyOutput.value = true; // Assume empty output on error.
		// Optionally, show a user-facing error message.
	}

	loading.value = false; // Set loading state to false.
};

/**
 * Constructs the tree structure for regular configuration variables from the API response.
 * Iterates through each configuration item and its associated base hierarchy to build nested tree nodes.
 * @param {Array<ConfigurationFindItem>} configs - Array of configuration items containing variables.
 */
const createResponseTree = (configs: Array<ConfigurationFindItem>) => {
	for (const config of configs) {
		let parent = treeNodes.value; // Start at the root of the tree.
		let parentIndex = -1; // Index of the current parent node in its children array.

		// Iterate through the defined bases (e.g. 'site', 'device', 'interface') to build the hierarchy.
		for (let i = 0; i < baseSt.getBases.length; i++) {
			const base = baseSt.getBases[i];
			// Get the name for the current base level from metadata or use '__NONE__' if not present.
			const name = config.__metadata[base?.name ?? 0]
				? (config.__metadata[base?.name ?? 0] as string)
				: '__NONE__';

			// Find if a node with this name already exists at the current level.
			const parentIndexTemp = parent.findIndex((el) => {
				return el.name === name;
			});

			if (parentIndexTemp === -1) {
				// If node doesn't exist, create and add it.
				parent.push({
					id: uuidv4(), // Unique ID for the tree node.
					name: name, // Internal name, used for matching.
					label: name === '__NONE__' ? 'EMPTY' : name, // Display label.
					icon: base.icon, // Icon for this base type.
					selectable: false, // Intermediate nodes are not selectable by default.
					children: [], // Initialize children array.
				});
				parentIndex = parent.length - 1; // Update parentIndex to the new node.
			} else {
				// If node exists, use it.
				parentIndex = parentIndexTemp;
			}

			// If this is not the last level of the hierarchy, move to the children of the current node.
			if (i + 1 < baseSt.getBases.length) {
				if (!parent[parentIndex].children) {
					parent[parentIndex].children = [] as Array<QTreeNode>;
				}
				parent = parent[parentIndex].children as QTreeNode<unknown>[];
			}
		}

		// After iterating through all bases, the current `parent[parentIndex]` is the leaf node for this config item.
		// Assign the found variables to its 'value' property and make it selectable.
		if (parent[parentIndex]) {
			parent[parentIndex].value = config.variables;
			parent[parentIndex].selectable = true;
		}
	}
};

/**
 * Constructs the tree structure for global/constant variables from the API response.
 * Similar to `createResponseTree` but adapts to potentially different metadata structures for globals.
 * It also marks these variables with a 'global = true' flag.
 * @param {Array<ConfigurationFindItem>} configs - Array of items containing global/constant variables.
 */
const createResponseTreeForGlobals = (
	configs: Array<ConfigurationFindItem>,
) => {
	for (const config of configs) {
		const allBasesInGlobal: Array<Base> = [];
		// Determine the relevant base hierarchy for this global variable item.
		for (const base of baseSt.getBases) {
			if (config.__metadata[base.name]) {
				allBasesInGlobal.push(base);
			}
		}

		let parent = treeNodes.value; // Start at the root.
		let parentIndex = -1;

		// Build the tree hierarchy based on `allBasesInGlobal`.
		for (let i = 0; i < allBasesInGlobal.length; i++) {
			const base = allBasesInGlobal[i];
			const name = config.__metadata[base.name] as string; // Assume name exists as per `allBasesInGlobal` logic.

			const parentIndexTemp = parent.findIndex((el) => {
				return el.name === name;
			});

			if (parentIndexTemp === -1) {
				// Create new node if it doesn't exist.
				parent.push({
					id: uuidv4(),
					name: name,
					label: name, // Global items usually have direct names.
					icon: base.icon,
					selectable: false,
					children: [],
				});
				parentIndex = parent.length - 1;
			} else {
				parentIndex = parentIndexTemp;
			}

			// Descend into children if not the last base level.
			if (i + 1 < allBasesInGlobal.length) {
				if (!parent[parentIndex].children) {
					parent[parentIndex].children = [] as Array<QTreeNode>;
				}
				parent = parent[parentIndex].children as QTreeNode<unknown>[];
			}
		}

		// Assign variables to the leaf node, mark them as global, and make the node selectable.
		if (parent[parentIndex]) {
			parent[parentIndex].value = config.variables.map((el: any) => {
				el.global = true; // Mark each variable as global.
				return el;
			});
			parent[parentIndex].selectable = true;
		}
	}
};

/**
 * Recursively sorts the tree nodes alphabetically by their `label` property.
 * @param {Array<QTreeNode>} tree - The array of tree nodes (or a sub-tree) to sort.
 * @returns {Array<QTreeNode>} The sorted array of tree nodes.
 */
const sortTree = (tree: Array<QTreeNode>): Array<QTreeNode> => {
	if (tree && tree.length > 0) {
		// Recursively sort children of each node first.
		for (let item of tree) {
			if (item.children && item.children.length > 0) {
				item.children = sortTree(item.children as Array<QTreeNode>);
			}
		}

		// Sort the current level of nodes.
		return tree.sort((a: QTreeNode, b: QTreeNode) => {
			// Ensure labels exist before comparing.
			if (a.label && b.label) {
				return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
			}
			// Fallback if labels are missing (should ideally not happen with proper data).
			return 0; // Or handle as an error/specific case.
		});
	}
	return []; // Return empty array if input tree is empty or null.
};

/**
 * Retrieves the icon name associated with a given variable type.
 * @param {string} currentType - The type of the variable (e.g., 'string', 'integer').
 * @returns {string | undefined} The icon name if found, otherwise undefined.
 */
const currentTypeIcon = (currentType: string): string | undefined => {
	if (currentType) {
		// Find the type option that matches the currentType.
		const found = typeOptions.find((el) => {
			return el.value === currentType;
		});

		if (found) {
			return found.icon; // Return the icon string.
		}
	}
	return undefined; // Return undefined if type is not found or input is invalid.
};

/**
 * Retrieves the display text (label) associated with a given variable type.
 * @param {string} currentType - The type of the variable.
 * @returns {string | undefined} The label text if found, otherwise undefined.
 */
const currentTypeText = (currentType: string): string | undefined => {
	if (currentType) {
		// Find the type option that matches the currentType.
		const found = typeOptions.find((el) => {
			return el.value === currentType;
		});

		if (found) {
			return found.label; // Return the display label.
		}
	}
	return undefined; // Return undefined if type is not found or input is invalid.
};
</script>

<style scoped>
.tower-max-height {
	height: calc(100vh - 7rem);
}
</style>
