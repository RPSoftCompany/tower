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
	<div>
		<q-dialog v-model="deleteHookDialog">
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-negative">
					<div class="text-h6">Delete {{ currentHookClone?.url }} hook</div>
				</q-card-section>

				<q-card-section>
					Are you sure you want to delete
					<b>{{ currentHookClone }}</b> hook?
				</q-card-section>

				<q-card-actions align="right">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="negative"
						flat
						label="Yes"
						@click="deleteHook"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="headersDialog">
			<q-card class="tw-min-w-[30rem]">
				<q-card-section class="tw-bg-dark">
					<div class="text-h6">Set headers</div>
				</q-card-section>

				<q-card-section class="tw-bg-darkPage">
					<div
						class="tw-grid tw-grid-cols-2 tw-gap-3"
						v-for="(header, index) of headersArray"
						:key="index"
					>
						<q-input
							ref="headerNameRef"
							v-model="header.name"
							label="Header"
							dense
							color="secondary"
						/>
						<q-input
							ref="headerValueRef"
							v-model="header.value"
							label="Value"
							dense
							color="secondary"
						>
							<template #after>
								<q-btn flat padding="0.25rem">
									<q-icon name="sym_o_delete" size="sm" />
								</q-btn>
							</template>
						</q-input>
					</div>
					<div class="tw-grid tw-grid-cols-2 tw-gap-3">
						<q-input
							v-model="newHeaderName"
							debounce="300"
							label="Header"
							dense
							color="secondary"
						/>
						<q-input
							v-model="newHeaderValue"
							debounce="300"
							label="Value"
							dense
							color="secondary"
						/>
					</div>
				</q-card-section>

				<q-card-actions align="right" class="tw-bg-darkPage">
					<q-btn v-close-popup color="secondary" flat label="Cancel" />
					<q-btn
						v-close-popup
						color="secondary"
						flat
						label="Save"
						@click="saveHeaders"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div class="tw-flex">
			<div class="tw-grid tw-grid-cols-3 tw-gap-3 tw-flex-grow">
				<tower-select
					v-model="currentModel"
					label="Model"
					:options="allModels"
					@update:modelValue="
						currentHook = null;
						currentHookClone = null;
						currentMethod = '';
					"
				/>
				<tower-select
					v-model="currentMethod"
					:disable="!currentModel"
					label="Method"
					:options="allMethods"
					@update:modelValue="
						currentHook = null;
						currentHookClone = null;
					"
				/>
				<tower-select
					v-model="currentHook"
					:disable="!currentModel"
					label="Hook"
					option-label="url"
					:options="filteredHooks as any[]"
				/>
			</div>
			<q-btn
				flat
				padding="0.25rem"
				class="tw-ml-3"
				@click="newHook"
				:disable="!currentMethod || !currentModel"
			>
				<q-icon name="sym_o_add" size="sm" />
			</q-btn>
			<q-btn
				flat
				padding="0.25rem"
				class="tw-ml-3"
				:disable="!currentHook"
				@click="showRemoveHookDialog"
			>
				<q-icon name="sym_o_delete" size="sm" />
			</q-btn>
		</div>
		<div v-if="currentHookClone" class="tw-mt-3">
			<div class="tw-flex">
				<q-input
					v-model="currentHookClone.url"
					ref="currentHookUrlRef"
					label="URL"
					:rules="[nonEmptyUrlRule, invalidUrlRule, urlExistsRule]"
					color="secondary"
					dense
					class="tw-flex-grow"
				/>
			</div>
			<div class="tw-flex">
				<div class="tw-flex-grow tw-mt-1">
					<div class="tw-p-1 tw-bg-dark tw-rounded">
						<v-ace-editor
							v-model:value="currentHookClone.template"
							class="tower-editor tw-flex-grow"
							lang="liquid"
							:theme="$q.dark.isActive ? 'monokai' : 'tomorrow'"
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
				<div class="tw-w-[20rem] tw-ml-3">
					<div
						class="tw-mt-1 tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-darkPage tw-bg-dark"
					>
						<div class="tw-text-xl tw-font-medium tw-mx-3">Headers</div>
						<div class="tw-text-gray-500 tw-mx-3">
							Add or remove headers from hook request
						</div>
						<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
						<q-btn
							class="tw-bg-secondary tw-mx-3 tw-flex-grow"
							flat
							text-color="primary"
							@click="showHeadersDialog"
						>
							<q-icon
								class="tw-mr-3"
								color="primary"
								name="sym_o_send_time_extension"
								size="sm"
							/>
							Headers
						</q-btn>
					</div>
					<div
						class="tw-mt-3 tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
					>
						<div class="tw-text-xl tw-font-medium tw-mx-3">HTTP method</div>
						<div class="tw-text-gray-500 tw-mx-3">Set hook's HTTP method</div>
						<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
						<q-select
							v-model="currentHookClone.method"
							label="HTTP method"
							class="tw-mx-3"
							dense
							color="secondary"
							:options="['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT']"
						/>
					</div>
				</div>
			</div>
			<div class="tw-mt-3">
				<save-panel
					:save-enabled="isDifferent"
					@save-clicked="save"
					:has-errors="isValid"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, Ref, ref, watch } from 'vue';
