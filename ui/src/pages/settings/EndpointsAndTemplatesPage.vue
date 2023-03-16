<template>
	<div>
		<q-dialog v-model="deleteDialog" persistent>
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Delete {{ currentEndpoint?.url }}</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to remove
					<b>{{ currentEndpoint?.url }}</b> endpoint?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="deleteEndpoint"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="sequenceDialog" persistent>
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-darkPage">
					<div class="text-h6">Change endpoint sequence</div>
				</q-card-section>

				<q-card-section>
					<q-card
						bordered
						flat
						v-for="(endpoint, index) of allEndpointsClone"
						:key="endpoint.id"
						draggable="true"
						class="tw-bg-darkPage"
						:class="{ 'tw-opacity-20': draggedId === endpoint.id }"
						@dragstart="dragStart(endpoint.id)"
						@dragenter="dragEnter(index)"
						@dragend="dragEnd"
					>
						<q-card-section class="tw-flex tw-justify-between">
							<div class="tw-flex tw-items-center">
								<q-icon
									name="sym_o_drag_indicator"
									class="tw-mr-3 tw-cursor-grab"
									size="sm"
								></q-icon>
								<span
									><b>{{ index + 1 }}.</b> /{{ endpoint.type }}/<b>{{
										endpoint.url
									}}</b
									>{{ endpoint.type === 'v2' ? '/' + urlExample : '' }}</span
								>
							</div>
							<div>
								<q-btn
									flat
									padding="0.25rem"
									:disable="index === 0"
									@click="moveSequenceUp(index)"
								>
									<q-icon name="sym_o_keyboard_arrow_up" size="sm"></q-icon>
								</q-btn>
								<q-btn
									flat
									padding="0.25rem"
									:disabled="index >= allEndpointsClone.length - 1"
									@click="moveSequenceDown(index)"
								>
									<q-icon name="sym_o_keyboard_arrow_down" size="sm"></q-icon>
								</q-btn>
							</div>
						</q-card-section>
					</q-card>
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="secondary"
						:disable="!isSequenceDifferent"
						flat
						label="Update"
						@click="updateSequence"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div class="tw-flex tw-justify-center">
			<tower-select
				v-model="currentEndpoint"
				:options="allEndpoints"
				option-label="url"
				class="tw-w-[33.3%]"
				label="Endpoint"
				:loading="loading"
				:disable="loading"
			>
				<template v-slot:option="scope">
					<q-item v-bind="scope.itemProps">
						<q-item-section>
							<q-item-label
								><b>{{ scope.opt.sequenceNumber + 1 }}.</b>
								{{ scope.opt.type }}/{{ scope.opt.url }}</q-item-label
							>
						</q-item-section>
					</q-item>
				</template>
				<template v-slot:after>
					<q-btn
						flat
						padding="0.25rem"
						@click="newEndpoint"
						:loading="loading"
						:disable="loading"
					>
						<q-icon name="sym_o_add" size="sm" />
					</q-btn>
					<q-btn
						flat
						padding="0.25rem"
						@click="deleteDialog = true"
						v-if="currentEndpoint"
						:loading="loading"
						:disable="loading"
					>
						<q-icon name="sym_o_delete" size="sm" />
					</q-btn>
					<q-btn
						flat
						padding="0.25rem"
						@click="sequenceDialog = true"
						:loading="loading"
						:disable="loading"
					>
						<q-icon name="sym_o_format_list_numbered" size="sm" />
					</q-btn>
				</template>
			</tower-select>
		</div>
		<div v-if="currentEndpointClone" class="tw-mt-3">
			<q-input
				ref="urlRef"
				label="URL"
				v-model="currentEndpointClone.url"
				:rules="urlRules"
				:hint="
					currentEndpointClone?.type === 'v2'
						? 'e.g. myUrl'
						: `e.g. ${urlExample}`
				"
				dense
				color="secondary"
				:prefix="`/${currentEndpointClone.type}/`"
				:suffix="
					currentEndpointClone?.type === 'v2' ? `/${urlExample}` : undefined
				"
			/>
			<div class="tw-flex tw-mt-2">
				<div class="tw-flex-grow">
					<div class="tw-mr-3 tw-p-1 tw-bg-dark tw-rounded">
						<v-ace-editor
							class="tower-editor"
							v-model:value="currentEndpointClone.template"
							lang="liquid"
							theme="monokai"
							style="height: calc(100vh - 21rem)"
							:options="{
								useWorker: true,
								enableBasicAutocompletion: true,
								enableSnippets: true,
								enableLiveAutocompletion: true,
								showPrintMargin: false,
							}"
						></v-ace-editor>
					</div>
				</div>
				<div>
					<div
						class="tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
					>
						<div class="tw-text-xl tw-font-medium tw-mx-3">Return type</div>
						<div class="tw-text-gray-500 tw-mx-3">
							Determines the REST API contentType
						</div>
						<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
						<q-select
							v-model="currentEndpointClone.returnType"
							label="Return type"
							color="secondary"
							:options="['json', 'xml', 'plain text']"
							class="tw-mx-3"
						/>
					</div>
					<div
						class="tw-mt-5 tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
					>
						<div class="tw-text-xl tw-font-medium tw-mx-3">API version</div>
						<div class="tw-text-gray-500 tw-mx-3">
							Sets the REST API version
						</div>
						<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
						<q-select
							v-model="currentEndpointClone.type"
							label="API version"
							color="secondary"
							:options="['v1', 'v2']"
							class="tw-mx-3"
						/>
					</div>
				</div>
			</div>
		</div>
		<div v-if="currentEndpointClone" class="tw-mt-3">
			<save-panel
				:save-enabled="isDifferent"
				@save-clicked="save"
				:loading="loading"
				:has-errors="hasErrors"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import TowerSelect from 'components/basic/towerSelect.vue';
