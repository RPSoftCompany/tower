<template>
	<router-view v-slot="{ Component }">
		<q-dialog v-model="showDialog">
			<q-card style="width: 30rem">
				<q-card-section
					class="tw-text-sm tw-font-semibold tw-bg-accent tw-text-black"
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
						class="tw-text-accent"
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

const navigationSt = navigationStore();
const router = useRouter();

const showDialog = computed({
	get: () => {
		return navigationSt.getShowDialog;
	},
	set: () => {
		//ignore
	}
});

const followPath = () => {
	navigationSt.allowNavigation();
	navigationSt.closeNavigationDialog();
	router.push(navigationSt.getDestination);
};

const preventNavigation = () => {
	navigationSt.closeNavigationDialog();
};
</script>
