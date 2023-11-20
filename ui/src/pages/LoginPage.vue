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
	<q-page class="row items-center justify-evenly">
		<div
			class="tw-grid tw-grid-cols-1 tw-gap-1 tw-w-1/5 tw-justify-items-center animate__animated animate__bounce"
		>
			<q-img
				alt="Tower configuration server logo"
				class="tw-h-40 tw-w-40 tw-mb-10 tw-min-w-[10rem]"
				spinner-color="secondary"
				src="img/tower.png"
			/>
			<q-form
				autofocus
				class="tw-w-full tw-grid tw-grid-cols-1 tw-gap-1 tw-justify-items-center"
				greedy
				@submit="loginMethod"
			>
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
			</q-form>
		</div>
	</q-page>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';
import { towerAxios as axios } from 'boot/axios';
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

//====================================================
// Mounted
//====================================================
onMounted(() => {
	if (userSt) {
		userSt.$reset();
	}
});

//====================================================
// Methods
//====================================================

/**
 * loginMethod
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
					response.data.user.type === 'ldap'
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
					response.data.user.type === 'ldap'
				);
			}
		}
	} catch (e) {
		let message = 'Invalid username or password';

		if (e instanceof AxiosError) {
			if (e.response && e.response.status && e.response.status === 403) {
				message = 'User is blocked';
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
</script>
