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
		<div class="tw-flex tw-flex-col tw-items-center">
			<tower-select
				v-model="currentBase"
				label="Base"
				:options="basesSt.getBases"
				option-label="name"
				class="tw-w-[33.3%]"
				@update:modelValue="getAllModels"
				:loading="loading"
			/>
		</div>
		<div
			class="tw-flex tw-flex-col tw-h-full tw-mt-6"
			v-if="currentConfigurationModels.length > 0"
		>
			<q-list>
				<template v-for="model of currentConfigurationModels" :key="model.name">
					<q-item
						clickable
						@click="addOrRemoveCustomPermission(model.name)"
						:disable="loading"
					>
						<q-item-section avatar>
							<q-icon
								:name="
									currentRoles.includes(
										`configurationModel.${currentBase?.name}.${model.name}.view`
									)
										? 'sym_o_check'
										: 'sym_o_check_box_outline_blank'
								"
								:color="
									currentRoles.includes(
										`configurationModel.${currentBase?.name}.${model.name}.view`
									)
										? 'positive'
										: 'grey-7'
								"
								class="heavy"
								size="sm"
							/>
						</q-item-section>
						<q-item-section>
							<q-item-label>{{ model.name }}</q-item-label>
						</q-item-section>
					</q-item>
				</template>
			</q-list>
			<div class="tw-flex-grow" />
			<div class="tw-justify-self-end">
				<save-panel
					:save-enabled="isDifferent"
					@save-clicked="savePermissions"
					:loading="loading"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Role } from 'pages/settings/types/Role';
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { towerAxios } from 'boot/axios';
import TowerSelect from 'components/basic/towerSelect.vue';
import { basesStore } from 'stores/bases';
import { Base } from 'components/bases/base';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import SavePanel from 'components/basic/savePanel.vue';
import { useQuasar } from 'quasar';
import { navigationStore } from 'stores/navigation';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const basesSt = basesStore();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const allRoles: Ref<Array<Role>> = ref([]);

const currentBase: Ref<Base | null> = ref(null);
const currentConfigurationModels: Ref<Array<ConfigurationModel>> = ref([]);

const currentRoles: Ref<Array<string>> = ref([]);

const loading = ref(false);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getAllRoles();
});

//====================================================
// Computed
//====================================================
/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (allRoles.value.length !== currentRoles.value.length) {
		return true;
	}

	return allRoles.value.some((el) => {
		return !currentRoles.value.some((role) => {
			return role === el.name;
		});
	});
});

//====================================================
// Methods
//====================================================
/**
 * getAllRoles
 */
const getAllRoles = async () => {
	loading.value = true;

	const filter = {
		where: {
			name: { like: '^configurationModel\.' },
		},
	};

	const response = await towerAxios.get(
		`Roles?filter=${JSON.stringify(filter, undefined, '')}`
	);

	if (response.status === 200) {
		const regEx = new RegExp('^configurationModel.\\S+.(view|modify)$');
		currentRoles.value = [];

		allRoles.value = response.data.filter((role: Role) => {
			if (regEx.test(role.name)) {
				currentRoles.value.push(role.name);
				return true;
			}
			return false;
		});
	}

	loading.value = false;
};

/**
 * getAllModels
 */
const getAllModels = async () => {
	currentConfigurationModels.value = [];

	if (!currentBase.value) {
		return;
	}

	loading.value = true;

	const filter = {
		where: {
			base: currentBase.value?.name,
		},
		order: 'name ASC',
	};

	const response = await towerAxios.get(
		`configurationModels?filter=${JSON.stringify(filter, undefined, '')}`
	);
	if (response.status === 200) {
		currentConfigurationModels.value = response.data;
	}

	loading.value = false;
};

/**
 * addCustomPermission
 */
const addOrRemoveCustomPermission = (name: string) => {
	if (
		currentRoles.value.includes(
			`configurationModel.${currentBase.value?.name}.${name}.view`
		)
	) {
		const regex = new RegExp(
			`^(configurationModel|constantVariable).${currentBase.value?.name}.${name}.(view|modify)$`
		);
		currentRoles.value = currentRoles.value.filter((el) => {
			return !regex.test(el);
		});
	} else {
		currentRoles.value.push(
			`configurationModel.${currentBase.value?.name}.${name}.view`
		);
		currentRoles.value.push(
			`configurationModel.${currentBase.value?.name}.${name}.modify`
		);

		currentRoles.value.push(
			`constantVariable.${currentBase.value?.name}.${name}.modify`
		);
	}
};

/**
 * savePermissions
 */
const savePermissions = async () => {
	loading.value = true;

	// add
	for (const role of currentRoles.value) {
		const exists = allRoles.value.some((el) => {
			return el.name === role;
		});

		if (!exists) {
			try {
				await towerAxios.post('/Roles', {
					name: role,
				});
			} catch (e) {
				$q.notify({
					color: 'negative',
					position: 'top',
					textColor: 'secondary',
					icon: 'sym_o_error',
					message: 'Error saving permissions',
				});
			}
		}
	}
	// remove
	for (const role of allRoles.value) {
		const exists = currentRoles.value.some((el) => {
			return el === role.name;
		});

		if (!exists) {
			try {
				await towerAxios.delete(`/Roles/${role.id}`);
			} catch (e) {
				$q.notify({
					color: 'negative',
					position: 'top',
					textColor: 'secondary',
					icon: 'sym_o_error',
					message: 'Error saving permissions',
				});
			}
		}
	}

	$q.notify({
		color: 'positive',
		position: 'top',
		textColor: 'secondary',
		message: 'Configuration saved successfully',
	});

	await getAllRoles();

	loading.value = false;
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
