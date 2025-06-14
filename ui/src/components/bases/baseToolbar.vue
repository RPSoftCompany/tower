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
		:class="basesClasses"
		class="tw-bg-darkPage tw-text-secondary tw-gap-3 tw-grid tw-px-4 tw-pb-3 tw-pt-3 tw-rounded"
	>
		<q-dialog v-model="navigationPreventDialog" persistent>
			<q-card class="tw-w-[30rem]">
				<q-card-section
					class="tw-text-sm tw-font-semibold tw-bg-warning tw-text-black"
				>
					<div>Unsaved changes</div>
				</q-card-section>
				<q-card-section>
					There are unsaved changes, are you sure you want to leave this page?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup flat label="Cancel" @click="cancelNavigation" />
					<q-btn
						v-close-popup
						class="tw-text-warning"
						flat
						label="Leave"
						@click="leavePage"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<tower-select
			v-for="(base, index) of allBases"
			:key="base.name"
			v-model="bases.values[index]"
			:disable="isSelectDisabled(index as number) || loading"
			:label="base.name"
			:loading="bases.loading[index]"
			:options="bases.items[index]"
			clearable
			option-label="name"
			@update:modelValue="baseChanged"
		>
			<template v-slot:option="scope">
				<q-item v-bind="scope.itemProps">
					<q-item-section>
						<q-item-label
							v-if="scope.opt.name === '__NONE__'"
							class="tw-text-gray-500"
							>EMPTY
						</q-item-label>
						<q-item-label v-else>{{ scope.opt.name }}</q-item-label>
					</q-item-section>
				</q-item>
			</template>
			<template v-if="base.icon" v-slot:prepend>
				<q-icon :name="base.icon" />
			</template>
			<template #selected-item="scope">
				<template v-if="scope.opt.name === '__NONE__'"
					><span class="tw-text-gray-500">EMPTY</span></template
				>
				<template v-else>
					{{ scope.opt.name }}
				</template>
			</template>
		</tower-select>
	</div>
</template>

<script lang="ts" setup>
import { basesStore } from 'stores/bases';
import { Base } from 'components/bases/base';
import { computed, onBeforeMount, Ref, ref, watch } from 'vue';
import { towerAxios } from 'boot/axios';
import TowerSelect from 'components/basic/towerSelect.vue';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { useRoute, useRouter } from 'vue-router';
import { navigationStore } from 'stores/navigation';
import { useQuasar } from 'quasar';

//====================================================
// Const
//====================================================
const baseSt = basesStore();
const router = useRouter();
const route = useRoute();
const navigationSt = navigationStore();
const $q = useQuasar();

//====================================================
// Emits
//====================================================
const emit = defineEmits(['update:baseModels', 'update:basesCount']);

//====================================================
// Data
//====================================================
const bases = ref({
	items: [] as Array<Array<ConfigurationModel>>,
	values: [] as Array<ConfigurationModel | string | null>,
	loading: [] as Array<boolean>,
});

const loading = ref(false);

const navigationPreventDialog = ref(false);
const navigationPreventModel: Ref<ConfigurationModel | null> = ref(null);
const previousBases: Ref<Array<ConfigurationModel | string | null>> = ref([]);

//====================================================
// Mounted
//====================================================
onBeforeMount(async () => {
	await recalculateBases();
});

//====================================================
// Computed
//====================================================
/**
 * A computed property that determines the list of bases to be used based on specific conditions.
 * If the first value in the `bases.value.values` array exists and the `templateEnabled` option of its
 * corresponding `ConfigurationModel` is true, it filters the bases by checking against the `template` property
 * in the model. If the conditions are not met, it falls back to returning the default list of bases.
 *
 * @type {import('vue').ComputedRef<Array<Base>>}
 */
const allBases = computed(() => {
	if (bases.value.values[0]) {
		const baseModel = bases.value.values[0] as ConfigurationModel;
		if (baseModel.options.templateEnabled) {
			const all: Array<Base> = [];
			for (let i = 0; i < baseSt.getBases.length; i++) {
				if (baseModel.template && baseModel.template[i]) {
					all.push(baseSt.getBases[i]);
				}
			}

			return all;
		}
	}

	return baseSt.getBases;
});

/**
 * A computed property that dynamically generates a Tailwind CSS class string
 * for defining the number of grid columns based on the length of the `allBases` array.
 *
 * @constant {import('vue').ComputedRef<string>} basesClasses
 * @returns {string} A Tailwind CSS class in the format `tw-grid-cols-X`,
 * where `X` is the length of `allBases.value`.
 */
const basesClasses = computed(() => {
	return `tw-grid-cols-${allBases.value.length}`;
});

/**
 * A computed variable that generates the current hierarchical configuration path
 * as a string by concatenating the names of the configuration models contained in `bases.value.values`.
 * Each name is separated by a "/" delimiter.
 * Returns an empty string if no valid configuration models are present in the array.
 *
 * @type {ComputedRef<string>}
 */
