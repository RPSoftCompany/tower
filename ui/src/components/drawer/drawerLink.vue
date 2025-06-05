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
	<router-link :to="link">
		<q-item
			:class="{
				'tw-bg-secondary': checkRegEx.test(currentRoute),
				'tw-bg-dark': !checkRegEx.test(currentRoute),
				'tw-text-darkPage': checkRegEx.test(currentRoute),
			}"
			class="tw-px-2 2xl:tw-py-1 tw-py-0 tw-mb-1 2xl:tw-mx-2 tw-mx-3 tw-rounded 2xl:tw-min-h-[2.25rem] tw-min-h-[2rem]"
			clickable
			tag="div"
		>
			<q-tooltip
				v-if="!$q.screen.gt.lg"
				anchor="center right"
				self="center left"
			>
				{{ title }}
			</q-tooltip>
			<div class="tw-flex tw-w-full tw-justify-center 2xl:tw-justify-start">
				<q-icon
					v-if="icon"
					:color="checkRegEx.test(currentRoute) ? 'primary' : undefined"
					:name="icon"
					:size="$q.screen.gt.lg ? 'xs' : 'sm'"
					class="tw-self-center 2xl:tw-mr-2 tw-grow 2xl:tw-grow-0"
				>
				</q-icon>
				<div
					:class="{ 'tw-text-center': !icon }"
					class="tw-self-center tw-grow tw-justify-self-center 2xl:tw-block tw-hidden"
				>
					{{ title }}
				</div>
			</div>
		</q-item>
	</router-link>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();

/**
 * Interfaces
 */
export interface LinkProps {
	title: string;
	link?: string;
	icon?: string;
	checkRegEx: RegExp;
}

const route = useRoute();

/**
 * Props
 */
withDefaults(defineProps<LinkProps>(), {
	link: '#',
	icon: '',
});

/**
 * Computed
 */
const currentRoute = computed(() => route.path);
</script>