import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue';
import {
	RestConfiguration,
	RestConfigurationType,
} from 'pages/settings/types/restConfiguration';
import { towerAxios } from 'boot/axios';
import { VAceEditor } from 'vue3-ace-editor';
import modeLiquidUrl from 'ace-builds/src-noconflict/mode-liquid?url';
import themeMonokaiUrl from 'ace-builds/src-noconflict/theme-monokai?url';
import snippetsLiquidUrl from 'ace-builds/src-noconflict/snippets/html?url';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import SavePanel from 'components/basic/savePanel.vue';
import { QInput, useQuasar } from 'quasar';
import { basesStore } from 'stores/bases';
import { Base } from 'components/bases/base';
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
const currentEndpointClone: Ref<RestConfiguration | null> = ref(null);
const currentEndpoint: Ref<RestConfiguration | null> = ref(null);
const allEndpoints: Ref<Array<RestConfiguration>> = ref([]);
const allEndpointsClone: Ref<Array<RestConfiguration>> = ref([]);

const loading = ref(false);

const urlRules: Ref<Array<(value: string) => string | boolean>> = ref([]);

const urlRef = ref(null);

const deleteDialog = ref(false);

const sequenceDialog = ref(false);
const draggedId = ref('-1');

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	ace.config.setModuleUrl('ace/mode/liquid', modeLiquidUrl);
	ace.config.setModuleUrl('ace/theme/monokai', themeMonokaiUrl);
	ace.config.setModuleUrl('ace/snippets/liquid', snippetsLiquidUrl);

	ace.require('ace/ext/language_tools');

	urlRules.value.push(existingUrl);
	urlRules.value.push(notEmpty);
	urlRules.value.push(atLeastOneBase);

	await getAllEndpoints();
});
//====================================================
// Methods
//====================================================
/**
 * getAllEndpoints
 */
const getAllEndpoints = async () => {
	const filter = {
		order: 'sequenceNumber ASC',
	};

	const response = await towerAxios.get(
		`/restConfigurations?filter=${JSON.stringify(filter, undefined, '')}`
	);
	if (response.status === 200) {
		allEndpoints.value = [...response.data];
		allEndpointsClone.value = [...response.data];
	}
};

/**
 * save
 */
