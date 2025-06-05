<template>
	<div></div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { towerAxios } from 'boot/axios';
import { userStore } from 'stores/user';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const userSt = userStore();
const router = useRouter();
const $q = useQuasar();

onBeforeMount(async () => {
	if (userSt) {
		userSt.$reset();
	}

	try {
		const userData = await towerAxios.get('/members/getUserData', {
			headers: {
				Authorization: $q.cookies.get('accessToken'),
			},
		});

		if (userData.status === 200) {
			userSt.setUserDetails(
				$q.cookies.get('accessToken'),
				userData.data.display ? userData.data.display : userData.data.username,
				userData.data.roles,
				true,
			);
		}

		await router.push('/configuration');
	} catch (e) {
		await router.push('/insufficientPermissions');
	}
});
</script>

<style scoped></style>
