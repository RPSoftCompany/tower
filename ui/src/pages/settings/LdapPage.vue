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
		<q-dialog v-model="testConnectionDialog">
			<q-card style="width: 30rem">
				<q-card-section
					class="tw-text-sm tw-font-semibold tw-text-black"
					:class="{
						'tw-bg-accent': testConnectionError,
						'tw-bg-positive': !testConnectionError,
					}"
					>{{
						testConnectionError
							? 'Connection error'
							: 'Connection established successfully'
					}}
				</q-card-section>
				<q-card-section>{{ testConnectionMessage }}</q-card-section>

				<q-card-actions align="right">
					<q-btn
						v-close-popup
						:class="{
							'tw-text-accent': testConnectionError,
							'tw-text-positive': !testConnectionError,
						}"
						flat
						label="OK"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div class="tw-flex tw-gap-3">
			<div class="tw-flex-grow tw-mr-3">
				<q-checkbox
					v-model="currentConfiguration.enabled"
					label="Enable LDAP connection"
					class="tw-mb-2"
				/>
				<q-input
					:disable="!currentConfiguration.enabled"
					v-model="currentConfiguration.url"
					label="URL"
					hint="eg. 'ldap://127.0.0.1:389'"
					color="secondary"
					hide-hint
				/>
				<q-input
					:disable="!currentConfiguration.enabled"
					v-model="currentConfiguration.searchBase"
					label="Base DN"
					hint="eq. 'dc=example,dc=org'"
					hide-hint
					color="secondary"
				/>
				<div class="tw-grid tw-grid-cols-2 tw-gap-3">
					<q-input
						:disable="!currentConfiguration.enabled"
						v-model="currentConfiguration.bindDN"
						label="User DN"
						hint="eq. 'cn=admin,dc=example,dc=org'"
						hide-hint
						color="secondary"
					/>
					<q-input
						:disable="!currentConfiguration.enabled"
						v-model="currentConfiguration.bindCredentials"
						type="password"
						label="User DN password"
						color="secondary"
					/>
				</div>
				<div class="tw-grid tw-grid-cols-2 tw-gap-3">
					<q-input
						:disable="!currentConfiguration.enabled"
						v-model="currentConfiguration.usernameAttribute"
						label="Username attribute"
						hint="eq. 'uid'"
						hide-hint
						color="secondary"
					/>
					<q-input
						:disable="!currentConfiguration.enabled"
						v-model="currentConfiguration.displayAttribute"
						label="Display attribute"
						hint="eq. 'cn'"
						hide-hint
						color="secondary"
					/>
				</div>
				<tower-select
					:disable="!currentConfiguration.enabled"
					v-model="currentConfiguration.defaultGroups"
					label="Default LDAP user group"
					:options="allGroups"
					multiple
					use-chips
				>
					<template #option="scope">
						<q-item v-bind="scope.itemProps">
							<q-item-section avatar>
								<q-icon
									:name="
										scope.selected
											? 'sym_o_check_box'
											: 'sym_o_check_box_outline_blank'
									"
									class="heavy"
									size="sm"
								/>
							</q-item-section>
							<q-item-section>
								<q-item-label>{{ scope.opt }}</q-item-label>
							</q-item-section>
						</q-item>
					</template>
					<template v-slot:selected>
						<template
							v-for="group of currentConfiguration?.defaultGroups"
							:key="group"
						>
							<template
								v-if="savedConfiguration?.defaultGroups.includes(group)"
							>
								<q-chip
									dense
									color="dark"
									text-color="secondary"
									class="tw-px-3 tw-border tw-border-gray-500"
									>{{ group }}
								</q-chip>
							</template>
							<template v-else>
								<q-chip
									dense
									color="secondary"
									text-color="dark"
									class="tw-px-3 tw-border tw-border-gray-500"
									>{{ group }}
								</q-chip>
							</template>
						</template>
					</template>
				</tower-select>
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
						@click="testConnection"
						:loading="testingConnection"
						:disable="testingConnection || !currentConfiguration.enabled"
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
		<div class="tw-flex-grow" />
		<div>
			<save-panel
				v-if="currentConfiguration"
				:save-enabled="isDifferent"
				:loading="loading"
				@save-clicked="saveConnection"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { towerAxios } from 'boot/axios';
import { Group } from 'pages/settings/types/group';
import TowerSelect from 'components/basic/towerSelect.vue';
import { AxiosError } from 'axios';
import SavePanel from 'components/basic/savePanel.vue';
import { useQuasar } from 'quasar';
import { navigationStore } from 'stores/navigation';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const navigationSt = navigationStore();

//====================================================
// Interfaces
//====================================================
interface LDAP {
	enabled: boolean;
	system: string;
	bindCredentials: string;
	bindDN: string;
	displayAttribute: string;
	searchBase: string;
	url: string;
	usernameAttribute: string;
	defaultGroups: Array<string>;
	_id: string;
}

//====================================================
// Data
//====================================================
const currentConfiguration: Ref<LDAP> = ref({
	enabled: false,
	system: '',
	bindCredentials: '',
	bindDN: '',
	displayAttribute: '',
	searchBase: '',
	url: '',
	usernameAttribute: '',
	defaultGroups: [],
	_id: '',
});

const savedConfiguration: Ref<LDAP | null> = ref(null);

const allGroups: Ref<Array<string>> = ref([]);

