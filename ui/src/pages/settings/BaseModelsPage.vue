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
	<div class="tw-flex tw-flex-col tw-h-full tw-justify-between">
		<q-dialog v-model="deleteDialog" persistent>
			<q-card class="tw-w-[40rem]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Delete base model</div>
				</q-card-section>

				<q-card-section class="tw-bg-dark">
					Are you sure you want to delete <b>{{ deleteModel?.name }}</b> base
					model?<br />
					Removing it will also delete all the configuration models related to
					it.<br />
					Additionally configurations created with this base model will be
					<b class="tw-text-negative">inaccessible</b>.
				</q-card-section>

				<q-card-actions align="right" class="tw-bg-dark">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Delete"
						@click="deleteBaseModel"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="chooseIconDialog" persistent>
			<q-card class="tw-w-[60rem] tw-max-w-full">
				<q-card-section class="tw-bg-dark">
					<div class="text-h6">
						Choose icon for
						<b>{{ currentBases[chooseIconIndex]?.name }}</b> model
					</div>
				</q-card-section>

				<q-card-section class="tw-bg-darkPage">
					<q-input
						:debounce="300"
						color="secondary"
						label="filter"
						v-model="chooseIconFilter"
						dense
					/>
				</q-card-section>

				<q-card-section
					class="tw-bg-darkPage tw-gap-3 tw-grid tw-grid-cols-6 tw-h-[60vh] tw-content-start tw-overflow-auto tw-justify-items-center"
					v-if="filteredIcons.length > 0"
				>
					<div
						v-for="icon of filteredIcons"
						:key="icon"
						class="tw-grid tw-justify-items-center tw-rounded tw-px-3 tw-py-2 tw-w-[9rem] tw-cursor-pointer hover:tw-bg-gray-500"
						@click="chosenIcon = icon"
						:class="{ 'tw-bg-dark': chosenIcon === icon }"
					>
						<q-icon class="light" :name="`sym_o_${icon}`" size="3rem" />
						<div class="tw-text-center">{{ icon.replaceAll('_', ' ') }}</div>
					</div>
				</q-card-section>
				<q-card-section v-else class="tw-bg-darkPage tw-h-[60vh]">
				</q-card-section>

				<q-card-actions align="right" class="tw-bg-darkPage">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="secondary"
						flat
						label="Ok"
						@click="updateIcon"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div>
			<div class="tw-flex tw-flex-grow tw-justify-center tw-mb-3">
				<q-input
					color="secondary"
					class="tw-w-[33.3%]"
					dense
					v-model="newBaseModel"
					label="New base model"
				>
					<template #after v-if="newBaseModel">
						<q-btn flat padding="0.25rem" @click="createBaseModel">
							<q-icon name="sym_o_add" />
						</q-btn>
					</template>
				</q-input>
			</div>
			<q-card
				v-for="(base, index) of currentBases"
				:key="base.name"
				:draggable="canBeDruggedId === base._id ? 'true' : 'false'"
				class="tw-m-1"
				:class="{ 'tw-opacity-20': draggedId === base._id }"
				@dragstart="dragStart(base._id)"
				@dragend="dragEnd"
				@dragenter="dragEnter(index)"
			>
				<q-card-section
					:class="{ 'tw-opacity-0': draggedId === base._id }"
					class="tw-p-0"
				>
					<div class="tw-flex tw-justify-between tw-p-2">
						<div class="tw-flex tw-items-center">
							<q-icon
								name="sym_o_drag_indicator"
								class="tw-mr-3 tw-cursor-grab"
								@mouseover="canBeDruggedId = base._id"
								@mouseleave="canBeDruggedId = ''"
								size="sm"
							></q-icon>
							<q-icon
								:name="base.icon"
								size="sm"
								class="tw-mr-2 tw-cursor-pointer"
								@click="showChooseIconDialog(index)"
							/>
							<span>{{ base.name }}</span>
						</div>
						<div>
							<q-btn flat padding="0.25rem" @click="showDeleteDialog(base)">
								<q-icon name="sym_o_delete" size="sm"></q-icon>
							</q-btn>
						</div>
					</div>
				</q-card-section>
			</q-card>
		</div>
		<div
			v-if="currentBases.length === 0"
			class="tw-w-full tw-h-full tw-flex tw-justify-center tw-items-center"
		>
			<div class="tw-text-lg tw-tracking-wide tw-italic tw-text-gray-400">
				You have no <b>Base models</b> configured
				<div class="tw-text-center tw-text-xs tw-text-gray-500">
					Please use the input above to create one
				</div>
			</div>
		</div>
		<div>
			<save-panel
				:loading="loading"
				:save-enabled="isDifferent"
				@save-clicked="saveBases"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { basesStore } from 'stores/bases';
import * as icons from 'components/fonts/icons';
import { computed, onMounted, Ref, ref, watch } from 'vue';
import SavePanel from 'components/basic/savePanel.vue';
import { Base } from 'components/bases/base';
import { towerAxios } from 'boot/axios';
import { AxiosError } from 'axios';
import { useQuasar } from 'quasar';
import { ionWarning } from '@quasar/extras/ionicons-v6';
import { navigationStore } from 'stores/navigation';

//====================================================
// Const
//====================================================
const basesSt = basesStore();
const $q = useQuasar();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const currentBases: Ref<Array<Base>> = ref([]);

