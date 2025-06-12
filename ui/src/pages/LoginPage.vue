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
	<q-page class="row items-center justify-center">
		<div
			class="tw-grid tw-grid-cols-2 tw-gap-1 tw-justify-items-center animate__animated animate__bounce"
		>
			<q-img
				alt="Tower configuration server logo"
				class="tw-h-80 tw-w-80 tw-mr-20 tw-min-w-[10rem]"
				spinner-color="secondary"
				src="img/tower.png"
			/>
			<q-form
				autofocus
				class="tw-w-full tw-grid tw-grid-cols-1 tw-gap-1 tw-justify-items-center tw-items-center"
				greedy
				@submit="loginMethod"
			>
				<div class="tw-w-full tw-grid tw-justify-items-center">
					<q-input
						v-model="login"
						:rules="[
							(val) => (val && val.length > 0) || 'Please type your username',
						]"
						class="tw-w-full tw-min-w-[10rem] tw-max-w-[25rem]"
						color="secondary"
						label="Username"
						autocomplete="towerUsername"
						lazy-rules
					/>
					<q-input
						v-model="password"
						:rules="[
							(val) => (val && val.length > 0) || 'Please type your password',
						]"
						class="tw-w-full tw-min-w-[10rem] tw-max-w-[25rem]"
						color="secondary"
						label="Password"
						lazy-rules
						type="password"
						autocomplete="towerPassword"
					/>
					<q-btn
						:disable="!login || !password"
						:loading="loading"
						class="tw-mt-5 tw-bg-secondary"
						flat
						text-color="primary"
						type="submit"
					>
						<q-icon class="tw-mr-3" color="dark" name="sym_o_login"></q-icon>
						<div>Login</div>
					</q-btn>
				</div>
				<q-separator class="tw-bg-secondary tw-w-full"></q-separator>
				<q-btn :disable="!isSsoAvailable" outline @click="redirectToSSO"
					>SSO Login</q-btn
				>
			</q-form>
		</div>
	</q-page>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from 'vue';
import { towerAxios, towerAxios as axios } from 'boot/axios';
import { useQuasar } from 'quasar';
import { ionWarning } from '@quasar/extras/ionicons-v6';
import { userStore } from 'stores/user';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { navigationStore } from 'stores/navigation';

const $q = useQuasar();
const router = useRouter();

//====================================================
// Data
//====================================================
const login: Ref<null | string> = ref(null);
const password: Ref<null | string> = ref(null);
const loading = ref(false);
const userSt = userStore();
const navigationSt = navigationStore();
const isSsoAvailable = ref(false);

//====================================================
// Mounted
//====================================================
onMounted(async () => {
	await mounted();
});

//====================================================
// Methods
//====================================================

/**
 * Initializes the login page by resetting user state, removing access token cookie,
 * and checking SSO availability. This method is called when the component is mounted
 * and when the route changes.
 */
const mounted = async () => {
	if (userSt) {
		userSt.$reset();
	}
	if ($q.cookies.has('accessToken')) {
		$q.cookies.remove('accessToken');
	}

	try {
		const isSsoAvailableResponse = await towerAxios.get('/sso/available');
		if (isSsoAvailableResponse.status === 200) {
			isSsoAvailable.value = isSsoAvailableResponse.data;
		}
	} catch (e) {
		// IGNORE
	}
};

/**
 * Handles user authentication by sending login credentials to the server.
 * If successful, it sets user details and roles in the store.
 * For new users, redirects to the password change page.
 * For existing users, redirects to either stored destination or configuration page.
 * Displays error notification for invalid credentials or blocked users.
 */
const loginMethod = async () => {
	try {
		loading.value = true;
		const response = await axios.post('/members/login?include=user', {
			username: login.value,
			password: password.value,
		});

		if (response.status === 200 && response.data) {
			if (response.data.user.newUser) {
				userSt.setUserDetails(
					response.data.id,
					response.data.user.display
						? response.data.user.display
						: response.data.user.username,
					[],
					response.data.user.type === 'ldap',
				);
				navigationSt.allowNavigation();
				await router.push({ name: 'ChangePassword' });
				return;
			}
		}

		if (response.status === 200 && response.data) {
			const responseUserRoles = await axios.get('/members/getUserRoles', {
				headers: {
					Authorization: response.data.id,
				},
			});
			if (responseUserRoles.status === 200 && responseUserRoles.data) {
				userSt.setUserDetails(
					response.data.id,
					response.data.user.display
						? response.data.user.display
						: response.data.user.username,
					responseUserRoles.data,
					response.data.user.type === 'ldap',
				);
			}
		}
	} catch (e) {
		let message = 'Invalid username or password';

		if (e instanceof AxiosError) {
			if (e.response && e.response.status) {
				message = e.response.data.message;
			}
		}
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: ionWarning,
			message: message,
		});

		loading.value = false;

		return;
	}

	navigationSt.allowNavigation();
	if (!navigationSt.getDestination) {
		await router.push({ name: 'Configuration' });
	} else {
		await router.push(navigationSt.getDestination);
	}

	loading.value = false;
};

/**
 * Redirects user to SSO login page.
 * Uses different URLs based on development or production environment.
 */
const redirectToSSO = () => {
	if (process.env.NODE_ENV === 'development') {
		location.href = 'http://localhost:3000/sso/login';
	} else {
		location.href = '/sso/login';
	}
};

/**
 * Watches for route changes and reinitializes the login page
 * by calling the mounted method when the route changes
 */
watch(
	() => router.currentRoute,
	async () => {
		await mounted();
	},
	{
		immediate: true,
	},
);
</script>
