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
		<q-dialog v-model="removeConnectionDialog" persistent>
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
						@click="removeSelectedConnection"
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
							currentConnection &&
							currentConnection.connectionName !== 'New connection'
						"
						flat
						padding="sm"
						@click="removeConnectionDialog = true"
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
			<div class="tw-flex-grow">
				<div class="tw-flex">
					<q-input
						v-model="currentConnectionClone.username"
						ref="usernameInput"
						label="Username"
						dense
						color="secondary"
						class="tw-flex-grow"
						:rules="[(val) => !!val || 'Username can\'t be empty']"
					/>
					<q-icon
						name="sym_o_alternate_email"
						size="sm"
						class="tw-mt-4 tw-mx-1.5"
					/>
					<q-input
						v-model="currentConnectionClone.host"
						ref="hostInput"
						label="Host"
						color="secondary"
						dense
						class="tw-flex-grow"
						:rules="[(val) => !!val || 'Host can\'t be empty']"
					/>
					<div class="tw-mt-4 tw-mx-3">:</div>
					<q-input
						v-model="currentConnectionClone.port"
						ref="portInput"
						label="Port"
						color="secondary"
						dense
						class="tw-flex-grow"
						:rules="[(val) => !!val || 'Port can\'t be empty']"
					/>
				</div>
				<div class="tw-rounded tw-mt-3 tw-border tw-border-dark tw-bg-dark">
					<div class="tw-flex">
						<q-option-group
							v-model="currentConnectionClone.authType"
							color="secondary"
							:options="[
								{
									label: 'SSH key',
									value: 'key',
								},
								{ label: 'Password', value: 'userpass' },
							]"
							@update:modelValue="onAuthTypeChange"
						/>
						<div class="tw-flex-grow tw-mx-3 tw-self-center">
							<q-input
								v-if="currentConnectionClone.authType === 'key'"
								ref="sshKeyInput"
								v-model="currentConnectionClone.key"
								:rules="[(val) => !!val || 'SSH key can\'t be empty']"
								color="secondary"
								dense
								label="SSH key"
							/>
							<q-input
								v-if="currentConnectionClone?.authType === 'userpass'"
								ref="passwordInput"
								:rules="[(val) => !!val || 'Password can\'t be empty']"
								color="secondary"
								v-model="currentConnectionClone.password"
								dense
								:type="passwordVisible ? 'text' : 'password'"
								label="Password"
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
						</div>
					</div>
				</div>
				<tower-select
					v-model="currentConnectionItem"
					:options="currentConnectionClone.items"
					label="Connection item"
					class="tw-mt-3"
					option-label="__name__"
				>
					<template #after>
						<q-btn flat padding="sm" @click="addConnectionItem">
							<q-icon name="sym_o_add" />
						</q-btn>
						<q-btn flat padding="sm" @click="removeConnectionItem">
							<q-icon name="sym_o_delete" />
						</q-btn>
					</template>
				</tower-select>
				<template v-if="currentConnectionItem">
					<div class="tw-flex tw-gap-3 tw-mt-3">
						<tower-select
							v-for="base of basesSt.getBases"
							:key="base._id"
							:label="base.name"
							:options="allModels.get(base.name)"
							option-label="name"
							class="tw-flex-grow"
							:rules="[(val) => !!val || `${base.name} can't be empty`]"
							v-model="currentConnectionItem[base.name]"
							@update:modelValue="changeCurrentConnectionItemName"
						>
						</tower-select>
					</div>
					<tower-select
						v-model="currentConnectionItem.template"
						:options="allTemplates"
						label="Template"
						option-label="url"
						:rules="[(val) => !!val || 'Template can\'t be empty']"
					/>
					<q-input
						v-model="currentConnectionItem.path"
						dense
						label="Path on server"
						color="secondary"
						:rules="[(val) => !!val || 'Path can\'t be empty']"
					/>
				</template>
			</div>
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
		<div v-if="currentConnectionClone">
			<save-panel
				:save-enabled="isDifferent"
				:has-errors="!!hasErrors"
				:error-text="hasErrors"
				@save-clicked="saveConnection"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, Ref, watch } from 'vue';
import TowerSelect from 'components/basic/towerSelect.vue';
import { towerAxios } from 'boot/axios';
import { basesStore } from 'stores/bases';
import SavePanel from 'components/basic/savePanel.vue';
import { RestConfiguration } from 'pages/settings/types/restConfiguration';
import { QInput, useQuasar } from 'quasar';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { AxiosError } from 'axios/index';
import { navigationStore } from 'stores/navigation';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const basesSt = basesStore();
const navigationSt = navigationStore();

//====================================================
// Interfaces
//====================================================
interface SCPConnection {
	_id?: string;
	system: string;
	enabled: boolean;
	authType: string;
	key: string;
	host: string;
	port: number;
	items: Array<ConnectionItem>;
	username: string;
	password: string;
	connectionName?: string;
}

interface ConnectionItem {
	path: string;
	template: {
		id: string;
		url: string;
	} | null;

