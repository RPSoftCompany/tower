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
			<q-card style="width: 30rem">
				<q-card-section
					class="tw-text-sm tw-font-semibold tw-bg-accent tw-text-black"
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
						class="tw-text-accent"
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
			:disable="isSelectDisabled(index) || loading"
			:label="base.name"
			:loading="bases.loading[index]"
			:options="bases.items[index]"
			class="tw-col-auto"
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

//====================================================
// Const
//====================================================
const baseSt = basesStore();
const router = useRouter();
const route = useRoute();
const navigationSt = navigationStore();

//====================================================
// Emits
//====================================================
const emit = defineEmits(['update:baseModels']);

//====================================================
// Data
//====================================================
const bases = ref({
	items: [] as Array<Array<ConfigurationModel>>,
	values: [] as Array<ConfigurationModel | string | null>,
	loading: [] as Array<boolean>
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
 * allBases
 */
const allBases = computed(() => baseSt.getBases);

/**
 * basesClasses
 */
const basesClasses = computed(() => {
	return `tw-grid-cols-${allBases.value.length}`;
});

/**
 * currentPath
 */
const currentPath = computed(() => {
	let path = '';
	bases.value.values.forEach(el => {
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
 * allowRouteChange
 */
const allowRouteChange = computed(() => {
	return navigationSt.getCanNavigate;
});

//====================================================
// Methods
//====================================================
/**
 * setBases
 * @param sequenceNumber
 */
const setBases = async (sequenceNumber: number) => {
	if (sequenceNumber >= allBases.value.length) {
		return;
	}

	loading.value = true;
	bases.value.loading[sequenceNumber] = true;

	const filter = {
		where: {
			base: allBases.value[sequenceNumber].name
		},
		order: 'name'
	};

	const response = await towerAxios.get(
		`configurationModels?filter=${JSON.stringify(filter, null, '')}`
	);

	if (response.status === 200) {
		let tempBases = [
			{
				base: allBases.value[sequenceNumber].name,
				name: '__NONE__',
				options: { hasRestrictions: false }
			},
			...response.data
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
					const forbidden = el.restrictions.some((restriction: any) => {
						return Object.keys(restriction).some((restrictionKey: string) => {
							if (restrictionKey !== '__id') {
								return (
									restriction[restrictionKey] !== currentBases[restrictionKey]
								);
							}
						});
					});

					return !forbidden;
				}
			});

			bases.value.items[sequenceNumber] = tempBases;
		}
	}

	bases.value.loading[sequenceNumber] = false;
	loading.value = false;
};

/**
 * baseChanged
 * @param value
 */
const baseChanged = async (value: ConfigurationModel) => {
	if (!allowRouteChange.value) {
		navigationPreventDialog.value = true;
		navigationPreventModel.value = { ...value };
		return;
	}

	//set current path
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

	if (value) {
		const base = allBases.value.find(el => {
			return el.name === value.base;
		});

		if (base) {
			for (let i = base.sequenceNumber + 1; i < allBases.value.length; i++) {
				bases.value.values[i] = '';
				bases.value.items[i] = [];
			}

			if (base.sequenceNumber + 1 <= allBases.value.length) {
				await setBases(base.sequenceNumber + 1);
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

	previousBases.value = [...bases.value.values];

	emit('update:baseModels', bases.value.values);
};

/**
 * isSelectDisabled
 * @param index
 */
const isSelectDisabled = (index: number) => {
	if (index === 0) {
		return false;
	} else {
		return !(bases.value.values[index - 1] as ConfigurationModel)?.name;
	}
};

/**
 * forceBasesUpdate
 * @param baseObj
 */
const forceBasesUpdate = async (baseObj: any) => {
	let lastBaseChanged = null;

	for (let i = 0; i < baseSt.getBases.length; i++) {
		const base = baseSt.getBases[i];
		if (baseObj[base.name] !== undefined) {
			const newBaseValue = bases.value.items[i].find(
				(el: ConfigurationModel) => {
					return el.name === baseObj[base.name];
				}
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
 *
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
 * leavePage
 */
const leavePage = () => {
	if (navigationPreventModel.value) {
		navigationSt.allowNavigation();
		baseChanged(navigationPreventModel.value);
	}
};

/**
 * cancelNavigation
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
