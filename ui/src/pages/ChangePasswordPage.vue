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
				@submit="changePasswordMethod"
			>
				<q-input
					v-model="newPassword"
					:rules="[
						val => (val && val.length > 0) || 'Please provide your new password'
					]"
					class="tw-w-full tw-min-w-[10rem] tw-max-w-[25rem]"
					color="secondary"
					label="New password"
					lazy-rules
					type="password"
				/>
				<q-input
					v-model="newPasswordAgain"
					:debounce="300"
					:rules="[
						val =>
							(val && val.length > 0) ||
							'Please type in your new password again',
						val => val === newPassword || 'Passwords don\'t match'
					]"
					class="tw-w-full tw-min-w-[10rem] tw-max-w-[25rem]"
					color="secondary"
					label="Confirm Password"
					lazy-rules
					type="password"
				/>
				<q-btn
					:disable="
						!newPassword ||
							(!newPasswordAgain && newPasswordAgain !== newPassword)
					"
					:loading="loading"
					class="tw-mt-5 tw-bg-secondary"
					flat
					text-color="primary"
					type="submit"
				>
					<q-icon
						class="tw-mr-3"
						color="dark"
						name="sym_o_manage_accounts"
					></q-icon>
					<div>
						Change password
					</div>
				</q-btn>
			</q-form>
		</div>
	</q-page>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {towerAxios} from 'boot/axios';
import {useRouter} from 'vue-router';
import {useQuasar} from 'quasar';

const router = useRouter();
const $q = useQuasar();

const newPassword = ref('');
const newPasswordAgain = ref('');

const loading = ref(false);

const changePasswordMethod = async () => {
	const response = await towerAxios.post('/members/changeUserPassword', {
		newPassword: newPassword.value
	});

	if (response.status === 204) {
		$q.notify({
			color: 'positive',
			position: 'top',
			textColor: 'secondary',
			message: 'Password changed successfully'
		});
		await router.push({name: 'Login'});
	} else {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error changing password'
		});
	}
};
</script>

<style scoped></style>