import { Hook, HookHeader, HookParent } from 'pages/settings/types/hook';
import { towerAxios } from 'boot/axios';
import { QInput, useQuasar } from 'quasar';
import TowerSelect from 'components/basic/towerSelect.vue';
import { VAceEditor } from 'vue3-ace-editor';
import modeLiquidUrl from 'ace-builds/src-noconflict/mode-liquid?url';
import themeMonokaiUrl from 'ace-builds/src-noconflict/theme-monokai?url';
import themeTomorrowUrl from 'ace-builds/src-noconflict/theme-tomorrow?url';
import snippetsLiquidUrl from 'ace-builds/src-noconflict/snippets/html?url';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import SavePanel from 'components/basic/savePanel.vue';
import { ionWarning } from '@quasar/extras/ionicons-v6';
import { navigationStore } from 'stores/navigation';
import { v4 as uuidv4 } from 'uuid';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const allHooks: Ref<Array<HookParent>> = ref([]);

const currentModel = ref('');
const currentMethod = ref('');

const currentHook: Ref<Hook | null> = ref(null);
const currentHookClone: Ref<Hook | null> = ref(null);

const loading = ref(false);

const headersDialog = ref(false);
const headersArray: Ref<Array<HookHeader>> = ref([]);
const newHeaderName = ref('');
const newHeaderValue = ref('');

const headerNameRef = ref(null);
const headerValueRef = ref(null);

const deleteHookDialog = ref(false);

const urlRules: Array<(value: string) => string | boolean> = [];

const currentHookUrlRef = ref(null);

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	ace.config.setModuleUrl('ace/mode/liquid', modeLiquidUrl);
	ace.config.setModuleUrl('ace/theme/monokai', themeMonokaiUrl);
	ace.config.setModuleUrl('ace/theme/chrome', themeTomorrowUrl);
	ace.config.setModuleUrl('ace/snippets/liquid', snippetsLiquidUrl);

	urlRules.push(nonEmptyUrlRule);
	urlRules.push(invalidUrlRule);
	urlRules.push(urlExistsRule);

	ace.require('ace/ext/language_tools');

	await getAllHooks();
});
//====================================================
// Computed
//====================================================
/**
 * allModels
 */
const allModels = computed(() => {
	if (allHooks.value) {
		const all: Array<string> = [];

		allHooks.value.forEach((el) => {
			if (!all.includes(el.model)) {
				all.push(el.model);
			}
		});

		all.sort();

		return all;
	}

	return [];
});

/**
 * allMethods
 */
const allMethods = computed(() => {
	if (allHooks.value && currentModel.value) {
		const all: Array<string> = [];

		const filteredHooks = allHooks.value.filter((el) => {
			return el.model === currentModel.value;
		});

		filteredHooks.forEach((el) => {
			if (!all.includes(el.method)) {
				all.push(el.method);
			}
		});

		all.sort();

		return all;
	}

	return [];
});

/**
 * filteredHooks
 */
const filteredHooks = computed(() => {
	if (allHooks.value && currentModel.value && currentMethod.value) {
		const all = allHooks.value.find((el) => {
			return (
				el.model === currentModel.value && el.method === currentMethod.value
			);
		});

		if (all && all.hooks) {
			return all.hooks;
		}
	}

	return [];
});

/**
 * isDifferent
 */
const isDifferent = computed(() => {
	if (!currentHookClone.value) {
		return false;
	}

	if (currentHookClone.value.headers) {
		if (
			currentHookClone.value.headers.length !==
			currentHook.value?.headers?.length
		) {
			return true;
		}

		const hasDifferentHeader = currentHookClone.value.headers.some((el) => {
			if (currentHook.value?.headers) {
				return !currentHook.value.headers.some((header) => {
					return header.name === el.name && header.value === el.value;
				});
			}
		});

		if (hasDifferentHeader) {
			return true;
		}
	}

	return (
		currentHookClone.value?.url !== currentHook.value?.url ||
		currentHookClone.value?.method !== currentHook.value?.method ||
		currentHookClone.value?.template !== currentHook.value?.template
	);
});

const isValid = computed(() => {
	return urlRules.some((el) => {
		if (currentHookClone.value) {
			return el(currentHookClone.value?.url) !== true;
		}

		return false;
	});
});

//====================================================
// Methods
//====================================================
/**
 * getAllHooks
 */
const getAllHooks = async () => {
	loading.value = true;
	try {
		const response = await towerAxios.get('/hooks');

		if (response.status === 200) {
			allHooks.value = response.data;
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error collecting hooks data',
		});
	}

	loading.value = false;
};