	[x: string]: unknown;
}

//====================================================
// Data
//====================================================
const currentConnection: Ref<SCPConnection | null> = ref(null);
const currentConnectionClone: Ref<SCPConnection | null> = ref(null);
const currentConnectionItem: Ref<ConnectionItem | null> = ref(null);
const allConnections: Ref<Array<SCPConnection>> = ref([]);
const allModels: Ref<Map<string, Array<string>>> = ref(new Map());

const allTemplates: Ref<Array<RestConfiguration>> = ref([]);

const passwordVisible = ref(false);

const loading = ref(false);

const sshKeyInput = ref(null);
const passwordInput = ref(null);
const usernameInput = ref(null);
const hostInput = ref(null);
const portInput = ref(null);

const removeConnectionDialog = ref(false);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getAllConnections();
	await getAllModels();
	await getAllTemplates();
});

//====================================================
// Computed
//====================================================
/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (currentConnection.value && currentConnectionClone.value) {
		if (
			currentConnection.value?.username !==
				currentConnectionClone.value?.username ||
			currentConnection.value?.host !== currentConnectionClone.value?.host ||
			currentConnection.value?.port !== currentConnectionClone.value?.port ||
			currentConnection.value?.authType !==
				currentConnectionClone.value?.authType
		) {
			return true;
		}

		if (currentConnectionClone.value?.authType === 'key') {
			if (currentConnection.value.key !== currentConnectionClone.value?.key) {
				return true;
			}
		} else {
			if (
				currentConnection.value?.password !==
				currentConnectionClone.value?.password
			) {
				return true;
			}
		}

		if (
			currentConnection.value?.items.length !==
			currentConnectionClone.value?.items.length
		) {
			return true;
		}

		for (let i = 0; i < currentConnection.value?.items.length; i++) {
			if (currentConnectionClone.value?.items[i]) {
				const item = currentConnection.value?.items[i];
				const cloneItem = currentConnectionClone.value?.items[i];
				for (const name in item) {
					if (name === 'template') {
						if (
							item?.template?.id !== cloneItem?.template?.id ||
							item?.template?.url !== cloneItem?.template?.url
						) {
							return true;
						}
					} else if (item[name] !== cloneItem[name]) {
						return true;
					}
				}
			} else {
				return true;
			}
		}
	}

	return false;
});

/**
 * hasErrors
 */
const hasErrors = computed(() => {
	if (currentConnectionClone.value) {
		if (!currentConnectionClone.value?.username) {
			return "Username can't be empty";
		}

		if (!currentConnectionClone.value?.host) {
			return "Host can't be empty";
		}

		if (
			currentConnectionClone.value?.authType === 'key' &&
			!currentConnectionClone.value?.key
		) {
			return "SSH key can't be empty";
		}

		if (
			currentConnectionClone.value?.authType === 'userpass' &&
			!currentConnectionClone.value?.password
		) {
			return "Password can't be empty";
		}

		for (const item of currentConnectionClone.value?.items) {
			for (const base of basesSt.getBases) {
				if (!item[base.name]) {
					return `${base.name} in one of your connection items is invalid`;
				}
			}

			if (!item.template) {
				return 'Template in one of your connection items is invalid';
			}

			if (!item.path) {
				return 'Path in one of your connection items is invalid';
			}
		}

		let duplicate = null;

		if (currentConnectionClone.value._id) {
			duplicate = allConnections.value.find((el) => {
				return (
					el._id !== currentConnectionClone.value?._id &&
					el.host === currentConnectionClone.value?.host &&
					el.username === currentConnectionClone.value?.username
				);
			});
		} else {
			duplicate = allConnections.value.find((el) => {
				return (
					el.host === currentConnectionClone.value?.host &&
					el.username === currentConnectionClone.value?.username
				);
			});
		}

		if (duplicate) {
			return 'Connection with this username and host exists already';
		}
	}

	return '';
});

//====================================================
// Methods
//====================================================
/**
 * getAllConnections
 */
const getAllConnections = async () => {
	const filter = {
		where: {
			system: 'SCP',
		},
	};

	loading.value = true;

	const response = await towerAxios.get(
		`/connections?filter=${JSON.stringify(filter, undefined, '')}`
	);
	if (response.status === 200) {
		allConnections.value = [];
		response.data.forEach((el: any) => {
			const items: Array<ConnectionItem> = [];
			el.items.forEach((el: ConnectionItem) => {
				let item = el;
				item['__name__'] = extractItemName(el);

				items.push(item);
			});

			allConnections.value.push({
				_id: el._id,
				enabled: true,
				authType: el.authType,
				host: el.host,
				items: items,
				key: el.key,
				port: el.port,
				password: el.password,
				system: el.system,
				username: el.username,
				connectionName: `${el.username}@${el.host}`,
			});
		});
	}

	loading.value = false;
};

/**
 * getAllTemplates
 */
const getAllTemplates = async () => {
	loading.value = true;

	const response = await towerAxios.get('/restConfigurations');
	if (response.status === 200) {
		allTemplates.value = response.data;
	}

	loading.value = false;
};

