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
		<q-dialog v-model="connectionItemRemoveDialog" persistent>
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Remove connection item</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove
					<span class="tw-italic" v-if="currentConnectionItem">{{
						currentConnectionItem._name
					}}</span>
					connection item?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="removeConnectionItem"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="connectionRemoveDialog" persistent>
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Remove connection</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove
					<span class="tw-italic" v-if="currentConnection">{{
						currentConnection.connectionName
					}}</span>
					connection?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="removeConnection"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div class="tw-flex tw-flex-col tw-items-center">
			<tower-select
				v-model="currentConnection"
				:loading="loading"
				:options="allConnections"
				class="tw-w-[33.3%]"
				label="Connection"
				option-label="connectionName"
				@update:modelValue="currentConnectionUpdated"
			>
				<template #after>
					<q-btn flat padding="sm" @click="addNewConnection">
						<q-icon name="sym_o_add" />
					</q-btn>
					<q-btn
						v-if="
							currentConnectionClone &&
							currentConnectionClone.connectionName !== 'New connection'
						"
						flat
						padding="sm"
						@click="connectionRemoveDialog = true"
					>
						<q-icon name="sym_o_delete" />
					</q-btn>
				</template>
			</tower-select>
		</div>
		<div
			class="tw-mt-5 tw-flex tw-gap-3 tw-h-full"
			v-if="currentConnectionClone"
		>
			<q-form autocomplete="off" class="tw-flex-grow">
				<q-input
					v-model="currentConnectionClone.tenantId"
					label="Directory (tenant) ID"
					color="secondary"
					:rules="[(val) => !!val || 'TenantId can\'t be empty']"
				>
				</q-input>
				<div class="tw-flex-grow">
					<q-input
						v-model="currentConnectionClone.clientId"
						dense
						color="secondary"
						:rules="[(val) => !!val || 'ClientId can\'t be empty']"
						label="Application (client) ID"
					/>
				</div>
				<q-input
					v-model="currentConnectionClone.clientSecret"
					dense
					color="secondary"
					:rules="[(val) => !!val || 'Secret key can\'t be empty']"
					:type="passwordVisible ? 'text' : 'password'"
					label="Client secret"
					autocomplete="off"
				>
					<template #append>
						<q-btn
							:icon="passwordVisible ? 'sym_o_lock' : 'sym_o_lock_open'"
							flat
							padding="sm"
							@click="passwordVisible = !passwordVisible"
						></q-btn>
					</template>
				</q-input>
				<div class="tw-flex-grow">
					<q-input
						v-model="currentConnectionClone.vaultName"
						dense
						color="secondary"
						:rules="[(val) => !!val || 'Key Vault name can\'t be empty']"
						label="Key Vault name"
					/>
				</div>
				<div class="tw-flex-grow">
					<q-input
						v-model="currentConnectionClone.url"
						dense
						color="secondary"
						:rules="[(val) => !!val || 'Key Vault URL can\'t be empty']"
						label="Key Vault URL"
					/>
				</div>
				<div class="tw-flex-grow">
					<tower-select
						v-model="currentConnectionItem"
						:options="currentConnectionClone.items"
						label="Connection items"
						option-label="_name"
					>
						<template #after>
							<q-btn flat padding="sm" @click="addConnectionItem">
								<q-icon name="sym_o_add" />
							</q-btn>
							<q-btn
								flat
								padding="sm"
								@click="connectionItemRemoveDialog = true"
							>
								<q-icon name="sym_o_delete" />
							</q-btn>
						</template>
					</tower-select>
				</div>
				<div
					v-if="currentConnectionItem"
					class="tw-rounded tw-mt-3 tw-pb-3 tw-px-3 tw-border tw-border-dark tw-bg-dark"
				>
					<div
						v-for="base of allBases"
						:key="base._id"
						class="tw-flex-grow tw-py-1"
					>
						<tower-select
							:label="base.name"
							v-model="currentConnectionItem[base.name] as string"
							:options="allModels.get(base.name)"
							dense
							color="secondary"
							displayAsEmpty="ANY"
							clearable
							@update:model-value="updateConnectionItemName"
						>
						</tower-select>
					</div>
				</div>
			</q-form>
			<div class="tw-w-[20rem]">
				<div
					class="tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
				>
					<div class="tw-text-xl tw-font-medium tw-mx-3">Test connection</div>
					<div class="tw-text-gray-500 tw-mx-3">
						Test provided connection details
					</div>
					<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
					<q-btn
						class="tw-bg-secondary tw-mx-3 tw-flex-grow"
						flat
						text-color="primary"
						:disable="!!hasErrors"
						@click="testConnection"
					>
						<q-icon
							class="tw-mr-3"
							color="primary"
							name="sym_o_cable"
							size="sm"
						/>
						Test connection
					</q-btn>
				</div>
			</div>
		</div>
		<div v-if="currentConnection">
			<save-panel
				:save-enabled="isDifferent && canSave"
				:has-errors="!!hasErrors"
				:error-text="hasErrors"
				@save-clicked="saveConnection"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from 'vue';
