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
						v-if="currentConnection && currentConnection._id"
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
			<q-form
				class="tw-flex-grow"
				autocorrect="off"
				autocapitalize="off"
				autocomplete="off"
				spellcheck="false"
			>
				<q-input
					v-model="currentConnectionClone.url"
					label="Cluster URL"
					dense
					color="secondary"
					class="tw-flex-grow"
					:rules="[
						(val) => !!val || 'URL can\'t be empty',
						(val) => /^https*:\/\//.test(val) || 'Invalid Cluster URL',
					]"
					:autofocus="false"
				/>
				<q-input
					v-model="currentConnectionClone.token"
					autocomplete="new-password"
					label="Access Token"
					color="secondary"
					:type="tokenVisible ? 'text' : 'password'"
					dense
					class="tw-flex-grow"
					:rules="[(val) => !!val || 'Token can\'t be empty']"
					:autofocus="false"
				>
					<template #append>
						<q-btn
							:icon="tokenVisible ? 'sym_o_lock' : 'sym_o_lock_open'"
							flat
							padding="sm"
							@click="tokenVisible = !tokenVisible"
						></q-btn>
					</template>
				</q-input>
				<q-input
					v-model="currentConnectionClone.namespace"
					label="Namespace"
					dense
					color="secondary"
					class="tw-flex-grow"
					:rules="[(val) => !!val || 'Namespace can\'t be empty']"
					:autofocus="false"
				/>
				<tower-select
					v-model="currentConnectionItem"
					:options="currentConnectionClone.items"
					label="Connection item"
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
							clearable
							option-label="name"
							displayAsEmpty="ANY"
							class="tw-flex-grow"
							v-model="currentConnectionItem[base.name]"
							@update:modelValue="changeCurrentConnectionItemName"
						>
						</tower-select>
					</div>
					<tower-select
						label="Mode"
						:options="['Full', 'Variable']"
						class="tw-mt-3"
						dense
						v-model="currentConnectionItem.__mode__"
						@update:modelValue="onItemModeChange"
					></tower-select>
					<q-input
						v-if="currentConnectionItem.__mode__ === 'Variable'"
						ref="variableNameRef"
						v-model="currentConnectionItem.__variableName__"
						class="animateMargin tw-mt-3"
						dense
						label="Variable name"
						color="secondary"
						:rules="[(val) => !!val || 'Variable name can\'t be empty']"
						:autofocus="false"
					></q-input>
					<tower-select
						v-if="currentConnectionItem.__mode__ === 'Variable'"
						ref="templateRef"
						v-model="currentConnectionItem.__template__"
						:options="allTemplates"
						option-label="url"
						option-value="_id"
						:class="{
							'tw-mt-3':
								currentConnectionItem.__mode__ === 'Variable' &&
								!currentConnectionItem.__variableName__,
						}"
						class="animateMargin"
						dense
						label="Template"
						color="secondary"
						:rules="[(val) => !!val || 'Template can\'t be empty']"
					></tower-select>
					<q-input
						v-model="currentConnectionItem.__secretName__"
						:class="{
							'tw-mt-3':
								(currentConnectionItem.__mode__ === 'Variable' &&
									!currentConnectionItem.__template__) ||
								currentConnectionItem.__mode__ === 'Full',
						}"
						class="animateMargin"
						dense
						label="Secret name (optional)"
						color="secondary"
						:rules="[secretsValidationRule]"
						:hint="`You can use base names, e.g. {${basesSt.getBases[0].name}}. If not specified, it will be set to {${basesSt.getBases[basesSt.getBases.length - 1].name}}`"
						:autofocus="false"
					/>
				</template>
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
						:disable="!!hasErrors || loading"
						:loading="loading"
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
import { QInput, QSelect, useQuasar } from 'quasar';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { AxiosError } from 'axios';
import { navigationStore } from 'stores/navigation';
import { cloneDeep, isEqual } from 'lodash';
import { RestConfiguration } from 'pages/settings/types/restConfiguration';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const basesSt = basesStore();
const navigationSt = navigationStore();

//====================================================
// Interfaces
//====================================================
interface KubernetesConnection {
	_id?: string;
	url: string;
	items: Array<ConnectionItem>;
	token: string;
	namespace: string;
}

interface ConnectionItem {
	__secretName__: string;
	__mode__: string;

	[x: string]: unknown;
}

//====================================================
// Data
//====================================================
const currentConnection: Ref<KubernetesConnection | null> = ref(null);
const currentConnectionClone: Ref<KubernetesConnection | null> = ref(null);
const currentConnectionItem: Ref<ConnectionItem | null> = ref(null);
const allConnections: Ref<Array<KubernetesConnection>> = ref([]);
const allModels: Ref<Map<string, Array<string>>> = ref(new Map());

const allTemplates: Ref<Array<RestConfiguration>> = ref([]);

const tokenVisible = ref(false);

const loading = ref(false);

const removeConnectionDialog = ref(false);

const templateRef: Ref<QSelect | null> = ref(null);
const variableNameRef: Ref<QInput | null> = ref(null);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await Promise.all([getAllConnections(), getAllModels(), getAllTemplates()]);
});

//====================================================
// Computed
//====================================================
/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (currentConnectionClone.value) {
		const clone = cloneDeep(currentConnectionClone.value);
		clone.items = clone.items.map((el) => {
			if (el.__template__?._id) {
				el.__template__ = el.__template__._id;
			} else {
				el.__template__ = undefined;
				delete el.__template__;
			}
			return el;
		});
		return !isEqual(currentConnection.value, clone);
	}

	return true;
});

/**
 * hasErrors
 */
