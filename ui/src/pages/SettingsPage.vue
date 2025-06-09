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
		<div>
			<q-tabs
				v-model="groupTab"
				active-class="towerActiveFolderTab"
				active-color="secondary"
				animated
				class="tw-text-gray-500 towerFolderTabs"
				dense
				indicator-color="transparent"
				keep-alive
				narrow-indicator
			>
				<q-tab
					class="towerFolderTab"
					icon="sym_o_manage_accounts"
					label="Users and permissions"
					name="usersAndPermissions"
				/>
				<q-tab
					class="towerFolderTab"
					icon="sym_o_settings"
					label="Configuration settings"
					name="configurationSettings"
				/>
				<q-tab class="towerFolderTab" icon="sym_o_api" label="API" name="api" />
				<q-tab
					class="towerFolderTab"
					icon="sym_o_link"
					label="Connections"
					name="connections"
				/>
				<q-tab
					class="towerFolderTab"
					icon="sym_o_quick_reference"
					label="Audit"
					name="audit"
				/>
			</q-tabs>
			<q-tab-panels
				v-model="groupTab"
				animated
				class="tw-bg-darkPage tw-text-sm tw-overflow-visible"
				transition-next="jump-down"
				transition-prev="jump-down"
			>
				<q-tab-panel
					class="tw-p-0 tw-overflow-hidden"
					name="usersAndPermissions"
				>
					<q-tabs
						v-model="selectedNode"
						active-class="towerActiveFolderTab"
						active-color="secondary"
						animated
						class="tw-text-gray-500"
						dense
						indicator-color="transparent"
						inline-label
						keep-alive
						narrow-indicator
					>
						<q-tab
							v-for="tab of usersAndPermissions"
							:key="tab.label"
							:icon="tab.icon"
							:label="tab.label"
							:name="tab.url"
							class="towerSubFolderTab"
						/>
					</q-tabs>
				</q-tab-panel>
				<q-tab-panel
					class="tw-p-0 tw-overflow-hidden"
					name="configurationSettings"
				>
					<q-tabs
						v-model="selectedNode"
						active-class="towerActiveFolderTab"
						active-color="secondary"
						animated
						class="tw-text-gray-500 tw-overflow-hidden"
						dense
						indicator-color="secondary"
						inline-label
						keep-alive
						narrow-indicator
					>
						<q-tab
							v-for="tab of configurationSettings"
							:key="tab.label"
							:icon="tab.icon"
							:label="tab.label"
							:name="tab.url"
							class="towerSubFolderTab"
						/>
					</q-tabs>
				</q-tab-panel>
				<q-tab-panel class="tw-p-0 tw-overflow-hidden" name="api">
					<q-tabs
						v-model="selectedNode"
						active-class="towerActiveFolderTab"
						active-color="secondary"
						animated
						class="tw-text-gray-500"
						dense
						indicator-color="secondary"
						inline-label
						keep-alive
						narrow-indicator
					>
						<q-tab
							v-for="tab of api"
							:key="tab.label"
							:icon="tab.icon"
							:label="tab.label"
							:name="tab.url"
							class="towerSubFolderTab"
						/>
					</q-tabs>
				</q-tab-panel>
				<q-tab-panel class="tw-p-0 tw-overflow-hidden" name="audit">
					<q-tabs
						v-model="selectedNode"
						active-class="towerActiveFolderTab"
						active-color="secondary"
						animated
						class="tw-text-gray-500"
						dense
						indicator-color="secondary"
						inline-label
						keep-alive
						narrow-indicator
					>
						<q-tab
							v-for="tab of audit"
							:key="tab.label"
							:icon="tab.icon"
							:label="tab.label"
							:name="tab.url"
							class="towerSubFolderTab"
						/>
					</q-tabs>
				</q-tab-panel>
				<q-tab-panel class="tw-p-0 tw-overflow-hidden" name="connections">
					<q-tabs
						v-model="selectedNode"
						active-class="towerActiveFolderTab"
						active-color="secondary"
						animated
						class="tw-text-gray-500"
						dense
						indicator-color="secondary"
						inline-label
						keep-alive
						narrow-indicator
					>
						<q-tab
							v-for="tab of connections"
							:key="tab.label"
							:icon="tab.icon"
							:label="tab.label"
							:name="tab.url"
							class="towerSubFolderTab"
						/>
					</q-tabs>
				</q-tab-panel>
			</q-tab-panels>
		</div>
		<div class="tw-w-full tw-h-full tw-px-3 tw-pt-6">
			<router-view v-slot="{ Component }">
				<transition
					enter-active-class="animated fadeIn"
					leave-active-class="animated fadeOut"
					mode="out-in"
				>
					<component :is="Component" />
				</transition>
			</router-view>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { navigationStore } from 'stores/navigation';

//====================================================
// Interfaces
//====================================================
interface Tab {
	label: string;
	url: string;
	icon: string;
}

//====================================================
// Const
//====================================================
const route = useRoute();
const router = useRouter();
const navigationSt = navigationStore();