const testConnectionDialog = ref(false);
const testConnectionMessage = ref('');
const testConnectionError = ref(false);
const testingConnection = ref(false);

const loading = ref(false);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getCurrentLDAPConfiguration();
});

//====================================================
// Computed
//====================================================
const isDifferent = computed(() => {
	if (!currentConfiguration.value || !savedConfiguration.value) {
		return false;
	}

	if (
		currentConfiguration.value.enabled !== savedConfiguration.value.enabled ||
		currentConfiguration.value.url !== savedConfiguration.value.url ||
		currentConfiguration.value.system !== savedConfiguration.value.system ||
		currentConfiguration.value.bindDN !== savedConfiguration.value.bindDN ||
		currentConfiguration.value.searchBase !==
			savedConfiguration.value.searchBase ||
		currentConfiguration.value.bindCredentials !==
			savedConfiguration.value.bindCredentials ||
		currentConfiguration.value.usernameAttribute !==
			savedConfiguration.value.usernameAttribute ||
		currentConfiguration.value.displayAttribute !==
			savedConfiguration.value.displayAttribute
	) {
		return true;
	}

	if (
		currentConfiguration.value.defaultGroups.length !==
		savedConfiguration.value.defaultGroups.length
	) {
		return true;
	}

	if (currentConfiguration.value.defaultGroups.length === 0) {
		return false;
	}

	return !currentConfiguration.value.defaultGroups.some((group) => {
		return savedConfiguration.value?.defaultGroups.some((el) => {
			return el === group;
		});
	});
});

//====================================================
// Methods
//====================================================
/**
 * getCurrentLDAPConfiguration
 */
const getCurrentLDAPConfiguration = async () => {
	const filter = {
		where: {
			system: 'LDAP',
		},
	};

	try {
		let response = await towerAxios.get(
			`/connections?filter=${JSON.stringify(filter, undefined, '')}`
		);
		if (response.status === 200) {
			savedConfiguration.value = {
				defaultGroups: response.data[0].defaultGroups
					? [...response.data[0].defaultGroups]
					: [],
				displayAttribute: response.data[0].displayAttribute
					? response.data[0].displayAttribute
					: null,
				url: response.data[0].url ? response.data[0].url : null,
				usernameAttribute: response.data[0].usernameAttribute
					? response.data[0].usernameAttribute
					: null,
				bindDN: response.data[0].bindDN ? response.data[0].bindDN : null,
				bindCredentials: response.data[0].bindCredentials
					? response.data[0].bindCredentials
					: null,
				searchBase: response.data[0].searchBase
					? response.data[0].searchBase
					: null,
				enabled: response.data[0].enabled,
				system: 'LDAP',
				_id: response.data[0]._id ? response.data[0]._id : null,
			};
			currentConfiguration.value = {
				defaultGroups: response.data[0].defaultGroups
					? [...response.data[0].defaultGroups]
					: [],
				displayAttribute: response.data[0].displayAttribute
					? response.data[0].displayAttribute
					: null,
				url: response.data[0].url ? response.data[0].url : null,
				usernameAttribute: response.data[0].usernameAttribute
					? response.data[0].usernameAttribute
					: null,
				bindDN: response.data[0].bindDN ? response.data[0].bindDN : null,
				bindCredentials: response.data[0].bindCredentials
					? response.data[0].bindCredentials
					: null,
				searchBase: response.data[0].searchBase
					? response.data[0].searchBase
					: null,
				enabled: response.data[0].enabled,
				system: 'LDAP',
				_id: response.data[0]._id ? response.data[0]._id : null,
			};
		}

		response = await towerAxios.get('/groups');
		if (response.status === 200) {
			allGroups.value = [];
			response.data.forEach((el: Group) => {
				allGroups.value.push(el.name);
			});
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting LDAP data',
		});
	}
};

/**
 * testConnection
 */
const testConnection = async () => {
	testingConnection.value = true;

	try {
		const response = await towerAxios.post(
			'/connections/testConnection?type=LDAP',
			currentConfiguration.value
		);

		if (response.status === 200) {
			testConnectionMessage.value = 'Connection established successfully';
			testConnectionError.value = false;
		}
	} catch (e) {
		testConnectionMessage.value = ((e as AxiosError).response?.data as any)
			?.error?.message
			? ((e as AxiosError).response?.data as any)?.error?.message
			: (e as AxiosError).message;
		testConnectionError.value = true;
	}

	testingConnection.value = false;
	testConnectionDialog.value = true;
};

/**
 * saveConnection
 */
const saveConnection = async () => {
	loading.value = true;

	try {
		await towerAxios.patch('/connections', currentConfiguration.value);
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error saving connection details',
		});

		loading.value = false;

		return;
	}

	savedConfiguration.value = {
		defaultGroups: currentConfiguration.value.defaultGroups,
		displayAttribute: currentConfiguration.value.displayAttribute,
		url: currentConfiguration.value.url,
		usernameAttribute: currentConfiguration.value.usernameAttribute,
		bindDN: currentConfiguration.value.bindDN,
		bindCredentials: currentConfiguration.value.bindCredentials,
		searchBase: currentConfiguration.value.searchBase,
		enabled: currentConfiguration.value.enabled,
		system: 'LDAP',
		_id: currentConfiguration.value._id,
	};

	$q.notify({
		color: 'positive',
		position: 'top',
		textColor: 'secondary',
		message: 'Connection details saved successfully',
	});

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