const draggedId: Ref<string | undefined> = ref('');
const canBeDruggedId: Ref<string | undefined> = ref('');

const chooseIconDialog = ref(false);
const chooseIconIndex = ref(-1);
const chooseIconFilter = ref('');
const chosenIcon = ref('');

const newBaseModel = ref('');

const loading = ref(false);

const deleteDialog = ref(false);
const deleteModel: Ref<Base | null> = ref(null);

//====================================================
// onMounted
//====================================================
onMounted(() => {
	updateCurrentBases();
});

//====================================================
// Computed
//====================================================
/**
 * filteredIcons
 */
const filteredIcons = computed(() => {
	if (!chooseIconFilter.value) {
		return icons.default;
	}
	const lowercaseFilter = chooseIconFilter.value.toLowerCase();

	return icons.default.filter((el) => {
		return el.toLowerCase().includes(lowercaseFilter);
	});
});

/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (currentBases.value.length !== basesSt.getBases.length) {
		return true;
	}

	return currentBases.value.some((base: Base, index: number) => {
		if (base._id !== basesSt.getBases[index]._id) {
			return true;
		}

		return (
			base.icon !== basesSt.getBases[index].icon ||
			base.sequenceNumber !== basesSt.getBases[index].sequenceNumber
		);
	});
});

//====================================================
// Methods
//====================================================
/**
 * dragStart
 */
const dragStart = (id?: string) => {
	setTimeout(() => {
		draggedId.value = id;
	}, 10);
};

/**
 * dragEnd
 */
const dragEnd = () => {
	draggedId.value = '';
};

/**
 * dragEnter
 */
const dragEnter = (index: number) => {
	if (currentBases.value[index]._id !== draggedId.value) {
		const draggedIndex = currentBases.value.findIndex((el) => {
			return el._id === draggedId.value;
		});

		if (draggedIndex >= 0) {
			const tempValue = currentBases.value[index];
			currentBases.value[index] = currentBases.value[draggedIndex];
			currentBases.value[draggedIndex] = tempValue;
		}
	}
};

/**
 * showChooseIconDialog
 */
const showChooseIconDialog = (index: number) => {
	chooseIconFilter.value = '';
	chosenIcon.value = currentBases.value[index].icon
		? (currentBases.value[index].icon as string)
		: '';
	chooseIconIndex.value = index;
	chooseIconDialog.value = true;
};

/**
 * updateIcon
 */
const updateIcon = () => {
	if (currentBases.value[chooseIconIndex.value]) {
		currentBases.value[
			chooseIconIndex.value
		].icon = `sym_o_${chosenIcon.value}`;
	}
};

/**
 * updateCurrentBases
 */
const updateCurrentBases = () => {
	currentBases.value = [];

	basesSt.getBases.forEach((base) => {
		currentBases.value.push({
			sequenceNumber: base.sequenceNumber,
			icon: base.icon,
			_id: base._id,
			name: base.name,
		});
	});
};

/**
 * saveBases
 */
const saveBases = async () => {
	loading.value = true;

	currentBases.value.map((base: Base, index: number) => {
		base.sequenceNumber = index;

		return base;
	});

	const toDeleteArray = basesSt.getBases.filter((el) => {
		return !currentBases.value.some((base) => {
			return el._id === base._id;
		});
	});

	for (let toDelete of toDeleteArray) {
		await towerAxios.delete(`/baseConfigurations/${toDelete._id}`);
	}

	for (let base of currentBases.value) {
		try {
			if (base._id) {
				await towerAxios.patch(`/baseConfigurations/${base._id}`, base);
			} else {
				await towerAxios.post('/baseConfigurations', base);
			}
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: ionWarning,
				message: ((e as AxiosError).response?.data as any)?.error?.message
					? ((e as AxiosError).response?.data as any)?.error?.message
					: (e as AxiosError).message,
			});
		}
	}

	await basesSt.requestBases(towerAxios);

	updateCurrentBases();

	$q.notify({
		color: 'positive',
		position: 'top',
		textColor: 'secondary',
		message: 'Base models updated successfully',
	});

	loading.value = false;
};

/**
 * createBaseModel
 */
const createBaseModel = () => {
	if (newBaseModel.value) {
		currentBases.value.push({
			sequenceNumber: currentBases.value.length,
			name: newBaseModel.value,
			icon: `sym_o_${
				icons.default[Math.floor(Math.random() * icons.default.length)]
			}`,
		});

		newBaseModel.value = '';
	}
};

/**
 * showDeleteDialog
 */
const showDeleteDialog = (base: Base) => {
	deleteDialog.value = true;
	deleteModel.value = base;
};

/**
 * deleteBaseModel
 */
const deleteBaseModel = async () => {
	if (deleteModel.value) {
		if (deleteModel.value._id) {
			currentBases.value = currentBases.value.filter((el) => {
				return el._id !== deleteModel.value?._id;
			});
		} else {
			currentBases.value = currentBases.value.filter((el) => {
				return !!el._id;
			});
		}
	}
};

//====================================================
// Watch
//====================================================
watch(
	() => isDifferent.value,
	(current) => {
		if (current && !loading.value) {
			navigationSt.preventNavigation();
		} else {
			navigationSt.allowNavigation();
		}
	}
);
</script>

<style scoped></style>
