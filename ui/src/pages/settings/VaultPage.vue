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
		<div class="tw-flex tw-gap-3" v-if="currentConfigurationClone">
			<div class="tw-flex-grow tw-mr-3">
				<q-checkbox
					v-model="currentConfigurationClone.enabled"
					label="Enable Vault connection"
					class="tw-mb-2"
				/>
				<q-input
					label="URL"
					v-model="currentConfigurationClone.url"
					color="secondary"
					:disable="!currentConfigurationClone.enabled"
				/>
				<q-input
					v-if="currentConfigurationClone.useGlobalToken"
					v-model="currentConfigurationClone.globalToken"
					color="secondary"
					label="Global token"
				/>
				<div v-else>
					<div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-mt-3">
						<tower-select
							v-model="currentBase"
							:options="basesSt.getBases"
							option-label="name"
							label="Base"
							@update:modelValue="getAllModels"
						/>
						<tower-select
							v-model="currentModel"
							:disable="!currentBase"
							:options="allModels"
							option-label="name"
							label="Model"
						/>
					</div>
					<div v-if="currentModel">
						<q-input v-model="currentToken" label="Token" color="secondary" />
					</div>
				</div>
			</div>
			<div class="tw-w-[20rem]">
				<div
					class="tw-mt-5 tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
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
						:disable="!currentConfigurationClone.enabled"
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
				<div
					class="tw-mt-3 tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
				>
					<div class="tw-text-xl tw-font-medium tw-mx-3">Global token</div>
					<div class="tw-text-gray-500 tw-mx-3">
						Turning on this setting will force Tower to connect to Vault using
						one token for all the connections
					</div>
					<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
					<q-toggle
						v-model="currentConfigurationClone.useGlobalToken"
						color="accent"
					/>
				</div>
			</div>
		</div>
		<div class="tw-flex-grow" />
		<save-panel :save-enabled="isDifferent" @save-clicked="save" />
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { towerAxios } from 'boot/axios';
import { basesStore } from 'stores/bases';
import TowerSelect from 'components/basic/towerSelect.vue';
import { Base } from 'components/bases/base';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import SavePanel from 'components/basic/savePanel.vue';
import { useQuasar } from 'quasar';
import { AxiosError } from 'axios';
import { navigationStore } from 'stores/navigation';

//====================================================
// Interfaces
//====================================================
interface Vault {
	enabled: boolean;
	system: string;
	tokens: Array<VaultToken>;
	useGlobalToken: boolean;
	globalToken?: string;
	url: string;
	id: string;
}

interface VaultToken {
	base: string;
	name: string;
	token: string;
}

//====================================================
// Const
//====================================================
const $q = useQuasar();
const basesSt = basesStore();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const currentConfiguration: Ref<Vault | null> = ref(null);
const currentConfigurationClone: Ref<Vault | null> = ref(null);

const currentBase: Ref<Base | null> = ref(null);

const allModels: Ref<Array<ConfigurationModel>> = ref([]);
const currentModel: Ref<ConfigurationModel | null> = ref(null);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getConfigurationData();
});

//====================================================
// Computed
//====================================================
const currentToken = computed({
	get: () => {
		if (!currentModel.value || !currentConfigurationClone.value) {
			return undefined;
		}

		const token = currentConfigurationClone.value.tokens.find((el) => {
			return (
				el.name === currentModel.value?.name &&
				el.base === currentBase.value?.name
			);
		});

		if (token) {
			return token.token;
		}

		return null;
	},
	set: (value) => {
		if (
			!currentModel.value ||
			!currentConfigurationClone.value ||
			!currentBase.value
		) {
			return;
		}

		const index = currentConfigurationClone.value.tokens.findIndex((el) => {
			return (
				el.name === currentModel.value?.name &&
				el.base === currentBase.value?.name
			);
		});

		if (index >= 0) {
			currentConfigurationClone.value.tokens[index] = {
				name: currentModel.value.name,
				token: value as unknown as string,
				base: currentBase.value.name,
			};
		} else {
			currentConfigurationClone.value.tokens.push({
				name: currentModel.value.name,
				token: value as unknown as string,
				base: currentBase.value.name,
			});
		}
	},
});

/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (!currentConfigurationClone.value || !currentConfiguration.value) {
		return false;
	}

	if (
		currentConfigurationClone.value?.tokens.length !==
		currentConfiguration.value?.tokens.length
	) {
		return true;
	}

	if (
		currentConfigurationClone.value?.enabled !==
			currentConfiguration.value?.enabled ||
		currentConfigurationClone.value?.useGlobalToken !==
			currentConfiguration.value?.useGlobalToken ||
		currentConfigurationClone.value?.url !== currentConfiguration.value?.url
	) {
		return true;
	}

	return currentConfigurationClone.value?.tokens.some((el) => {
		return !currentConfiguration.value?.tokens.some((token) => {
			return (
				token.name === el.name &&
				token.token === el.token &&
				token.base === token.base
			);
		});
	});
});

//====================================================
// Methods
//====================================================
/**
 * getConfigurationData
 */
const getConfigurationData = async () => {
	const filter = {
		where: {
			system: 'Vault',
		},
	};

	const response = await towerAxios.get(
		`/connections?filter=${JSON.stringify(filter, undefined, '')}`
	);

	if (response.status === 200) {
		currentConfiguration.value = response.data[0];
		if (currentConfiguration.value) {
			currentConfigurationClone.value = {
				url: currentConfiguration.value?.url,
				enabled: currentConfiguration.value?.enabled,
				globalToken: currentConfiguration.value?.globalToken,
				system: currentConfiguration.value?.system,
				tokens: [...currentConfiguration.value?.tokens],
				id: currentConfiguration.value?.id,
				useGlobalToken: currentConfiguration.value?.useGlobalToken,
			};
		}
	}
};

/**
 * getAllModels
 */
const getAllModels = async () => {
	allModels.value = [];
	currentModel.value = null;

	if (!currentBase.value) {
		return;
	}

	const filter = {
		where: {
			base: currentBase.value.name,
		},
		order: 'name ASC',
	};

	const response = await towerAxios.get(
		`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`
	);

	if (response.status === 200) {
		allModels.value = response.data;
	}
};

/**
 * testConnection
 */
const testConnection = async () => {
	if (!currentConfigurationClone.value) {
		return;
	}

	try {
		const response = await towerAxios.post(
			'/connections/testConnection?type=Vault',
			currentConfigurationClone.value
		);

		if (response.status === 200) {
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
};

/**
 * save
 */
const save = async () => {
	if (!currentConfigurationClone.value) {
		return;
	}

	try {
		await towerAxios.patch('/connections', currentConfigurationClone.value);

		await getConfigurationData();

		$q.notify({
			color: 'positive',
			position: 'top',
			textColor: 'secondary',
			message: 'Connection details saved successfully',
		});
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error saving connection details',
		});
	}
};

//====================================================
// Watch
//====================================================
watch(
	() => isDifferent.value,
	(current) => {
		if (current) {
			navigationSt.preventNavigation();
		} else {
			navigationSt.allowNavigation();
		}
	}
);
</script>

<style scoped></style>