const currentPath = computed(() => {
	let path = '';
	bases.value.values.forEach((el) => {
		if (el) {
			if (!path) {
				path = (el as ConfigurationModel).name;
			} else {
				path += `/${(el as ConfigurationModel).name}`;
			}
		}
	});

	return path;
});

/**
 * A computed property that determines whether route changes are allowed.
 *
 * This variable depends on the state of `navigationSt.getCanNavigate` and dynamically updates its value
 * based on the current state. If the associated state allows navigation, this property will evaluate to true,
 * otherwise, it will evaluate to false.
 *
 * It is typically used to control or restrict navigation actions within the application.
 */
const allowRouteChange = computed(() => {
	return navigationSt.getCanNavigate;
});

//====================================================
// Methods
//====================================================
/**
 * Asynchronously sets the base options for a given sequence number, taking into
 * account restrictions and dependencies between bases.
 *
 * This function retrieves and populates the base data for the specified sequence number
 * from a configuration API. If restrictions are present on the results, it validates
 * them against previously selected bases. The result is used to update the `bases` state
 * for the provided sequence number.
 *
 * - If the `sequenceNumber` is out of bounds of the `allBases` array, the function
 *   returns immediately.
 * - While performing the operation, it sets loading indicators to true for both
 *   the global loading state and the specific base being processed.
 * - In case of API response errors, a notification is displayed to the user.
 *
 * @param {number} sequenceNumber - The index of the base to be processed, corresponding
 *                                  to the `allBases` array.
 * @returns {Promise<void>} A promise that resolves once the base data is successfully
 *                          retrieved, processed, and updated in the state.
 */
const setBases = async (sequenceNumber: number) => {
	if (sequenceNumber >= allBases.value.length) {
		return;
	}

	loading.value = true;
	bases.value.loading[sequenceNumber] = true;

	const filter = {
		where: {
			base: allBases.value[sequenceNumber]?.name,
		},
		order: 'name ASC',
	};

	try {
		const response = await towerAxios.get(
			`configurationModels?filter=${JSON.stringify(filter, null, '')}`,
		);

		if (response.status === 200) {
			let tempBases = [
				{
					base: allBases.value[sequenceNumber]?.name,
					name: '__NONE__',
					options: { hasRestrictions: false },
				},
				...response.data,
			];
			if (sequenceNumber === 0) {
				bases.value.items[sequenceNumber] = tempBases;
			} else {
				// Gather previous bases
				const currentBases: any = {};

				for (let i = 0; i < sequenceNumber; i++) {
					const tempBase = bases.value.values[i] as ConfigurationModel;
					currentBases[tempBase.base] = tempBase.name;
				}

				// check for restrictions
				tempBases = tempBases.filter((el: ConfigurationModel) => {
					if (!el.options.hasRestrictions) {
						return true;
					} else {
						return el.restrictions.some((restriction: any) => {
							for (const key in restriction) {
								if (key !== '__id' && currentBases[key] !== restriction[key]) {
									return false;
								}
							}

							return true;
						});
					}
				});

				bases.value.items[sequenceNumber] = tempBases;
			}
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting base details',
		});
	}

	bases.value.loading[sequenceNumber] = false;
	loading.value = false;
};

/**
 * Handles changes to the base configuration model and updates the associated states and paths accordingly.
 *
 * @param {ConfigurationModel} value - The new configuration model to process.
 *
 * The function performs the following:
 * - Prevents navigation if route changes are disallowed and prompts the user if needed.
 * - Updates base-related data structures (`bases`, `baseModels`, etc.) based on the provided configuration model.
 * - Calculates and sets a new navigation path derived from the given base configuration.
 * - Emits events to notify listeners about updates to base counts and models.
 * - Ensures values and states are properly reset when no configuration model is provided.
 */
const baseChanged = async (value: ConfigurationModel) => {
	if (!allowRouteChange.value) {
		navigationPreventDialog.value = true;
		navigationPreventModel.value = { ...value };
		return;
	}

	if (value) {
		const base = allBases.value.find((el) => {
			return el.name === value.base;
		});

		if (base) {
			for (
				let i = base.sequenceNumber + 1;
				i < bases.value.values.length;
				i++
			) {
				bases.value.values[i] = '';
				bases.value.items[i] = [];
			}

			if (base.sequenceNumber + 1 <= allBases.value.length) {
				await setBases(base.sequenceNumber + 1);
			}

			if (bases.value.values[0]) {
				const baseModel = bases.value.values[0] as ConfigurationModel;
				if (baseModel.options.templateEnabled) {
					const all: Array<Base> = [];
					for (let i = 0; i < baseSt.getBases.length; i++) {
						if (baseModel.template && baseModel.template[i]) {
							all.push(baseSt.getBases[i]);
						}
					}

					emit('update:basesCount', all.length);
				} else {
					emit('update:basesCount', baseSt.getBases.length);
				}
			}
		}
	} else {
		let restEmpty = false;
		for (let i = 0; i < allBases.value.length; i++) {
			if (restEmpty) {
				bases.value.items[i] = [];
				bases.value.values[i] = '';
				bases.value.loading[i] = false;
			} else if (bases.value.values[i] === null) {
				restEmpty = true;
				bases.value.items[i] = [];
				bases.value.values[i] = '';
				bases.value.loading[i] = false;

				if (i <= allBases.value.length) {
					await setBases(i);
				}
			}
		}
	}

	//set the current path
	let path = '';
	for (let el of bases.value.values) {
		if (el && typeof el === 'object') {
			if (el.name === '__NONE__') {
				path += '/_';
			} else {
				path += `/${el.name}`;
			}
		} else {
			break;
		}
	}

	if (route.path.startsWith('/configuration')) {
		await router.push(`/configuration${path}`);
	}

	previousBases.value = [...bases.value.values];

	emit('update:baseModels', bases.value.values);
};