const save = async () => {
	if (currentEndpointClone.value) {
		loading.value = true;
		try {
			if (!currentEndpointClone.value.id) {
				await towerAxios.post(
					'/restConfigurations',
					currentEndpointClone.value
				);
			} else {
				await towerAxios.patch(
					`/restConfigurations/${currentEndpointClone.value.id}`,
					currentEndpointClone.value
				);
			}
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error saving endpoint details',
			});

			loading.value = false;

			return;
		}

		await getAllEndpoints();

		const endpoint = allEndpoints.value.find((el) => {
			return el.url === currentEndpointClone.value?.url;
		});

		if (endpoint) {
			currentEndpoint.value = endpoint;
		}

		$q.notify({
			color: 'positive',
			position: 'top',
			textColor: 'secondary',
			message: 'Configuration saved successfully',
		});

		loading.value = false;
	}
};

/**
 * newEndpoint
 */
const newEndpoint = () => {
	currentEndpoint.value = null;
	nextTick(() => {
		currentEndpointClone.value = {
			url: '',
			type: RestConfigurationType.V1,
			returnType: 'json',
			sequenceNumber: allEndpoints.value.length,
			template:
				'{\n' +
				'\t{%- for var in variables -%}\n' +
				'\t{% case var.type -%}\n' +
				'\t{% when "string", "password" %}\n' +
				'\t"{{ var.name }}":"{{ var.value }}"{%- if forloop.last != true -%},{%- endif -%}\n' +
				'\t{% when "number", "boolean" %}\n' +
				'\t"{{ var.name }}":{{ var.value }}{%- if forloop.last != true -%},{%- endif -%}\n' +
				'\t{% when "list" %}\n' +
				'\t"{{ var.name }}":[{% for listVar in var -%}"{{ listVar }}"{%- if forloop.last != true -%},{%- endif -%}{%- endfor -%}{%- if forloop.last != true -%}],{%- endif -%}\n' +
				'\t{% else %}\n' +
				'\t"{{ var.name }}":"{{ var.value }}"{%- if forloop.last != true -%},{%- endif -%}\n' +
				'\t{% endcase -%}\n' +
				'\t{%- endfor %}\n' +
				'}',
		};

		nextTick(() => {
			if (urlRef.value) {
				(urlRef.value as QInput).validate();
			}
		});
	});
};

/**
 * urlRules existingUrl
 */
const existingUrl = () => {
	const exists = allEndpoints.value.some((el) => {
		if (currentEndpointClone.value) {
			return (
				el.id !== currentEndpointClone.value.id &&
				el.url === currentEndpointClone.value.url
			);
		}
	});

	if (exists) {
		return 'Endpoint with such URL exists already';
	}

	return true;
};

/**
 * urlRules notEmpty
 */
const notEmpty = (value: string) => {
	if (value) {
		return true;
	}

	return "URL can't be empty";
};

/**
 * urlRules at least one base
 */
const atLeastOneBase = (value: string) => {
	if (currentEndpointClone.value?.type === RestConfigurationType.V2) {
		return true;
	}

	let hasBase = false;

	if (value) {
		hasBase = basesSt.getBases.some((base) => {
			return value.includes(`{${base.name}}`);
		});
	}

	if (!hasBase) {
		return 'At least one Base Model needs to be used in URL';
	}

	return true;
};

/**
 * deleteEndpoint
 */
const deleteEndpoint = async () => {
	if (currentEndpoint.value) {
		try {
			await towerAxios.delete(
				`/restConfigurations/${currentEndpoint.value.id}`
			);
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: 'sym_o_error',
				message: 'Error deleting endpoint',
			});

			return;
		}

		await getAllEndpoints();

		currentEndpoint.value = null;

		$q.notify({
			color: 'positive',
			position: 'top',
			textColor: 'secondary',
			message: 'Endpoint deleted successfully',
		});
	}
};

/**
 * dragStart
 */
const dragStart = (id: string) => {
	setTimeout(() => {
		draggedId.value = id;
	}, 10);
};

/**
 * dragEnd
 */
const dragEnd = () => {
	draggedId.value = '';
};

/**
 * dragEnter
 */
const dragEnter = (index: number) => {
	if (allEndpointsClone.value[index].id !== draggedId.value) {
		const draggedIndex = allEndpointsClone.value.findIndex((el) => {
			return el.id === draggedId.value;
		});

		if (draggedIndex >= 0) {
			const tempValue = allEndpointsClone.value[index];
			allEndpointsClone.value[index] = allEndpointsClone.value[draggedIndex];
			allEndpointsClone.value[draggedIndex] = tempValue;
		}
	}
};