const baseUrl = '/settings';

const usersAndPermissions: Array<Tab> = [
	{
		label: 'Users',
		url: 'users',
		icon: 'sym_o_manage_accounts',
	},
	{
		label: 'Groups',
		url: 'groups',
		icon: 'sym_o_groups',
	},
	{
		label: 'Custom permissions',
		url: 'permissions',
		icon: 'sym_o_settings_account_box',
	},
];

const configurationSettings: Array<Tab> = [
	{
		label: 'Base models',
		url: 'models',
		icon: 'sym_o_settings_applications',
	},
	{
		label: 'Promotions',
		url: 'promotions',
		icon: 'sym_o_grade',
	},
];

const api: Array<Tab> = [
	{
		label: 'Hooks',
		url: 'hooks',
		icon: 'sym_o_webhook',
	},
	{
		label: 'Endpoints and templates',
		url: 'endpointsAndTemplates',
		icon: 'sym_o_http',
	},
];

const audit: Array<Tab> = [
	{
		label: 'Logs',
		url: 'logs',
		icon: 'sym_o_web_stories',
	},
];

const connections: Array<Tab> = [
	{
		label: 'LDAP',
		url: 'connections/ldap',
		icon: 'sym_o_person_search',
	},
	{
		label: 'Vault',
		url: 'connections/vault',
		icon: 'sym_o_sensors',
	},
	{
		label: 'SCP',
		url: 'connections/scp',
		icon: 'sym_o_lan',
	},
	{
		label: 'Secrets Manager',
		url: 'connections/aws',
		icon: 'mdi-aws',
	},
	{
		label: 'Key Vault',
		url: 'connections/azure',
		icon: 'mdi-microsoft-azure',
	},
	{
		label: 'Kubernetes',
		url: 'connections/kubernetes',
		icon: 'mdi-kubernetes',
	},
];

//====================================================
// onMounted
//====================================================
onMounted(() => {
	setTabs(route.path);
});

//====================================================
// Data
//====================================================
const selectedNode = ref('');
const groupTab = ref('');

//====================================================
// Methods
//====================================================
/**
 *
 */
const setTabs = (current: string) => {
	const value = current.replace(new RegExp(`^${baseUrl}/`), '');
	let found = usersAndPermissions.some((el) => {
		return el.url === value;
	});

	if (found) {
		selectedNode.value = value;
		groupTab.value = 'usersAndPermissions';
		return;
	}

	found = configurationSettings.some((el) => {
		return el.url === value;
	});

	if (found) {
		selectedNode.value = value;
		groupTab.value = 'configurationSettings';
		return;
	}

	found = api.some((el) => {
		return el.url === value;
	});

	if (found) {
		selectedNode.value = value;
		groupTab.value = 'api';
		return;
	}

	found = audit.some((el) => {
		return el.url === value;
	});

	if (found) {
		selectedNode.value = value;
		groupTab.value = 'audit';
		return;
	}

	found = connections.some((el) => {
		return el.url === value;
	});

	if (found) {
		selectedNode.value = value;
		groupTab.value = 'connections';
		return;
	}
};

//====================================================
// Watch
//====================================================
watch(
	() => route.path,
	(current) => {
		setTabs(current);
	},
);

watch(
	() => selectedNode.value,
	(current) => {
		if (current && route.path !== `${baseUrl}/${current}`) {
			router.push(`${baseUrl}/${current}`);
		}
	},
);

watch(
	() => groupTab.value,
	(current, previous) => {
		if (current && previous && current !== previous) {
			if (current === 'usersAndPermissions') {
				if (!usersAndPermissions.some((el) => el.url === selectedNode.value)) {
					selectedNode.value = usersAndPermissions[0].url;
				}
			} else if (current === 'configurationSettings') {
				if (
					!configurationSettings.some((el) => el.url === selectedNode.value)
				) {
					selectedNode.value = configurationSettings[0].url;
				}
			} else if (current === 'api') {
				if (!api.some((el) => el.url === selectedNode.value)) {
					selectedNode.value = api[0].url;
				}
			} else if (current === 'audit') {
				if (!audit.some((el) => el.url === selectedNode.value)) {
					selectedNode.value = audit[0].url;
				}
			} else if (current === 'connections') {
				if (!connections.some((el) => el.url === selectedNode.value)) {
					selectedNode.value = connections[0].url;
				}
			}
		}
	},
);

watch(
	() => navigationSt.getShowDialog,
	(current) => {
		if (!current) {
			// 	// navigation dialog closed (check selected nodes)
			if (!navigationSt.canNavigate) {
				setTabs(route.path);
			}
		}
	},
);
</script>

<style scoped>
.towerActiveFolderTab {
	background-color: var(--q-dark);
}

.towerFolderTabs {
	border-bottom: solid 1px var(--q-dark);
}

.towerFolderTab {
	border-radius: 0.375rem 0.375rem 0 0;
}

.towerSubFolderTab {
	border-radius: 0 0 0.375rem 0.375rem;
}
</style>
