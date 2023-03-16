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
