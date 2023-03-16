<template>
	<div class="tw-flex tw-flex-col tw-h-full">
		<div class="tw-flex tw-justify-center">
			<tower-select
				v-model="currentBase"
				label="Base"
				option-label="name"
				:options="basesSt.getBases"
				class="tw-w-[33.3%]"
				:loading="loading"
				@update:modelValue="getAllModels"
			/>
			<tower-select
				v-model="currentModel"
				:disable="!currentBase"
				label="Promote from"
				option-label="name"
				:options="allModels"
				class="tw-w-[33.3%] tw-ml-3"
				:loading="loading"
				@update:modelValue="getPromotions"
			/>
		</div>
		<div
			class="tw-mt-5 tw-flex tw-flex-col tw-h-full"
			v-if="currentPromotionClone && currentModel"
		>
			<q-list>
				<template v-for="model of allModels" :key="model.name">
					<q-item
						v-if="model.name !== currentModel.name"
						clickable
						@click="addOrRemovePromotion(model.name)"
						:disable="loading"
					>
						<q-item-section avatar>
							<q-icon
								:name="
									currentPromotionClone.toModels.includes(model.name)
										? 'sym_o_check'
										: 'sym_o_check_box_outline_blank'
								"
								:color="
									currentPromotionClone.toModels.includes(model.name)
										? 'positive'
										: 'grey-7'
								"
								class="heavy"
								size="sm"
							/>
						</q-item-section>
						<q-item-section>
							<q-item-label>{{ model.name }}</q-item-label>
						</q-item-section>
					</q-item>
				</template>
			</q-list>
			<div class="tw-flex-grow" />
			<save-panel :save-enabled="isDifferent" @save-clicked="save" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref, watch } from 'vue';
import { Base } from 'components/bases/base';
import TowerSelect from 'components/basic/towerSelect.vue';
import { basesStore } from 'stores/bases';
import { ConfigurationModel } from 'components/configurationModel/configurationModel';
import { towerAxios } from 'boot/axios';
import { useQuasar } from 'quasar';
import { Promotion } from 'pages/settings/types/promotion';
import SavePanel from 'components/basic/savePanel.vue';
import { navigationStore } from 'stores/navigation';
//====================================================
// Const
//====================================================
const $q = useQuasar();
const basesSt = basesStore();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const currentBase: Ref<Base | null> = ref(null);

const allModels: Ref<Array<ConfigurationModel>> = ref([]);
const currentModel: Ref<ConfigurationModel | null> = ref(null);

const currentPromotion: Ref<Promotion | null> = ref(null);
const currentPromotionClone: Ref<Promotion | null> = ref(null);

const loading = ref(false);

//====================================================
// Computed
//====================================================
/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (!currentPromotion.value || !currentPromotionClone.value) {
		return false;
	}

	if (!currentPromotion.value.id) {
		return true;
	}

	if (
		currentPromotion.value?.toModels.length !==
		currentPromotionClone.value?.toModels.length
	) {
		return true;
	}

	return currentPromotion.value.toModels.some((el) => {
		return !currentPromotionClone.value?.toModels.some((model) => {
			return el === model;
		});
	});
});

//====================================================
// Methods
//====================================================
/**
 * getAllModels
 */
const getAllModels = async () => {
	allModels.value = [];

	if (!currentBase.value) {
		return;
	}

	loading.value = true;

	const filter = {
		where: {
			base: currentBase.value.name,
		},
		order: 'name ASC',
	};

	try {
		const response = await towerAxios.get(
			`/configurationModels?filter=${JSON.stringify(filter, undefined, '')}`
		);
		if (response.status === 200) {
			allModels.value = response.data;
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting configuration model data',
		});
	}

	loading.value = false;
};

/**
 * getPromotions
 */
const getPromotions = async () => {
	currentPromotion.value = null;

	if (!currentModel.value || !currentBase.value) {
		return;
	}

	loading.value = true;

	const filter = {
		where: {
			base: currentBase.value.name,
			fromModel: currentModel.value.name,
		},
	};

	try {
		const response = await towerAxios.get(
			`/promotions?filter=${JSON.stringify(filter, undefined, '')}`
		);
		if (response.status === 200) {
			if (response.data.length > 0) {
				currentPromotion.value = response.data[0];
				if (currentPromotion.value) {
					currentPromotionClone.value = {
						id: currentPromotion.value?.id,
						toModels: [...currentPromotion.value.toModels],
						base: currentPromotion.value.base,
						fromModel: currentPromotion.value.fromModel,
					};
				}
			} else {
				currentPromotion.value = {
					base: currentBase.value?.name,
					fromModel: currentModel.value?.name,
					toModels: [],
				};

				currentPromotionClone.value = {
					toModels: [...currentPromotion.value.toModels],
					base: currentPromotion.value.base,
					fromModel: currentPromotion.value.fromModel,
				};
			}
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting promotions data',
		});
	}

	loading.value = false;
};

/**
 * addOrRemovePromotion
 */
const addOrRemovePromotion = (name: string) => {
	if (currentPromotionClone.value) {
		if (currentPromotionClone.value.toModels.includes(name)) {
			currentPromotionClone.value.toModels =
				currentPromotionClone.value.toModels.filter((el) => {
					return el !== name;
				});
		} else {
			currentPromotionClone.value.toModels.push(name);
		}
	}
};

/**
 * save
 */
const save = async () => {
	if (currentPromotionClone.value) {
		loading.value = true;

		let response = null;

		try {
			if (currentPromotionClone.value.id) {
				response = await towerAxios.patch(
					`/promotions/${currentPromotionClone.value.id}`,
					currentPromotionClone.value
				);
			} else {
				response = await towerAxios.post(
					'/promotions',
					currentPromotionClone.value
				);
			}

			if (response.status === 200) {
				await getPromotions();
			}

			$q.notify({
				color: 'positive',
				position: 'top',
				textColor: 'secondary',
				message: 'Promotion data saved successfully',
			});
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error saving promotions data',
			});
		}

		loading.value = false;
	}
};

//====================================================
// Watch
//====================================================
watch(
	() => isDifferent.value,
	(current) => {
		if (current && !loading.value) {
			navigationSt.preventNavigation();
		} else {
			navigationSt.allowNavigation();
		}
	}
);
</script>

<style scoped></style>