const getAllModels = async () => {
	loading.value = true;

	const filter = {
		order: 'name ASC',
	};

	const response = await towerAxios.get(
		`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`
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

	loading.value = false;
};

/**
 * extractItemName
 */
const extractItemName = (item: ConnectionItem) => {
	let name = '';
	for (const base of basesSt.getBases) {
		if (name && item[base.name]) {
			name += '/';
		}
		if (item[base.name]) {
			name += `${item[base.name]}`;
		}
	}

	return name;
};

/**
 * onAuthTypeChange
 */
const onAuthTypeChange = () => {
	nextTick(() => {
		if (sshKeyInput.value) {
			(sshKeyInput.value as QInput).validate();
		} else if (passwordInput.value) {
			(passwordInput.value as QInput).validate();
		}
	});
};

/**
 * changeCurrentConnectionItemName
 */
const changeCurrentConnectionItemName = () => {
	if (currentConnectionItem.value) {
		currentConnectionItem.value.__name__ = extractItemName(
			currentConnectionItem.value
		);
	}
};

/**
 * addConnectionItem
 */
const addConnectionItem = () => {
	if (currentConnectionClone.value) {
		currentConnectionItem.value = {
			template: null,
			path: '',
		};

		for (const base of basesSt.getBases) {
			currentConnectionItem.value[base.name] = null;
		}

		currentConnectionItem.value.__name__ = 'New Connection item';

		currentConnectionClone.value.items.push(currentConnectionItem.value);
	}
};

/**
 * removeConnectionItem
 */
const removeConnectionItem = () => {
	if (currentConnectionClone.value) {
		currentConnectionClone.value.items =
			currentConnectionClone.value.items.filter((el) => {
				for (const name in currentConnectionItem.value) {
					if (currentConnectionItem.value[name] !== el[name]) {
						return true;
					}
				}

				return false;
			});

		currentConnectionItem.value = null;
	}
};

/**
 * currentConnectionUpdated
 */
const currentConnectionUpdated = () => {
	currentConnectionItem.value = null;
	if (currentConnection.value) {
		const items: Array<ConnectionItem> = [];
		currentConnection.value?.items.forEach((el) => {
			const item: ConnectionItem = {
				path: el.path,
				template: el.template,
			};

			const names = Object.getOwnPropertyNames(el);
			for (const name of names) {
				item[name] = el[name];
			}

			item.__name__ = extractItemName(item);

			items.push(item);
		});

		currentConnectionClone.value = {
			_id: currentConnection.value._id,
			enabled: true,
			username: currentConnection.value.username,
			key: currentConnection.value?.key,
			port: currentConnection.value?.port,
			password: currentConnection.value?.password,
			authType: currentConnection.value?.authType,
			items: items,
			connectionName: currentConnectionClone.value?.connectionName,
			host: currentConnection.value?.host,
			system: currentConnection.value?.system,
		};
	} else {
		currentConnectionClone.value = null;
	}
};

/**
 * removeSelectedConnection
 */
const removeSelectedConnection = async () => {
	try {
		if (currentConnection.value?._id) {
			const response = await towerAxios.delete(
				`/connections/${currentConnection.value._id}`
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
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error deleting connection',
		});
	}
};

/**
 * addNewConnection
 */
const addNewConnection = () => {
	currentConnection.value = {
		system: 'SCP',
		enabled: true,
		key: '',
		username: '',
		host: '',
		port: 22,
		items: [],
		password: '',
		connectionName: 'New connection',
		authType: 'key',
	};

	currentConnectionUpdated();

	nextTick(() => {
		if (usernameInput.value) {
			(usernameInput.value as QInput).validate();
		}
		if (hostInput.value) {
			(hostInput.value as QInput).validate();
		}
		if (portInput.value) {
			(portInput.value as QInput).validate();
		}
		if (sshKeyInput.value) {
			(sshKeyInput.value as QInput).validate();
		}
	});
};

/**
 * saveConnection
 */
const saveConnection = async () => {
	if (currentConnectionClone.value) {
		loading.value = true;

		currentConnectionClone.value?.items.map((el) => {
			if (el.template) {
				el.template = {
					id: el.template?.id,
					url: el.template?.url,
				};
			}

			return el;
		});

		try {
			const response = await towerAxios.patch(
				'/connections',
				currentConnectionClone.value
			);
			if (response.status === 200) {
				await getAllConnections();

				const currentCon = allConnections.value.find((el) => {
					return (
						el.host === currentConnectionClone.value?.host &&
						el.username === currentConnectionClone.value?.username
					);
				});

				if (currentCon) {
					currentConnection.value = currentCon;
					currentConnectionUpdated();
				}

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

		loading.value = false;
	}
};

/**
 * testConnection
 */
const testConnection = async () => {
	try {
		loading.value = true;

		const response = await towerAxios.post(
			'/connections/testConnection?type=SCP',
			currentConnectionClone.value
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
	}
);
</script>

<style scoped></style>
