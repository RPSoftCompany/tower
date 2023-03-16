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
					<template #counter
						><div :class="{ 'tw-text-negative': token.length !== 32 }">
							{{ token.length }}/32
						</div></template
					>
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
const initialize = async () => {
	if (token.value?.length === 32) {
		try {
			loading.value = true;

			await towerAxios.post(`/configurations/initialize?secret=${token.value}`);

			navigationSt.setInitialized(true);
			await router.push('/login');
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Invalid token',
			});
		}

		loading.value = false;
	}
};
</script>
