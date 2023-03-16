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
						@click="addOrDeleteGroup"
					>
						<q-icon
							:name="currentGroup && !inputValue ? 'sym_o_delete' : 'sym_o_add'"
						/>
					</q-btn>
				</template>
			</tower-select>
		</div>
		<div class="tw-mt-6 tower-min-height" v-if="currentGroup">
			<q-list>
				<q-item
					clickable
					v-for="role of allRoles"
					:key="role.name"
					@click="addOrRemoveRole(role.name)"
				>
					<q-item-section avatar>
						<q-icon
							:name="
								currentRoles.includes(role.name)
									? 'sym_o_check'
									: 'sym_o_check_box_outline_blank'
							"
							:color="currentRoles.includes(role.name) ? 'positive' : 'grey-7'"
							class="heavy"
							size="sm"
						/>
					</q-item-section>
					<q-item-section>
						<q-item-label>{{ role.name }}</q-item-label>
					</q-item-section>
				</q-item>
			</q-list>
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

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getAllGroups();
});

//====================================================
// Mounted
//====================================================
/**
 * getAllGroups
 */
const getAllGroups = async () => {
	const filter = {
		order: 'name ASC',
	};

	let response = await towerAxios.get(
		`groups?filter=${JSON.stringify(filter, undefined, '')}`
	);

	if (response.status === 200) {
		allGroups.value = response.data;
	}

	response = await towerAxios.get(
		`Roles?filter=${JSON.stringify(filter, undefined, '')}`
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

	if (currentRoles.value && currentGroup.value && currentGroup.value.id) {
		for (let role of currentRoles.value) {
			const found = currentGroup.value?.roles.some((el) => {
				return el === role;
			});

			if (!found) {
				await towerAxios.post(
					`/groups/${currentGroup.value.id}/role?role=${role}`
				);
			}
		}

		for (let role of currentGroup.value.roles) {
			const found = currentRoles.value.some((el) => {
				return el === role;
			});

			if (!found) {
				await towerAxios.delete(
					`/groups/${currentGroup.value.id}/role?role=${role}`
				);
			}
		}

		currentGroup.value.roles = [...currentRoles.value];
	} else if (currentGroup.value && !currentGroup.value.id) {
		// New group
		const response = await towerAxios.post('/groups', {
			name: currentGroup.value.name,
			roles: currentRoles.value,
		});
		if (response.status === 200) {
			currentGroup.value = response.data;
		}
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
		return !!el.id;
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
		await towerAxios.delete(`/groups/${currentGroup.value.id}`);
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

	if (!currentGroup.value.id) {
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

//====================================================
// Watch
//====================================================
watch(
	() => currentGroup.value,
	(current) => {
		allGroups.value = allGroups.value.filter((el) => {
			return !!el.id;
		});

		if (current) {
			currentRoles.value = [...current.roles];
		}
	}
);

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

<style scoped>
.tower-min-height {
	min-height: calc(100vh - 16rem);
	max-height: calc(100vh - 16rem);
	overflow: auto;
}
</style>