/**
 * showHeadersDialog
 */
const showHeadersDialog = () => {
	headersArray.value = currentHookClone.value?.headers
		? [...currentHookClone.value?.headers]
		: [];
	headersDialog.value = true;
};

/**
 * saveHeaders
 */
const saveHeaders = () => {
	if (currentHookClone.value) {
		currentHookClone.value.headers = [...headersArray.value];
	}
};

/**
 * nonEmptyUrlRule
 */
const nonEmptyUrlRule = (value: string) => {
	return !!value || "URL can't be empty";
};

/**
 * invalidUrlRule
 */
const invalidUrlRule = (value: string) => {
	if (/^http(s)*:\/\//.test(value)) {
		return true;
	}

	return 'Invalid URL';
};

/**
 * urlExistsRule
 */
const urlExistsRule = (value: string) => {
	const exists = filteredHooks.value.some((el) => {
		return el.url === value && currentHookClone.value?._id !== el._id;
	});

	if (exists) {
		return 'Such URL exists already';
	}

	return true;
};

/**
 * newHook
 */
const newHook = () => {
	currentHook.value = null;
	currentHookClone.value = {
		template: '{}',
		url: '',
		description: '',
		method: 'GET',
		headers: [],
	};

	nextTick(() => {
		if (currentHookUrlRef.value) {
			(currentHookUrlRef.value as QInput).validate();
		}
	});
};

/**
 * showRemoveHookDialog
 */
const showRemoveHookDialog = () => {
	deleteHookDialog.value = true;
};

/**
 * deleteHook
 */
const deleteHook = async () => {
	if (currentHookClone.value?._id) {
		// find parent
		const parent = allHooks.value.find((el) => {
			return (
				el.model === currentModel.value && el.method === currentMethod.value
			);
		});

		try {
			if (parent) {
				await towerAxios.delete(
					`/hooks/${parent._id}/hookObject/${currentHookClone.value?._id}`,
				);
			}

			currentHook.value = null;
			currentHookClone.value = null;

			await getAllHooks();

			$q.notify({
				color: 'positive',
				position: 'top',
				textColor: 'secondary',
				message: 'Hook configuration removed successfully',
			});
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: ionWarning,
				message: 'Error deleting removing configuration',
			});
		}
	}
};

/**
 * save
 */
const save = async () => {
	if (currentHookClone.value) {
		// find parent
		const parent = allHooks.value.find((el) => {
			return (
				el.model === currentModel.value && el.method === currentMethod.value
			);
		});

		if (!parent) {
			return;
		}

		try {
			let response = null;
			if (currentHookClone.value?._id) {
				response = await towerAxios.put(
					`/hooks/${parent._id}/hookObject`,
					currentHookClone.value,
				);
			} else {
				currentHookClone.value._id = uuidv4();
				response = await towerAxios.post(
					`/hooks/${parent._id}/hookObject`,
					currentHookClone.value,
				);
			}

			if (response.status === 200 || response.status === 201) {
				currentHook.value = {
					_id: response.data._id,
					url: response.data.url,
					method: response.data.method,
					template: response.data.template,
					description: response.data.description,
					headers: response.data.headers,
				};

				await getAllHooks();

				$q.notify({
					color: 'positive',
					position: 'top',
					textColor: 'secondary',
					message: 'Hook configuration saved successfully',
				});
			}
		} catch (e) {
			$q.notify({
				color: 'negative',
				position: 'top',
				textColor: 'secondary',
				icon: ionWarning,
				message: 'Error saving hook configuration',
			});
		}
	}
};

//====================================================
// Watch
//====================================================
watch(
	() => currentHook.value,
	(current) => {
		if (current) {
			currentHookClone.value = {
				_id: current._id,
				description: current.description,
				method: current.method,
				url: current.url,
				template: current.template,
				headers: current.headers,
			};
		}
	},
);

watch(
	() => newHeaderName.value,
	(current) => {
		if (current && headersArray.value) {
			headersArray.value.push({
				name: current,
				value: '',
			});

			nextTick(() => {
				if (headerNameRef.value) {
					const inputs = headerNameRef.value as Array<QInput>;
					inputs[inputs.length - 1].focus();
					newHeaderName.value = '';
				}
			});
		}
	},
);

watch(
	() => newHeaderValue.value,
	(current) => {
		if (current && headersArray.value) {
			headersArray.value.push({
				name: '',
				value: current,
			});

			nextTick(() => {
				if (headerValueRef.value) {
					const inputs = headerValueRef.value as Array<QInput>;
					inputs[inputs.length - 1].focus();
					newHeaderValue.value = '';
				}
			});
		}
	},
);

watch(
	() => isDifferent.value,
	(current) => {
		if (current && !loading.value) {
			navigationSt.preventNavigation();
		} else {
			navigationSt.allowNavigation();
		}
	},
);
</script>

<style scoped></style>
