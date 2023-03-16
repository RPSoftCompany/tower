<template>
	<div class="tw-bg-dark tw-text-secondary tw-px-4 tw-rounded">
		<q-dialog v-model="showExportDialog" persistent>
			<q-card class="tw-min-w-[30%]">
				<q-card-section class="tw-bg-dark">
					<div class="text-h6">Export {{ title.toLowerCase() }}</div>
				</q-card-section>

				<q-card-section class="tw-bg-darkPage">
					<q-file
						v-model="exportDetails.inputFile"
						:loading="loadingFile"
						accept=".json"
						color="secondary"
						dense
						label="Source file name"
						@rejected="onRejected"
					>
						<template #prepend>
							<q-icon name="sym_o_attach_file" />
						</template>
					</q-file>
				</q-card-section>

				<q-card-actions align="right" class="tw-bg-darkPage">
					<q-btn
						v-close-popup
						color="secondary"
						flat
						label="Cancel"
						@click="closeExportDialog(false)"
					/>
					<q-btn
						v-close-popup
						:disable="!exportDetails.inputFile || loadingFile"
						color="secondary"
						flat
						label="Export"
						@click="closeExportDialog(true)"
					/>
				</q-card-actions>
			</q-card>
		</q-dialog>
		<div
			class="tw-w-full tw-grid tw-grid-cols-3 tw-gap-3 tw-py-2 tw-justify-items-stretch tw-justify-self-center tw-place-items-center"
		>
			<div class="tw-flex tw-col-auto">
				<q-input
					v-model="localFilter"
					:debounce="300"
					class="tw-flex-grow"
					clear-icon="sym_o_close"
					clearable
					color="secondary"
					dense
					label="Filter"
				>
					<template v-slot:prepend>
						<q-icon name="sym_o_search" />
					</template>
				</q-input>
				<tower-toggle-icon
					v-if="showDiffEnabled"
					v-model:toggled="localDiff"
					class="tw-self-center tw-ml-2"
					icon="sym_o_difference"
					size="sm"
				>
					<q-tooltip :delay="300">Show differences</q-tooltip>
				</tower-toggle-icon>
			</div>
			<div
				class="tw-text-secondary tw-text-base tw-font-semibold tw-col-auto tw-text-center"
			>
				{{ title }}
			</div>
			<div class="tw-col-auto">
				<div
					class="tw-w-full tw-grid tw-gap-3 tw-grid-flow-col tw-auto-cols-max tw-place-content-end"
				>
					<slot name="beforeImport"></slot>
					<q-btn
						v-if="importEnabled"
						color="transparent"
						flat
						icon="sym_o_cloud_download"
						padding="sm"
						text-color="secondary"
						@click="emits('importClicked')"
					>
						<q-tooltip>Import {{ title.toLowerCase() }}</q-tooltip>
					</q-btn>
					<q-btn
						v-if="exportEnabled"
						color="transparent"
						flat
						icon="sym_o_cloud_upload"
						padding="sm"
						text-color="secondary"
						@click="showExportDialog = true"
					>
						<q-tooltip>Export {{ title.toLowerCase() }}</q-tooltip>
					</q-btn>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, Ref, ref, watch } from 'vue';
import { Export } from 'components/models';
import { useQuasar } from 'quasar';
import TowerToggleIcon from 'components/basic/towerToggleIcon.vue';

//====================================================
// Const
//====================================================
const $q = useQuasar();

//====================================================
// Props
//====================================================
const props = withDefaults(
	defineProps<{
		title: string;
		filter: string | null;
		showDiff?: boolean;
		importEnabled?: boolean;
		exportEnabled?: boolean;
		showDiffEnabled?: boolean;
	}>(),
	{
		title: '',
		filter: '',
		showDiff: true,
		importEnabled: false,
		exportEnabled: false,
		showDiffEnabled: true,
	}
);
//====================================================
// Emits
//====================================================
const emits = defineEmits([
	'update:filter',
	'update:showDiff',
	'importClicked',
	'exportClicked',
]);

//====================================================
// Data
//====================================================
const exportDetails: Ref<Export> = ref({
	inputFile: null,
});
const showExportDialog = ref(false);
const loadingFile = ref(false);

//====================================================
// Computed
//====================================================
const localFilter = computed({
	get: () => props.filter,
	set: (value) => emits('update:filter', value),
});

const localDiff = computed({
	get: () => props.showDiff,
	set: (value) => emits('update:showDiff', value),
});
//====================================================
// Methods
//====================================================
/**
 * onRejected
 */
const onRejected = () => {
	$q.notify({
		type: 'negative',
		message: 'Uploaded file did not pass validation constraints',
	});
};

/**
 * closeExportDialog
 * @param emit
 */
const closeExportDialog = (emit: boolean) => {
	if (emit) {
		const details: Export = {
			inputFile: exportDetails.value.inputFile,
			fileData: exportDetails.value.fileData,
		};
		emits('exportClicked', details);
	}

	exportDetails.value.inputFile = null;
	exportDetails.value.fileData = undefined;
};

/**
 * uploadFileData
 */
const uploadFileData = () => {
	loadingFile.value = true;

	const reader = new FileReader();

	reader.addEventListener(
		'load',
		() => {
			exportDetails.value.fileData = reader.result as string;
			loadingFile.value = false;
		},
		false
	);

	reader.addEventListener(
		'error',
		() => {
			loadingFile.value = false;
			$q.notify({
				type: 'negative',
				message: 'Error reading input file',
			});
		},
		false
	);

	reader.readAsText(exportDetails.value.inputFile as Blob);
};

//====================================================
// Watch
//====================================================
watch(
	() => exportDetails.value.inputFile,
	(current) => {
		if (current) {
			uploadFileData();
		}
	}
);
</script>

<style scoped></style>