/**
 * Determines whether a select option should be disabled based on the provided index.
 *
 * @param {number} index - The index of the item to evaluate.
 * @returns {boolean} - Returns `true` if the select option should be disabled, otherwise `false`.
 */
const isSelectDisabled = (index: number) => {
	if (index === 0) {
		return false;
	} else {
		return !(bases.value.values[index - 1] as ConfigurationModel)?.name;
	}
};

/**
 * Asynchronously updates the base configuration based on the provided base object.
 *
 * This function iterates through a list of base configurations and compares
 * each base's name to the keys in the provided `baseObj`. If a match is found,
 * it updates the base configuration. The updates involve finding the specific
 * configuration model in `bases.value.items`, updating the corresponding value
 * in `bases.value.values`, and triggering subsequent actions like setting
 * bases and notifying about the last base change.
 *
 * @param {any} baseObj - An object containing updated base information, where
 * keys represent base names and values correspond to new configuration states.
 */
const forceBasesUpdate = async (baseObj: any) => {
	let lastBaseChanged = null;

	for (let i = 0; i < baseSt.getBases.length; i++) {
		const base = baseSt.getBases[i];
		if (baseObj[base.name] !== undefined) {
			const newBaseValue = bases.value.items[i].find(
				(el: ConfigurationModel) => {
					return el.name === baseObj[base.name];
				},
			);
			if (newBaseValue) {
				bases.value.values[i] = newBaseValue as ConfigurationModel;
				lastBaseChanged = newBaseValue;
				await setBases(i + 1);
			}
		} else {
			i = baseSt.getBases.length;
		}
	}

	if (lastBaseChanged) {
		await baseChanged(lastBaseChanged);
	}
};

/**
 * An asynchronous function that recalculates the state of bases and updates them.
 *
 * The function iterates over all existing bases, resetting their associated items, values,
 * and loading states. It then initializes the bases with a default index of 0. If a configuration
 * path exists in the route parameters, it processes the path, maps it to the corresponding base
 * names, and forces an update of the bases with the new mapping.
 *
 * This function relies on external dependencies such as the current route parameters,
 * base state data, and utility methods for setting and updating bases.
 */
const recalculateBases = async () => {
	allBases.value.forEach((_: Base, index: number) => {
		bases.value.items[index] = [];
		bases.value.values[index] = '';
		bases.value.loading[index] = false;
	});
	await setBases(0);

	if (route.params.configurationPath) {
		const newBaseModels: any = {};

		const pathArray = (route.params.configurationPath as string).split('/');
		for (let i = 0; i < baseSt.getBases.length; i++) {
			const base: string = (baseSt.getBases[i] as Base).name;
			let path = pathArray[i];
			if (path) {
				if (path === '_') {
					path = '__NONE__';
				}
				newBaseModels[base] = path;
			}
		}

		await forceBasesUpdate(newBaseModels);
	}
};

/**
 * Handles the process of leaving the current page.
 *
 * This function checks whether navigation prevention is active by evaluating
 * the `navigationPreventModel.value`. If active, it allows navigation to proceed
 * by invoking the `allowNavigation` method on `navigationSt`. After permitting
 * navigation, it calls the `baseChanged` method with the value of
 * `navigationPreventModel.value`.
 *
 * The primary purpose of this function is to manage navigation state and execute
 * the necessary logic when transitioning away from the current page.
 */
const leavePage = () => {
	if (navigationPreventModel.value) {
		navigationSt.allowNavigation();
		baseChanged(navigationPreventModel.value);
	}
};

/**
 * Cancel the current navigation and revert to the previously stored base values.
 *
 * This function restores the `bases.value.values` array to its state prior to
 * the current navigation by replacing it with the `previousBases.value` array.
 * Use this function to roll back changes made during navigation.
 *
 * Note: Ensure that `bases.value` and `previousBases.value` are properly initialized
 * and contain the appropriate data structures before calling this method.
 */
const cancelNavigation = () => {
	bases.value.values = [...previousBases.value];
};

//====================================================
// Watch
//====================================================
watch(route, async () => {
	const currPath = currentPath.value.replace(/__NONE__/, '_');
	if (currPath !== route.params.configurationPath) {
		await recalculateBases();
	}
});
</script>

<style scoped></style>