/**
 * moveSequenceUp
 */
const moveSequenceUp = (sequence: number) => {
	if (sequence > 0) {
		const temp = allEndpointsClone.value[sequence - 1];
		const seqTemp = allEndpointsClone.value[sequence];
		if (temp && seqTemp) {
			allEndpointsClone.value[sequence - 1] = seqTemp;
			allEndpointsClone.value[sequence] = temp;
		}
	}
};

/**
 * moveSequenceDown
 */
const moveSequenceDown = (sequence: number) => {
	if (sequence < allEndpointsClone.value.length) {
		const temp = allEndpointsClone.value[sequence];
		const seqTemp = allEndpointsClone.value[sequence + 1];
		if (temp && seqTemp) {
			allEndpointsClone.value[sequence] = seqTemp;
			allEndpointsClone.value[sequence + 1] = temp;
		}
	}
};

/**
 * updateSequence
 */
const updateSequence = async () => {
	loading.value = true;

	for (let i = 0; i < allEndpointsClone.value.length; i++) {
		if (allEndpointsClone.value[i].sequenceNumber !== i) {
			try {
				allEndpointsClone.value[i].sequenceNumber = i;
				await towerAxios.patch(
					`/restConfigurations/${allEndpointsClone.value[i].id}`,
					allEndpointsClone.value[i]
				);
			} catch (e) {
				$q.notify({
					color: 'negative',
					position: 'top',
					textColor: 'secondary',
					icon: 'sym_o_error',
					message: 'Error updating REST Configuration sequences',
				});

				loading.value = false;

				return;
			}
		}
	}

	await getAllEndpoints();

	$q.notify({
		color: 'positive',
		position: 'top',
		textColor: 'secondary',
		message: 'REST Configuration sequences saved successfully',
	});

	loading.value = false;
};

//====================================================
// Computed
//====================================================
/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (currentEndpointClone.value && currentEndpoint.value) {
		return (
			currentEndpointClone.value.returnType !==
				currentEndpoint.value?.returnType ||
			currentEndpointClone.value?.template !==
				currentEndpoint.value?.template ||
			currentEndpointClone.value?.type !== currentEndpoint.value?.type ||
			currentEndpointClone.value.url !== currentEndpoint.value?.url ||
			currentEndpointClone.value?.sequenceNumber !==
				currentEndpoint.value?.sequenceNumber
		);
	} else if (!currentEndpoint.value) {
		return true;
	}

	return false;
});

/**
 * isSequenceDifferent
 */
const isSequenceDifferent = computed(() => {
	for (let i = 0; i < allEndpointsClone.value.length; i++) {
		if (allEndpointsClone.value[i].sequenceNumber !== i) {
			return true;
		}
	}

	return false;
});

/**
 * urlExample
 */
const urlExample = computed(() => {
	let url = '';
	basesSt.getBases.forEach((base: Base, index: number) => {
		url += `{${base.name}}`;
		if (index !== basesSt.getBases.length - 1) {
			url += '/';
		}
	});

	return url;
});

/**
 * hasErrors
 */
const hasErrors = computed(() => {
	if (!currentEndpointClone.value) {
		return false;
	}

	return urlRules.value.some((func) => {
		if (currentEndpointClone.value) {
			const retValue = func(currentEndpointClone.value.url);
			if (retValue !== true) {
				return true;
			}
		}

		return false;
	});
});

//====================================================
// Watch
//====================================================
watch(
	() => currentEndpoint.value,
	(current) => {
		if (current) {
			currentEndpointClone.value = {
				type: current.type,
				id: current.id,
				returnType: current.returnType,
				template: current.template,
				sequenceNumber: current.sequenceNumber,
				url: current.url,
			};
		} else {
			currentEndpointClone.value = null;
		}
	}
);

watch(
	() => currentEndpointClone.value,
	(current) => {
		if (current) {
			nextTick(() => {
				if (urlRef.value) {
					(urlRef.value as QInput).validate();
				}
			});
		}
	},
	{ deep: true }
);

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

<style></style>
