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
	<div
		:class="{
			'tower-max-size': $q.screen.gt.lg,
			'tower-max-size-sm': !$q.screen.gt.lg,
		}"
	>
		<q-dialog v-model="showBodyDialog">
			<q-card>
				<q-card-section>
					<div class="text-h6">Request body</div>
				</q-card-section>

				<q-card-section
					class="fullWordWrap tw-overflow-auto tw-max-w-[80vw] tw-max-h-[70vh]"
				>
					{{ bodyToShow }}
				</q-card-section>

				<q-card-actions align="right">
					<q-btn flat label="Close" color="secondary" v-close-popup />
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-dialog v-model="showQueryDialog">
			<q-card>
				<q-card-section>
					<div class="text-h6">Request query params</div>
				</q-card-section>

				<q-card-section>
					{{ queryToShow }}
				</q-card-section>

				<q-card-actions align="right">
					<q-btn flat label="Close" color="secondary" v-close-popup />
				</q-card-actions>
			</q-card>
		</q-dialog>
		<q-table
			flat
			:rows="currentAudit"
			:columns="columns"
			row-key="id"
			dense
			:rows-per-page-options="[5, 10, 15, 20, 25, 50]"
			class="tower-sticky-header-table"
			v-model:pagination="pagination"
			color="secondary"
			@request="onRequest"
			:loading="loading"
		>
			<template v-slot:body-cell-query="props">
				<q-td :props="props" v-if="!props.value">
					<div class="text-grey-7">Empty</div>
				</q-td>
				<q-td :props="props" v-else>
					<template v-if="props.value.length > 50">
						<div
							class="tw-font-bold tw-cursor-pointer tw-underline"
							@click="showQuery(props.value)"
						>
							Show query params
						</div>
					</template>
					<template v-else>
						<div>{{ props.value }}</div>
					</template>
				</q-td>
			</template>
			<template v-slot:body-cell-body="props">
				<q-td :props="props" v-if="!props.value">
					<div class="text-grey-7">Empty</div>
				</q-td>
				<q-td :props="props" v-else>
					<template v-if="props.value.length > 50">
						<div
							class="tw-font-bold tw-cursor-pointer tw-underline"
							@click="showBody(props.value)"
						>
							Show body
						</div>
					</template>
					<template v-else>
						<div>{{ props.value }}</div>
					</template>
				</q-td>
			</template>
			<template v-slot:header="props">
				<q-tr :props="props">
					<th v-for="(col, index) in props.cols" :key="col.name" :props="props">
						<div class="tw-inline-flex tw-items-center tw-w-[100%]">
							<q-input
								filled
								dense
								color="secondary"
								class="tw-flex-grow tw-mr-1"
								v-model="filter[index].value"
								:debounce="100"
								:label="col.label"
							/>
							<template v-if="pagination.sortBy === col.name">
								<q-icon
									:name="
										pagination.descending
											? 'sym_o_arrow_downward'
											: 'sym_o_arrow_upward'
									"
									size="sm"
									class="tw-cursor-pointer"
									@click="updateSort()"
								/>
							</template>
							<template v-else>
								<q-icon
									name="sym_o_sort_by_alpha"
									size="sm"
									@click="setSort(col.name)"
									color="grey-7"
									class="tw-cursor-pointer"
								/>
							</template>
						</div>
					</th>
				</q-tr>
			</template>
		</q-table>
	</div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue';
import { Audit } from 'pages/settings/types/audit';
import { towerAxios } from 'boot/axios';
import { QTableProps, useQuasar } from 'quasar';

//====================================================
// Const
//====================================================
const $q = useQuasar();

//====================================================
// Interfaces
//====================================================
interface Filter {
	name: string;
	value: string;
}

//====================================================
// Data
//====================================================
const currentAudit: Ref<Array<Audit>> = ref([]);

const bodyToShow = ref('');
const showBodyDialog = ref(false);

const queryToShow = ref('');
const showQueryDialog = ref(false);

const loading = ref(false);

const pagination = ref({
	sortBy: '',
	descending: false,
	page: 1,
	rowsPerPage: 20,
	rowsNumber: 0,
});

const columns = [
	{
		name: 'entity',
		required: true,
		label: 'Entity',
		align: 'left',
		field: 'entity',
		sortable: true,
	},
	{
		name: 'url',
		align: 'left',
		style: 'min-width: 10rem',
		label: 'URL',
		field: 'url',
		sortable: true,
	},
	{
		name: 'method',
		align: 'left',
		style: 'min-width: 10rem',
		label: 'Method',
		field: 'method',
		sortable: true,
	},
	{
		name: 'query',
		align: 'left',
		style: 'min-width: 10rem',
		label: 'Query',
		field: 'query',
		sortable: true,
	},
	{
		name: 'body',
		align: 'left',
		style: 'min-width: 10rem',
		label: 'Body',
		field: 'body',
		sortable: true,
	},
	{
		name: 'status',
		align: 'left',
		style: 'min-width: 5rem; max-width: 5rem',
		label: 'Status',
		field: 'status',
		sortable: true,
	},
	{
		name: 'statusCode',
		align: 'left',
		style: 'min-width: 5rem; max-width: 5rem',
		label: 'Status code',
		field: 'statusCode',
		sortable: true,
	},
	{
		name: 'errorDescription',
		align: 'left',
		style: 'min-width: 10rem',
		label: 'Error description',
		field: 'errorDescription',
		sortable: true,
	},
	{
		name: 'user',
		align: 'left',
		style: 'min-width: 10rem',
		label: 'User',
		field: (val: Audit) => val.userId?.username,
		sortable: true,
	},
	{
		name: 'date',
		align: 'left',
		style: 'min-width: 10rem',
		label: 'Date',
		field: 'date',
		sortable: true,
		format: (val: Date) => `${new Date(val).toLocaleString()}`,
	},
];

