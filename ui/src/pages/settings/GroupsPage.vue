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
	<div class="tw-flex tw-flex-col tw-h-full">
		<q-dialog v-model="deleteGroupDialog">
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Delete {{ currentGroup?.name }}</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove <b>{{ currentGroup?.name }}</b> group?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="deleteGroup"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div class="tw-h-full tw-flex tw-flex-col tw-items-center tw-overflow-auto">
			<tower-select
				label="Group name"
				class="tw-w-[33.3%]"
				option-label="name"
				:options="allGroups"
				v-model="currentGroup"
				v-model:filter="inputValue"
			>
				<template #before>
					<q-icon name="sym_o_group" size="sm" />
				</template>
				<template #after>
					<q-btn
						v-if="inputValue || currentGroup"
						flat
						padding="sm"
						:disable="!!currentGroup && !currentGroup._id"
						@click="addOrDeleteGroup"
					>
						<q-icon :name="currentGroup?._id ? 'sym_o_delete' : 'sym_o_add'" />
					</q-btn>
				</template>
			</tower-select>
		</div>
		<div class="tw-mt-6 tower-min-height" v-if="currentGroup">
			<search-toolbar
				class="tw-mb-3"
				:export-enabled="false"
				:showDiffEnabled="false"
				v-model:filter="filter"
				title=""
			/>
			<q-virtual-scroll
				:items="filteredRoles"
				v-slot="{ item }"
				style="max-height: calc(100vh - 22rem)"
			>
				<q-item clickable @click="addOrRemoveRole(item.name)">
					<q-item-section avatar>
						<q-icon
							:name="
								currentRoles.includes(item.name)
									? 'sym_o_check'
									: 'sym_o_check_box_outline_blank'
							"
							:color="currentRoles.includes(item.name) ? 'positive' : 'grey-7'"
							class="heavy"
							size="sm"
						/>
					</q-item-section>
					<q-item-section>
						<q-item-label>{{ item.name }}</q-item-label>
					</q-item-section>
				</q-item>
			</q-virtual-scroll>
		</div>
		<div v-if="currentGroup" class="tw-justify-self-end">
			<save-panel
				:save-enabled="isDifferent"
				@save-clicked="saveChanges"
				:loading="loading"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Group } from 'pages/settings/types/group';
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { towerAxios } from 'boot/axios';
import TowerSelect from 'components/basic/towerSelect.vue';
import { Role } from 'pages/settings/types/Role';
import SavePanel from 'components/basic/savePanel.vue';
import { useQuasar } from 'quasar';
import { navigationStore } from 'stores/navigation';
import SearchToolbar from 'components/configuration/searchToolbar.vue';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const allGroups: Ref<Array<Group>> = ref([]);
const currentGroup: Ref<Group | null> = ref(null);

const allRoles: Ref<Array<Role>> = ref([]);

const currentRoles: Ref<Array<string>> = ref([]);

const loading = ref(false);

const inputValue = ref('');

const deleteGroupDialog = ref(false);

const filter = ref('');

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getAllGroups();
});

//====================================================
// Methods
//====================================================
/**
 * getAllGroups
 */
const getAllGroups = async () => {
	const filter = {
		order: 'name ASC',
	};

	let response = await towerAxios.get(
		`groups?filter=${JSON.stringify(filter, undefined, '')}`,
	);

	if (response.status === 200) {
		allGroups.value = response.data;
	}

	response = await towerAxios.get(
		`Roles?filter=${JSON.stringify(filter, undefined, '')}`,
	);

	if (response.status === 200) {
		allRoles.value = response.data;
	}
};

/**
 * addRole
 */
const addRole = (role: string) => {
	currentRoles.value.push(role);
	currentRoles.value = currentRoles.value.sort();
};

/**
 * removeRole
 */
const removeRole = (role: string) => {
	currentRoles.value = currentRoles.value.filter((el) => {
		return el !== role;
	});
};

/**
 * addOrRemoveRole
 */
