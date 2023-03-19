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
	<q-btn
		class="tw-relative tw-cursor-pointer"
		flat
		padding="0.5rem"
		@click="localToggle = !localToggle"
	>
		<q-icon :name="icon" :size="size" />
		<q-icon
			:color="localToggle ? 'positive' : 'negative'"
			:name="localToggle ? 'sym_o_done' : 'sym_o_close'"
			class="tw-absolute yesNoIcon heavy"
			size="xs"
		/>
		<slot />
	</q-btn>
</template>

<script lang="ts" setup>
//====================================================
// Props
//====================================================
import { computed } from 'vue';

const props = defineProps<{
	icon: string;
	toggled: boolean;
	size?: string;
}>();

//====================================================
// Emits
//====================================================
const emits = defineEmits(['update:toggled']);

//====================================================
// Computed
//====================================================
const localToggle = computed({
	get: () => props.toggled,
	set: value => emits('update:toggled', value)
});
</script>

<style scoped>
.yesNoIcon {
	left: 1.25rem;
	top: 1.25rem;
	z-index: 1;
}
</style>
