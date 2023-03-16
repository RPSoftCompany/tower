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

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue'),
	},
];

export default routes;
