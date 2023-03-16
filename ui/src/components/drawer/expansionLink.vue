<template>
	<q-item
		:class="{
			'tw-bg-secondary': hasCurrentRoute,
			'tw-text-darkPage': hasCurrentRoute,
			'tw-bg-dark': !hasCurrentRoute
		}"
		class="tw-px-2 2xl:tw-py-1 tw-py-0 tw-mb-1 2xl:tw-mx-2 tw-mx-3 tw-rounded 2xl:tw-min-h-[2.25rem] tw-min-h-[2rem]"
		clickable
		tag="div"
	>
		<div class="tw-w-full tw-flex tw-items-stretch" @click="opened = !opened">
			<q-icon
				:color="hasCurrentRoute ? 'dark' : undefined"
				:name="icon"
				class="tw-self-center"
				size="xs"
			/>
			<div
				class="tw-text-xs tw-ml-2 tw-basis-auto tw-grow tw-self-center 2xl:tw-block tw-hidden"
			>
				{{ label }}
			</div>
			<div
				class="tw-bg-darkPage tw-self-center tw-ml-1 2xl:tw-ml-0 tw-rounded-full tw-pa-1 tw-flex tw-justify-center"
			>
				<q-icon
					:class="{ 'rotate-90': opened }"
					:style="!opened ? 'transform: translate(1px, 0)' : undefined"
					class="tw-self-center tw-transition-all tw-text-secondary"
					name="sym_o_chevron_right"
					size="xs"
				/>
			</div>
		</div>
	</q-item>
	<transition
		:enter-active-class="`animated ${transitionIn}`"
		:leave-active-class="`animated ${transitionOut}`"
	>
		<div v-if="opened" class="tw-ml-2 tw-mr-1">
			<drawer-link
				v-for="item of items"
				:key="item.link"
				:check-reg-ex="item.checkRegEx"
				:icon="item.icon"
				:link="item.link"
				:title="item.title"
			/>
		</div>
	</transition>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { LinkProps } from 'components/drawer/types';
import DrawerLink from 'components/drawer/drawerLink.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

/**
 * Props
 */
const props = defineProps({
	items: { type: Array as PropType<Array<LinkProps>> },
	label: { type: String },
	icon: { type: String },
	transitionIn: { type: String, default: 'slideInLeft' },
	transitionOut: { type: String, default: 'slideOutLeft' }
});

/**
 * Data
 */
const opened = ref(false);

/**
 * Computed
 */
const hasCurrentRoute = computed(() => {
	if (props.items) {
		return props.items.some((el: LinkProps) => {
			return el.link === route.path;
		});
	}

	return false;
});
</script>
