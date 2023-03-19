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
	<q-layout class="tw-flex tw-flex-row tw-h-full" view="hHh lpR fFf">
		<div class="tw-w-20 2xl:tw-w-40 tw-h-screen tw-flex tw-flex-col tw-pb-2">
			<img
				alt="Tower configuration server"
				class="tw-w-full 2xl:tw-px-5 tw-px-3 tw-pt-5 2xl:tw-mb-9 tw-mb-5"
				height="384"
				src="../assets/tower.png"
				width="384"
			/>

			<drawer-link
				:check-reg-ex="/^\/configuration(\/)*.*/"
				icon="sym_o_settings"
				link="/configuration"
				title="Configuration"
			/>
			<expansion-link
				:items="archiveLinks"
				icon="sym_o_archive"
				label="Archive"
			/>
			<expansion-link :items="allBases" icon="sym_o_domain" label="Bases" />
			<div class="tw-flex-1"></div>
			<drawer-link
				v-if="hasAdminRights"
				:check-reg-ex="/^\/settings(\/)*.*/"
				icon="sym_o_tune"
				link="/settings"
				title="Settings"
			/>
			<user-link />
		</div>

		<q-page-container
			class="tw-w-full tw-h-screen tw-py-4 tw-px-3 tw-flex tw-flex-col"
		>
			<router-view v-slot="{ Component }">
				<transition
					enter-active-class="animated fadeIn"
					leave-active-class="animated fadeOut"
					mode="out-in"
				>
					<component :is="Component" />
				</transition>
			</router-view>
		</q-page-container>
	</q-layout>
</template>

<script lang="ts" setup>
import DrawerLink from 'components/drawer/drawerLink.vue';
import { LinkProps } from 'components/drawer/types';
import ExpansionLink from 'components/drawer/expansionLink.vue';
import { basesStore } from 'stores/bases';
import { computed } from 'vue';
import { Base } from 'components/bases/base';
import UserLink from 'components/drawer/userLink.vue';
import { userStore } from 'stores/user';

//====================================================
// Const
//====================================================
const basesSt = basesStore();
const userSt = userStore();

const archiveLinks: LinkProps[] = [
	{
		icon: 'sym_o_inventory_2',
		link: '/archive',
		title: 'Archive',
		checkRegEx: /^\/archive/,
	},
	{
		icon: 'sym_o_history',
		link: '/timeArchive',
		title: 'Time Archive',
		checkRegEx: /^\/timeArchive/,
	},
	{
		icon: 'sym_o_search',
		link: '/findVariable',
		title: 'Find Variable',
		checkRegEx: /^\/findVariable/,
	},
];

//====================================================
// Computed
//====================================================
/**
 * allBases
 */
const allBases = computed((): Array<LinkProps> => {
	const array: Array<LinkProps> = [];

	basesSt.getBases.forEach((el: Base) => {
		array[el.sequenceNumber] = {
			icon: el.icon,
			link: `/bases/${el.name}`,
			title: el.name,
			checkRegEx: new RegExp(`^/bases/${el.name}`),
		};
	});

	return array;
});

/**
 * hasAdminRights
 */
const hasAdminRights = computed(() => {
	return userSt.hasAdminRights;
});
</script>
