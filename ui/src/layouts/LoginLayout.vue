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
	<q-layout view="hHh lpR fFf" class="tw-flex tw-flex-row tw-h-screen">
		<q-page-container class="tw-w-full tw-h-screen">
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

onBeforeMount(() => {
	if ($q.localStorage.has('theme')) {
		$q.dark.set($q.localStorage.getItem('theme') === 'dark');
	} else {
		$q.dark.set(true);
	}
});
</script>
