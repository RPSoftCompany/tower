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
	<q-card
		class="tw-bg-darkPage tw-text-secondary tw-gap-3 row tw-px-4 tw-pb-3 tw-pt-1 tw-rounded"
		flat
	>
		<div
			class="tw-w-full tw-grid tw-grid-cols-3 tw-gap-3 tw-content-center tw-place-items-center"
		>
			<q-btn
				v-if="!hasErrors"
				:class="{
					'tw-bg-dark': !saveEnabled,
				}"
				:disable="!saveEnabled"
				:loading="loading"
				class="tw-bg-secondary tw-col-start-2"
				color="dark"
				flat
				@click="emit('saveClicked')"
			>
				<q-icon
					:color="saveEnabled ? 'dark' : 'secondary'"
					class="tw-mr-3"
					name="sym_o_save"
				></q-icon>
				<div
					:class="{
						'tw-text-secondary': !saveEnabled,
						'tw-text-dark': saveEnabled,
					}"
				>
					Save changes
				</div>
			</q-btn>
			<div v-else class="tw-col-start-2">
				<div class="tw-italic tw-text-lg tw-text-negative tw-text-center">
					There are errors in your configuration, please fix them
				</div>
				<div
					class="tw-text-center tw-italic tw-text-xs tw-text-negative tw-opacity-80"
				>
					{{ errorText ? errorText : 'All the errors should be marked red' }}
				</div>
			</div>
		</div>
	</q-card>
</template>

<script lang="ts" setup>
//====================================================
// Props
//====================================================
defineProps<{
	saveEnabled: boolean;
	hasErrors?: boolean;
	errorText?: string;
	loading?: boolean;
}>();
//====================================================
// Emits
//====================================================
const emit = defineEmits(['saveClicked']);
</script>

<style scoped></style>
