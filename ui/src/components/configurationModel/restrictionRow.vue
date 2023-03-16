<template>
	<div class="tw-flex">
		<div :class="`tw-grid-cols-${baseModels.length}`" class="tw-grid tw-w-full">
			<tower-select
				v-for="(base, index) of basesInThisRestriction"
				:key="base.name"
				ref="allBases"
				v-model="localModel[base.name]"
				:clearable="true"
				:disable="readOnly"
				:label="base.name"
				:loading="false"
				:options="baseModels[index]"
				:rules="[
					() => isValid || isNew || 'At least one model has to be chosen'
				]"
				class="tw-mr-2"
				displayAsEmpty="ANY"
				@blur="onBlur"
			/>
		</div>
		<q-btn
			:disable="readOnly || (isNew && !isValid)"
			class="tw-mt-2 tw-mb-3 tw-max-w-[2rem] tw-place-self-end"
			flat
			padding="sm"
			@click="addOrDelete"
		>
			<q-icon :name="isNew ? 'sym_o_add' : 'sym_o_delete'" size="sm"></q-icon>
		</q-btn>
	</div>
</template>

<script lang="ts" setup>
import { basesStore } from 'stores/bases';
import { computed, ref } from 'vue';
import TowerSelect from 'components/basic/towerSelect.vue';
import { QSelect } from 'quasar';

//====================================================
// Const
//====================================================
const basesSt = basesStore();

//====================================================
// Props
//====================================================
const props = defineProps<{
	baseModels: Array<Array<string>>;
	readOnly?: boolean;
	isNew?: boolean;
	modelValue: any;
}>();

//====================================================
// Data
//====================================================
const allBases = ref([]);

//====================================================
// Emit
//====================================================
const emit = defineEmits([
	'update:modelValue',
	'addNewRestriction',
	'deleteRestriction'
]);

//====================================================
// Computed
//====================================================
const basesInThisRestriction = computed(() => {
	return [...basesSt.getBases].splice(0, props.baseModels.length);
});

/**
 *
 */
const localModel = computed({
	get: () => props.modelValue,
	set: value => emit('update:modelValue', value)
});

const isValid = computed(() => {
	return basesInThisRestriction.value.some(el => {
		return localModel.value[el.name];
	});
});

//====================================================
// Methods
//====================================================
const addOrDelete = () => {
	if (props.isNew) {
		emit('addNewRestriction');
	} else {
		emit('deleteRestriction', localModel.value.__id);
	}
};

const onBlur = () => {
	allBases.value.forEach(el => {
		(el as QSelect).validate();
	});
};
</script>

<style scoped></style>