import TowerSelect from 'components/basic/towerSelect.vue';
import SavePanel from 'components/basic/savePanel.vue';
import { useQuasar } from 'quasar';
import { navigationStore } from 'stores/navigation';
import { towerAxios } from 'boot/axios';
import { AxiosError } from 'axios';
import { cloneDeep, isEmpty, isEqual } from 'lodash';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { basesStore } from 'stores/bases';
import { v4 as uuidv4 } from 'uuid';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const navigationSt = navigationStore();
const baseSt = basesStore();

//====================================================
// Interfaces
//====================================================
interface AzureConnection {
	_id?: string;
	__v?: string;
	connectionName: string;
	system: string;
	enabled: boolean;
	tenantId: string;
	clientId: string;
	clientSecret: string;
	vaultName: string;
	url: string;
	items: AzureConnectionItem[];
}

interface AzureConnectionItem {
	[x: string]: unknown;
}

//====================================================
// Data
//====================================================
const currentConnection: Ref<AzureConnection | null> = ref(null);
const currentConnectionClone: Ref<AzureConnection | null> = ref(null);
const currentConnectionItem: Ref<AzureConnectionItem | null> = ref(null);
const allConnections: Ref<Array<AzureConnection>> = ref([]);
const allModels: Ref<Map<string, Array<string>>> = ref(new Map());

const connectionItemRemoveDialog = ref(false);
const connectionRemoveDialog = ref(false);

const passwordVisible = ref(false);

const loading = ref(false);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getAllModels();
	await getAllConnections();
});

//====================================================
// Computed
//====================================================
/**
 * isDifferent
 */
const isDifferent = computed(() => {
	return !isEqual(currentConnection.value, currentConnectionClone.value);
});

const canSave = computed(() => {
	if (currentConnectionClone.value) {
		return (
			!isEmpty(currentConnectionClone.value.clientId) &&
			!isEmpty(currentConnectionClone.value.vaultName) &&
			!isEmpty(currentConnectionClone.value.clientSecret) &&
			!isEmpty(currentConnectionClone.value.tenantId) &&
			!isEmpty(currentConnectionClone.value.url)
		);
	}

	return false;
});

/**
 * hasErrors
 */
const hasErrors = computed(() => {
	return '';
});

/**
 * allBases
 */
const allBases = computed(() => baseSt.getBases);

//====================================================
// Methods
//====================================================
/**
 * getAllConnections
 */
const getAllConnections = async () => {
	loading.value = true;

	const filter = {
		where: {
			system: 'AzureConnection',
		},
	};

	allConnections.value = [];

	try {
		const response = await towerAxios.get(
			`/connections?filter=${JSON.stringify(filter, undefined, '')}`,
		);

		if (response?.status === 200 && response.data.length > 0) {
			response.data.forEach((connection: AzureConnection) => {
				const tempConnection = {
					...connection,
					connectionName: `${connection.tenantId} - ${connection.clientId}`,
				};

				delete tempConnection.__v;

				if (tempConnection.items) {
					tempConnection.items = tempConnection.items.map((item) => {
						item._name = setConnectionItemName(item);
						item._id = uuidv4();
						return item;
					});
				}

				allConnections.value.push(tempConnection);
			});
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting AWS Secrets Manager details',
		});
	}
	loading.value = false;
};

/**
 * getAllModels
 */
const getAllModels = async () => {
	loading.value = true;

	const filter = {
		order: 'name ASC',
	};

	try {
		const response = await towerAxios.get(
			`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`,
		);
		if (response.status === 200) {
			response.data.forEach((el: ConfigurationModel) => {
				if (allModels.value.has(el.base)) {
					allModels.value.get(el.base)?.push(el.name);
				} else {
					allModels.value.set(el.base, [el.name]);
				}
			});
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting SCP details',
		});
	}

	loading.value = false;
};

/**
 * currentConnectionUpdated
 */
