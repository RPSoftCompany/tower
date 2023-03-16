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
						val => (val && val.length > 0) || 'Please type your username'
					]"
					class="tw-w-full tw-min-w-[10rem] tw-max-w-[25rem]"
					color="secondary"
					label="Username"
					lazy-rules
				/>
				<q-input
					v-model="password"
					:rules="[
						val => (val && val.length > 0) || 'Please type your password'
					]"
					class="tw-w-full tw-min-w-[10rem] tw-max-w-[25rem]"
					color="secondary"
					label="Password"
					lazy-rules
					type="password"
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
					<div>
						Login
					</div>
				</q-btn>
			</q-form>
		</div>
	</q-page>
</template>

<script lang="ts" setup>
import {onMounted, Ref, ref} from 'vue';
import {towerAxios as axios} from 'boot/axios';
import {useQuasar} from 'quasar';
import {ionWarning} from '@quasar/extras/ionicons-v6';
import {userStore} from 'stores/user';
import {useRouter} from 'vue-router';
import {AxiosError} from 'axios';

const $q = useQuasar();
const router = useRouter();

//====================================================
// Data
//====================================================
const login: Ref<null | string> = ref(null);
const password: Ref<null | string> = ref(null);
const loading = ref(false);
const userSt = userStore();

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
			password: password.value
		});

		if (response.status === 200 && response.data) {
			const responseUserRoles = await axios.get('/members/getUserRoles', {
				headers: {
					Authorization: response.data.id
				}
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

				if (response.data.user.newUser) {
					await router.push({name: 'ChangePassword'});
				} else {
					await router.push({name: 'Configuration'});
				}
			}
		}
	} catch (e) {
		let message = 'Invalid username or password'

		if (e instanceof AxiosError) {
			if (e.response && e.response.status && e.response.status === 403) {
				message = 'User is blocked'
			}
		}
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: ionWarning,
			message: message
		});
	}

	loading.value = false;
};
</script>