const addOrRemoveRole = (role: string) => {
	if (currentRoles.value.includes(role)) {
		removeRole(role);
	} else {
		addRole(role);
	}
};

/**
 * saveChanges
 */
const saveChanges = async () => {
	loading.value = true;

	if (currentRoles.value && currentGroup.value && currentGroup.value._id) {
		for (let role of currentRoles.value) {
			const found = currentGroup.value?.roles.some((el) => {
				return el === role;
			});

			if (!found) {
				await towerAxios.post(
					`/groups/${currentGroup.value._id}/role?role=${role}`,
				);
			}
		}

		for (let role of currentGroup.value.roles) {
			const found = currentRoles.value.some((el) => {
				return el === role;
			});

			if (!found) {
				await towerAxios.delete(
					`/groups/${currentGroup.value._id}/role?role=${role}`,
				);
			}
		}

		currentGroup.value.roles = [...currentRoles.value];
	} else if (currentGroup.value && !currentGroup.value._id) {
		// New group
		const response = await towerAxios.post('/groups', {
			name: currentGroup.value.name,
			roles: currentRoles.value,
		});
		if (response.status === 201) {
			currentGroup.value = response.data;
			if (!!currentGroup.value) {
				currentGroup.value.roles = [...currentRoles.value];
			}
		}

		await getAllGroups();
	}

	$q.notify({
		color: 'positive',
		position: 'top',
		textColor: 'secondary',
		message: 'Group data saved successfully',
	});

	loading.value = false;
};

/**
 * addGroup
 */
const addGroup = () => {
	allGroups.value = allGroups.value.filter((el) => {
		return !!el._id;
	});

	let currGroup = {
		roles: [],
		name: inputValue.value,
	};
	allGroups.value.push(currGroup);
	currentGroup.value = currGroup;
};

/**
 * deleteGroup
 */
const deleteGroup = async () => {
	if (!currentGroup.value) {
		return;
	}

	loading.value = true;

	try {
		await towerAxios.delete(`/groups/${currentGroup.value._id}`);
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error deleting group',
		});

		return;
	}

	$q.notify({
		color: 'positive',
		position: 'top',
		textColor: 'secondary',
		message: 'Group removed successfully',
	});

	currentGroup.value = null;
	await getAllGroups();

	loading.value = false;
};

/**
 * showDeleteGroupDialog
 */
const showDeleteGroupDialog = () => {
	deleteGroupDialog.value = true;
};

/**
 * addOrDeleteGroup
 */
const addOrDeleteGroup = () => {
	if (currentGroup.value && !inputValue.value) {
		showDeleteGroupDialog();
	} else if (inputValue.value) {
		addGroup();
	}
};

//====================================================
// Computed
//====================================================
/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (!currentGroup.value) {
		return false;
	}

	if (!currentGroup.value._id) {
		return true;
	}

	if (currentGroup.value.roles.length !== currentRoles.value.length) {
		return true;
	}

	return currentGroup.value.roles.some((role) => {
		return !currentRoles.value.some((el) => {
			return el === role;
		});
	});
});

/**
 * filteredRoles
 */
const filteredRoles = computed(() => {
	if (allRoles.value && allRoles.value.length > 0 && filter.value) {
		const localFilter = filter.value.toLowerCase();

		return allRoles.value.filter((el) => {
			return el.name.toLowerCase().includes(localFilter);
		});
	}

	return allRoles.value;
});

//====================================================
// Watch
//====================================================
watch(
	() => currentGroup.value,
	(current) => {
		allGroups.value = allGroups.value.filter((el) => {
			return !!el._id;
		});

		if (current) {
			currentRoles.value = [...current.roles];
		}
	},
);

watch(
	() => isDifferent.value,
	(current) => {
		if (current && !loading.value) {
			navigationSt.preventNavigation();
		} else {
			navigationSt.allowNavigation();
		}
	},
);
</script>

<style scoped>
.tower-min-height {
	min-height: calc(100vh - 16rem);
	max-height: calc(100vh - 16rem);
	overflow: auto;
}
</style>