const currentConnectionUpdated = () => {
	passwordVisible.value = false;
	currentConnectionClone.value = cloneDeep(currentConnection.value);
	currentConnectionItem.value = null;
};

/**
 * addNewConnection
 */
const addNewConnection = () => {
	currentConnectionClone.value = {
		connectionName: 'New connection',
		items: [],
		tenantId: '',
		clientId: '',
		clientSecret: '',
		vaultName: '',
		url: '',
		system: 'AzureConnection',
		enabled: true,
	};

	currentConnection.value = {
		connectionName: 'New connection',
		items: [],
		system: 'AzureConnection',
		tenantId: '',
		clientId: '',
		clientSecret: '',
		vaultName: '',
		url: '',
		enabled: true,
	};

	currentConnectionItem.value = null;

	passwordVisible.value = false;
};

/**
 * addConnectionItem
 */
const addConnectionItem = () => {
	if (currentConnectionClone.value) {
		const temp: AzureConnectionItem = { _id: uuidv4() };
		temp._name = setConnectionItemName(temp);

		currentConnectionClone.value?.items.push(temp);

		currentConnectionItem.value = temp;
	}
};

/**
 * removeConnectionItem
 */
const removeConnectionItem = () => {
	if (currentConnectionClone.value) {
		currentConnectionClone.value.items =
			currentConnectionClone.value.items.filter((el) => {
				return el._id !== currentConnectionItem.value?._id;
			});

		currentConnectionItem.value = null;
	}
};

/**
 * removeConnection
 */
const removeConnection = async () => {
	if (currentConnection.value) {
		try {
			if (currentConnection.value?._id) {
				const response = await towerAxios.delete(
					`/connections/${currentConnection.value._id}`,
				);

				if (response.status === 204) {
					$q.notify({
						color: 'positive',
						position: 'top',
						textColor: 'secondary',
						message: 'Connection removed successfully',
					});

					currentConnection.value = null;
					currentConnectionClone.value = null;
				}
			}

			await getAllConnections();
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error deleting connection',
			});
		}
	}

	connectionRemoveDialog.value = false;
};

/**
 * setConnectionItemName
 */
const setConnectionItemName = (item: AzureConnectionItem) => {
	let _name = '';
	for (let i = 0; i < allBases.value.length; i++) {
		const base = allBases.value[i];
		if (item[base.name]) {
			_name += `${item[base.name]}`;
		} else {
			_name += '<<ANY>>';
		}

		if (i + 1 < allBases.value.length) {
			_name += '/';
		}
	}

	return _name;
};

/**
 * updateConnectionItemName
 */
const updateConnectionItemName = () => {
	if (currentConnectionItem.value) {
		currentConnectionItem.value._name = setConnectionItemName(
			currentConnectionItem.value,
		);
	}
};

/**
 * saveConnection
 */
const saveConnection = async () => {
	if (currentConnectionClone.value) {
		loading.value = true;

		const temp = cloneDeep(currentConnectionClone.value);
		temp.items = [];
		currentConnectionClone.value.items.forEach((item) => {
			const tempItem: AzureConnectionItem = {};
			for (const base of allBases.value) {
				tempItem[base.name] = item[base.name] ? item[base.name] : undefined;
			}
			temp.items.push(tempItem);
		});

		try {
			const response = await towerAxios.patch('/connections', temp);
			if (response.status === 200) {
				await getAllConnections();
				currentConnection.value = cloneDeep(currentConnectionClone.value);
				currentConnection.value.connectionName = `${currentConnection.value.tenantId} - ${currentConnection.value.clientId}`;

				$q.notify({
					color: 'positive',
					position: 'top',
					textColor: 'secondary',
					message: 'Connection saved successfully',
				});
			}
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error saving connection',
			});
		}
	}

	loading.value = false;
};

/**
 * testConnection
 */
const testConnection = async () => {
	try {
		loading.value = true;

		const response = await towerAxios.post(
			'/connections/testConnection?type=AzureConnection',
			currentConnectionClone.value,
		);

		if (response.status === 204) {
			$q.notify({
				color: 'positive',
				position: 'top',
				textColor: 'secondary',
				message: 'Connection established successfully',
			});
		}
	} catch (e) {
		const testConnectionMessage = ((e as AxiosError).response?.data as any)
			?.error?.message
			? ((e as AxiosError).response?.data as any)?.error?.message
			: (e as AxiosError).message;

		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: testConnectionMessage,
		});
	}

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
	},
);
</script>

<style scoped></style>