const filter: Ref<Array<Filter>> = ref([]);
columns.forEach((el, index) => {
	filter.value.push({
		value: '',
		name: columns[index].name,
	});
});

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getCurrentPage(pagination.value.page - 1);
});

//====================================================
// Methods
//====================================================
const getCurrentPage = async (page: number) => {
	loading.value = true;

	const userRelation: any = {
		relation: 'member',
	};

	let filterExists = false;
	const where: any = {};
	filter.value.forEach((el) => {
		if (el.value) {
			if (el.name !== 'user') {
				where[el.name] = { ilike: el.value };
			} else {
				where['user'] = el.value;
			}
			filterExists = true;
		}
	});

	let tempPagination: any = undefined;
	if (pagination.value.sortBy) {
		tempPagination = {};
		if (pagination.value.sortBy === 'user') {
			tempPagination['member.username'] = pagination.value.descending ? -1 : 1;
		} else {
			tempPagination[pagination.value.sortBy] = pagination.value.descending
				? -1
				: 1;
		}
	}

	const queryFilter = {
		skip: page * pagination.value.rowsPerPage,
		limit: pagination.value.rowsPerPage,
		include: userRelation,
		order: tempPagination,
		where: filterExists ? where : undefined,
	};

	const countFilter = {
		include: userRelation,
		order: pagination.value.sortBy
			? `${pagination.value.sortBy} ${
					pagination.value.descending ? 'DESC' : 'ASC'
			  }`
			: undefined,
		where: filterExists ? where : undefined,
	};

	let response = await towerAxios.get(
		`/audits?filter=${JSON.stringify(queryFilter, undefined, '')}`
	);

	if (response.status === 200) {
		currentAudit.value = response.data;
	}

	response = await towerAxios.get(
		`/audits/count?filter=${JSON.stringify(countFilter, undefined, '')}`
	);
	if (response.status === 200) {
		pagination.value.rowsNumber = response.data?.count
			? response.data?.count
			: 0;
	}

	loading.value = false;
};

/**
 * onRequest
 */
const onRequest = async (props: QTableProps) => {
	if (props.pagination?.page) {
		pagination.value = {
			page: props.pagination.page,
			rowsPerPage: props.pagination.rowsPerPage
				? props.pagination?.rowsPerPage
				: 10,
			descending: props.pagination.descending
				? props.pagination?.descending
				: false,
			rowsNumber: props.pagination.rowsNumber
				? props.pagination?.rowsNumber
				: 1,
			sortBy: props.pagination.sortBy ? props.pagination?.sortBy : 'desc',
		};
		await getCurrentPage(props.pagination.page - 1);
	}
};

/**
 * setSort
 */
const setSort = async (colName: string) => {
	pagination.value.sortBy = colName;
	pagination.value.descending = false;

	await getCurrentPage(pagination.value.page - 1);
};

/**
 * updateSort
 */
const updateSort = async () => {
	if (!pagination.value.descending) {
		pagination.value.descending = true;
	} else {
		pagination.value.sortBy = '';
	}

	await getCurrentPage(pagination.value.page - 1);
};

/**
 * showBody
 */
const showBody = (body: string) => {
	bodyToShow.value = body;
	showBodyDialog.value = true;
};

/**
 * showQuery
 */
const showQuery = (query: string) => {
	queryToShow.value = query;
	showQueryDialog.value = true;
};

//====================================================
// Watch
//====================================================
watch(
	() => filter.value,
	async () => {
		await getCurrentPage(pagination.value.page - 1);
	},
	{ deep: true }
);
</script>

<style scoped lang="scss">
.tower-max-size {
	max-width: calc(100vw - 12rem);
	overflow: auto;
}

.tower-max-size-sm {
	max-width: calc(100vw - 6rem);
	overflow: auto;
}

.tower-sticky-header-table {
	max-height: calc(100vh - 10rem);

	thead tr:first-child th {
		background-color: $dark;
	}

	thead tr th {
		position: sticky;
		z-index: 1;
	}

	thead tr:first-child th {
		top: 0;
	}

	&.q-table--loading thead tr:last-child th {
		/* height of all previous header rows */
		top: 48px;
	}
}
</style>
