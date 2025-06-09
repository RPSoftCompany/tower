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
	<router-view v-slot="{ Component }">
		<q-dialog v-model="showDialog">
			<q-card style="width: 30rem">
				<q-card-section
					class="tw-text-sm tw-font-semibold tw-bg-warning tw-text-black"
				>
					<div>Unsaved changes</div>
				</q-card-section>
				<q-card-section>
					There are unsaved changes, are you sure you want to leave this page?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup flat label="Cancel" @click="preventNavigation" />
					<q-btn
						v-close-popup
						class="tw-text-warning"
						flat
						label="Ok"
						@click="followPath"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<transition
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<component :is="Component" />
		</transition>
	</router-view>
</template>

<script lang="ts" setup>
import { navigationStore } from 'stores/navigation';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

// Initialize the navigation store
const navigationSt = navigationStore();
// Initialize the Vue Router
const router = useRouter();

/**
 * Computed property to control the visibility of the "Unsaved changes" dialog.
 * It uses the `getShowDialog` getter from the navigation store.
 */
const showDialog = computed({
	get: () => {
		return navigationSt.getShowDialog;
	},
	set: () => {
		//ignore setter as it's controlled by the store
	},
});

/**
 * Handles proceeding with navigation when the user confirms leaving a page with unsaved changes.
 * Allows navigation, closes the dialog, and navigates to the intended destination.
 */
const followPath = () => {
	navigationSt.allowNavigation();
	navigationSt.closeNavigationDialog();
	router.push(navigationSt.getDestination);
};

/**
 * Handles preventing navigation when the user cancels leaving a page with unsaved changes.
 * Closes the "Unsaved changes" dialog.
 */
const preventNavigation = () => {
	navigationSt.closeNavigationDialog();
};
</script>
