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
				@submit="initialize"
			>
				<q-input
					v-model="token"
					class="tw-w-full tw-min-w-[10rem] tw-max-w-[25rem]"
					color="secondary"
					label="Encryption key"
					lazy-rules
					bottom-slots
				>
					<template #counter>
						<div :class="{ 'tw-text-negative': token.length !== 32 }">
							{{ token.length }}/32
						</div>
					</template>
				</q-input>
				<q-btn
					:loading="loading"
					class="tw-mt-5 tw-bg-secondary"
					:disable="token?.length !== 32"
					flat
					text-color="primary"
					type="submit"
				>
					<q-icon class="tw-mr-3" color="dark" name="sym_o_key"></q-icon>
					<div>Set encryption key</div>
				</q-btn>
			</q-form>
		</div>
	</q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { towerAxios } from 'boot/axios';
import { navigationStore } from 'stores/navigation';
import { AxiosError } from 'axios';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const router = useRouter();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const token = ref('');
const loading = ref(false);

//====================================================
// Methods
//====================================================
/**
 * Asynchronously initializes the tower configuration based on the provided secret token.
 *
 * This function verifies the correctness of the `token` by ensuring it is 32 characters long
 * before proceeding with the initialization process. It makes a POST request to
 * initialize the tower configuration using the provided secret token. If the initialization
 * is successful, the application navigates to the login page and updates the state to mark
 * the initialization as complete. If the tower is already initialized, it handles the scenario
 * and navigates to the login page. In case of errors, a notification is displayed to the user.
 *
 * The initialization process involves:
 * - Validating the `token`.
 * - Attempting to initialize tower configurations via an API call.
 * - Handling specific error responses from the server.
 * - Navigation control based on initialization status.
 *
 * @async
 * @function
 * @throws Will notify the user of an error message if initialization fails or an unexpected error occurs.
 * @note This function relies on several external modules and functions, including `towerAxios`, `router`,
 * `navigationSt` state management, and the Quasar Framework notification service `$q.notify`.
 */
const initialize = async () => {
	if (token.value?.length === 32) {
		try {
			loading.value = true;

			await towerAxios.post(`/configurations/initialize?secret=${token.value}`);

			navigationSt.setInitialized(true);
			await router.push('/login');
		} catch (e) {
			const message = (e as AxiosError<{ message: string }>).response?.data
				?.message;

			if (message === 'Tower has already been initialized') {
				navigationSt.setInitialized(true);
				await router.push('/login');
			} else {
				$q.notify({
					color: 'negative',
					position: 'top',
					textColor: 'secondary',
					icon: 'sym_o_error',
					message:
						(e as AxiosError<{ message: string }>).response?.data?.message ??
						'Unknown error',
				});
			}
		}

		loading.value = false;
	}
};
</script>