const hasErrors = computed(() => {
	if (!currentConnectionClone.value?.url) {
		return 'Please provide the cluster URL';
	} else if (!/https*:\/\//.test(currentConnectionClone.value?.url)) {
		return 'Invalid Cluster URL';
	}

	if (currentConnectionClone.value.items.length === 0) {
		return 'There must be at least one Connection Item configured';
	}

	for (const item of currentConnectionClone.value.items) {
		const validation = secretsValidationRule(item.__secretName__);
		if (validation !== true) {
			return validation;
		}

		if (item.__mode__ === 'Variable') {
			if (!item.__variableName__) {
				return "Variable name can't be empty";
			}
			if (!item.__template__) {
				return "Template can't be empty";
			}
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
			system: 'KubernetesConnection',
		},
	};

	loading.value = true;

	try {
		const response = await towerAxios.get(
			`/connections?filter=${JSON.stringify(filter, undefined, '')}`,
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
					system: 'KubernetesConnection',
					enabled: true,
					url: el.url,
					items: items,
					namespace: el.namespace,
					token: el.token,
					connectionName: `${el.url} : ${el.namespace}`,
				});
			});
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting Kubernetes connections details',
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
			message: 'Error collecting Kubernetes connections details',
		});
	}

	loading.value = false;
};

/**
 * getAllTemplates
 */
const getAllTemplates = async () => {
	loading.value = true;

	try {
		const response = await towerAxios.get('/restConfigurations');
		if (response.status === 200) {
			allTemplates.value = response.data;
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting Kubernetes connections details',
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
		if (name) {
			name += '/';
		}
		if (item[base.name]) {
			name += `${item[base.name]}`;
		} else {
			name += 'ANY';
		}
	}

	return name;
};

/**
 * changeCurrentConnectionItemName
 */
const changeCurrentConnectionItemName = () => {
	if (currentConnectionItem.value) {
		currentConnectionItem.value.__name__ = extractItemName(
			currentConnectionItem.value,
		);
	}
};

/**
 * addConnectionItem
 */
const addConnectionItem = () => {
	if (currentConnectionClone.value) {
		currentConnectionItem.value = {
			__secretName__: null,
			__mode__: 'Full',
		};

		for (const base of basesSt.getBases) {
			currentConnectionItem.value[base.name] = null;
		}

		let connectionItemNumber = 0;
		while (
			currentConnectionClone.value.items.some((el) => {
				if (connectionItemNumber === 0) {
					return el.__name__ === 'New Connection item';
				} else {
					return el.__name__ === `New Connection item ${connectionItemNumber}`;
				}
			})
		) {
			connectionItemNumber++;
		}

		if (connectionItemNumber) {
			currentConnectionItem.value.__name__ = `New Connection item ${connectionItemNumber}`;
		} else {
			currentConnectionItem.value.__name__ = 'New Connection item';
		}

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
				__secretName__: el.__secretName__,
				__mode__: el.__mode__,
				__template__: el.__template__,
			};

			const names = Object.getOwnPropertyNames(el);
			for (const name of names) {
				item[name] = el[name];
			}

			if (item.__mode__ === 'Variable') {
				item.__template__ = allTemplates.value.find((variable) => {
					return variable._id === item.__template__;
				});
			}

			item.__name__ = extractItemName(item);

			items.push(item);
		});

		currentConnectionClone.value = {
			_id: currentConnection.value._id,
			system: 'KubernetesConnection',
			enabled: true,
			url: currentConnection.value.url,
			namespace: currentConnection.value.namespace,
			items: items,
			token: currentConnection.value.token,
			connectionName: currentConnection.value?.connectionName,
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
				`/connections/${currentConnection.value._id}`,
			);

			await getAllConnections();

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
		system: 'KubernetesConnection',
		namespace: '',
		enabled: true,
		url: '',
		items: [],
		token: '',
		connectionName: 'New connection',
	};

	currentConnectionUpdated();
};

/**
 * saveConnection
 */
const saveConnection = async () => {
	if (currentConnectionClone.value) {
		loading.value = true;

		currentConnectionClone.value?.items.map((el) => {
			if (el.__mode__ === 'Full') {
				el.__variableName__ = undefined;
				delete el.__variableName;
				el.__template__ = undefined;
				delete el.__template__;
			} else {
				el.__template__ = el.__template__._id;
			}

			return el;
		});

		try {
			const response = await towerAxios.patch(
				'/connections',
				currentConnectionClone.value,
			);
			if (response.status === 200) {
				await getAllConnections();

				const currentCon = allConnections.value.find((el) => {
					return el._id === response.data._id;
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
			'/connections/testConnection?type=KubernetesConnection',
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
			? ((e as AxiosError).response?.data as any)?.message
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

/**
 * onItemModeChange
 *
 * @param val
 */
const onItemModeChange = (val: string) => {
	if (val === 'Variable') {
		nextTick(() => {
			if (templateRef.value) {
				templateRef.value.validate();
			}
			if (variableNameRef.value) {
				variableNameRef.value.validate();
			}
		});
	}
};

/**
 * secretsValidationRule
 *
 * @param val
 */
const secretsValidationRule = (val: string) => {
	if (!val) {
		return true;
	}

	if (/^[0-9a-z\-]+$/.test(val)) {
		return true;
	}

	let currentVal = val;
	for (let base of basesSt.getBases) {
		currentVal = currentVal.replace(`{${base.name}}`, '');
	}

	if (/\{.*\}/.test(currentVal)) {
		return 'Invalid base name';
	}

	if (!/^[0-9a-z\-]+$/.test(currentVal)) {
		return 'Secret name can contain only numbers, lower case letters and dashes';
	}

	return true;
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
