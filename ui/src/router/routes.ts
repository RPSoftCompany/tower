/*
 * Copyright RPSoft 2019,2023. All Rights Reserved.
 * This file is part of RPSoft Tower.
 *
 * Tower is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tower is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
 */

import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/LoginLayout.vue'),
		children: [
			{
				name: 'Login',
				path: 'login',
				component: () => import('pages/LoginPage.vue'),
			},
			{
				name: 'SsoLogin',
				path: 'sso/callback',
				component: () => import('pages/SsoLogin.vue'),
			},
			{
				name: 'ChangePassword',
				path: 'changePassword',
				component: () => import('pages/ChangePasswordPage.vue'),
			},
			{
				name: 'Initialization',
				path: 'initialization',
				component: () => import('pages/initializationPage.vue'),
			},
		],
	},
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		meta: { requiresAuth: true },
		children: [
			{
				name: 'Configuration',
				path: 'configuration',
				component: () => import('pages/ConfigurationPage.vue'),
			},
			{
				name: 'Configuration',
				path: 'configuration/:configurationPath(.*)?',
				component: () => import('pages/ConfigurationPage.vue'),
			},
			{
				name: 'Archive',
				path: 'archive',
				component: () => import('pages/ArchivePage.vue'),
			},
			{
				name: 'TimeArchive',
				path: 'timeArchive',
				component: () => import('pages/TimeArchivePage.vue'),
			},
			{
				name: 'Bases',
				path: 'bases/:base',
				component: () => import('pages/BasesPage.vue'),
			},
			{
				name: 'FindVariable',
				path: 'findVariable',
				component: () => import('pages/FindVariablePage.vue'),
			},
			{
				name: 'Settings',
				path: 'settings',
				redirect: { name: 'Users' },
				meta: { requiresAuth: true, adminPrivileges: true },
				component: () => import('pages/SettingsPage.vue'),
				children: [
					{
						name: 'Users',
						path: 'users',
						component: () => import('pages/settings/UsersPage.vue'),
					},
					{
						name: 'Groups',
						path: 'groups',
						component: () => import('pages/settings/GroupsPage.vue'),
					},
					{
						name: 'Permissions',
						path: 'permissions',
						component: () => import('pages/settings/PermissionsPage.vue'),
					},
					{
						name: 'LDAP',
						path: 'connections/ldap',
						component: () => import('pages/settings/LdapPage.vue'),
					},
					{
						name: 'Vault',
						path: 'connections/vault',
						component: () => import('pages/settings/VaultPage.vue'),
					},
					{
						name: 'SCP',
						path: 'connections/scp',
						component: () => import('pages/settings/SCPPage.vue'),
					},
					{
						name: 'AWS',
						path: 'connections/aws',
						component: () => import('pages/settings/AWSPage.vue'),
					},
					{
						name: 'Azure',
						path: 'connections/azure',
						component: () => import('pages/settings/AzurePage.vue'),
					},
					{
						name: 'Kubernetes',
						path: 'connections/kubernetes',
						component: () => import('pages/settings/KubernetesPage.vue'),
					},
					{
						name: 'BaseModels',
						path: 'models',
						component: () => import('pages/settings/BaseModelsPage.vue'),
					},
					{
						name: 'Promotions',
						path: 'promotions',
						component: () => import('pages/settings/PromotionsPage.vue'),
					},
					{
						name: 'Hooks',
						path: 'hooks',
						component: () => import('pages/settings/HooksPage.vue'),
					},
					{
						name: 'EndpointsAndTemplates',
						path: 'endpointsAndTemplates',
						component: () =>
							import('pages/settings/EndpointsAndTemplatesPage.vue'),
					},
					{
						name: 'Logs',
						path: 'logs',
						component: () => import('pages/settings/LogsPage.vue'),
					},
				],
			},
		],
	},

	{
		path: '/insufficientPermissions',
		name: 'InsufficientPermissions',
		component: () => import('pages/InsufficientPermissionsPage.vue'),
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue'),
	},
];

export default routes;
