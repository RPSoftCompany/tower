<template>
	<div class="tw-flex tw-flex-col tw-h-full">
		<div class="tw-flex tw-flex-col tw-items-center tw-overflow-auto">
			<tower-select
				v-model="currentUser"
				v-model:filter="inputValue"
				:loading="loading"
				:options="allUsers"
				class="tw-w-[33.3%]"
				label="User"
				option-label="display"
			>
				<template #before>
					<q-icon name="sym_o_person" size="sm" />
				</template>
				<template #after>
					<q-btn v-if="inputValue" flat padding="sm" @click="addUser">
						<q-icon name="sym_o_add" />
					</q-btn>
				</template>
			</tower-select>
			<transition
				enter-active-class="animated fadeIn"
				leave-active-class="animated fadeOut"
			>
				<div v-if="currentUserClone" class="tw-flex tw-w-full tw-gap-3">
					<div class="tw-flex-grow">
						<div
							class="tw-mt-5 tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
						>
							<div class="tw-text-xl tw-font-medium tw-mb-3 tw-px-3">
								User details
							</div>
							<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
							<div class="tw-flex tw-pl-1">
								<q-icon
									name="sym_o_account_circle"
									class="filledLight"
									size="4rem"
								/>
								<div
									class="tw-text-secondary tw-pl-3 tw-self-center tw-text-xl tw-font-extralight"
								>
									{{ currentUserClone.display }}
								</div>
							</div>
							<div class="tw-flex tw-flex-col tw-mx-3 tw-mt-1 tw-text-sm">
								<!-- Status -->
								<div v-if="currentUserClone.username !== 'admin'">
									<div class="tw-text-gray-500 tw-text-base">Status</div>
									<template
										v-if="
											!currentUser ||
											currentUserClone.blocked === currentUser?.blocked
										"
									>
										<div
											class="tw-ml-3"
											:class="{
												'tw-text-negative': currentUserClone.blocked,
												'tw-text-positive': !currentUserClone.blocked,
											}"
										>
											{{ currentUserClone.blocked ? 'Blocked' : 'Active' }}
										</div>
									</template>
									<template v-else>
										<span
											class="tw-ml-3"
											:class="{
												'tw-text-negative': currentUser?.blocked,
												'tw-text-positive': !currentUser?.blocked,
											}"
										>
											{{ currentUser?.blocked ? 'Blocked' : 'Active' }}
										</span>
										<q-icon
											name="sym_o_arrow_forward"
											size="0.875rem"
											class="tw-mb-1 tw-ml-3"
										/>
										<span
											class="tw-ml-3"
											:class="{
												'tw-text-negative': currentUserClone.blocked,
												'tw-text-positive': !currentUserClone.blocked,
											}"
										>
											{{ currentUserClone.blocked ? 'Blocked' : 'Active' }}
										</span>
									</template>
								</div>
								<!-- Type -->
								<div>
									<div class="tw-text-gray-500 tw-text-base tw-mt-2">Type</div>
									<div class="tw-pl-3">{{ currentUserClone.type }}</div>
								</div>
								<template v-if="currentUserClone.type === UserType.LDAP">
									<!-- dn -->
									<div class="tw-text-gray-500 tw-text-base tw-mt-2">DN</div>
									<div class="tw-pl-3">{{ currentUserClone.dn }}</div>
								</template>
								<template v-else>
									<!-- Technical user -->
									<div v-if="currentUserClone.username !== 'admin'">
										<div class="tw-text-gray-500 tw-text-base tw-mt-2">
											Technical user
										</div>
										<template
											v-if="
												!currentUser ||
												currentUser?.technicalUser ===
													currentUserClone.technicalUser
											"
										>
											<div class="tw-ml-3">
												{{ currentUserClone.technicalUser ? 'Yes' : 'No' }}
											</div>
										</template>
										<template v-else>
											<div class="tw-text-accent">
												<span class="tw-ml-3">{{
													currentUser?.technicalUser ? 'Yes' : 'No'
												}}</span>
												<q-icon
													name="sym_o_arrow_forward"
													size="0.875rem"
													class="tw-pb-1 tw-ml-3"
												/>
												<span class="tw-ml-3">{{
													currentUserClone.technicalUser ? 'Yes' : 'No'
												}}</span>
											</div>
										</template>
									</div>
									<!-- Force password reset -->
									<div>
										<div class="tw-text-gray-500 tw-text-base tw-mt-2">
											Force password reset
										</div>
										<template
											v-if="
												!currentUser ||
												currentUser?.newUser === currentUserClone.newUser
											"
										>
											<div class="tw-ml-3">
												{{ currentUserClone.newUser ? 'Yes' : 'No' }}
											</div>
										</template>
										<template v-else>
											<div class="tw-text-accent">
												<span class="tw-ml-3">{{
													currentUser?.newUser ? 'Yes' : 'No'
												}}</span>
												<q-icon
													name="sym_o_arrow_forward"
													size="0.875rem"
													class="tw-pb-1 tw-ml-3"
												/>
												<span class="tw-ml-3">
													{{ currentUserClone.newUser ? 'Yes' : 'No' }}
												</span>
											</div>
										</template>
									</div>
								</template>
								<template v-if="accessToken">
									<div>
										<div class="tw-text-gray-500 tw-text-base tw-mt-2">
											Technical access token
										</div>
										<div class="tw-pl-3">{{ accessToken }}</div>
									</div>
								</template>
							</div>
						</div>
						<div
							v-if="currentUserClone.username !== 'admin'"
							class="tw-mt-3 tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
						>
							<div class="tw-text-xl tw-font-medium tw-mb-3 tw-px-3">
								User groups
							</div>
							<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
							<tower-select
								v-model="currentUserClone.groups"
								:options="allGroups"
								class="tw-w-full tw-my-2 tw-px-3"
								label="User groups"
								multiple
								use-chips
								use-input
								:dense="false"
							>
								<template #option="scope">
									<q-item v-bind="scope.itemProps">
										<q-item-section avatar>
											<q-icon
												:name="
													scope.selected
														? 'sym_o_check_box'
														: 'sym_o_check_box_outline_blank'
												"
												class="heavy"
												size="sm"
											/>
										</q-item-section>
										<q-item-section>
											<q-item-label>{{ scope.opt }}</q-item-label>
										</q-item-section>
									</q-item>
								</template>
								<template v-slot:selected>
									<template
										v-for="group of currentUserClone.groups"
										:key="group"
									>
										<template v-if="currentUser?.groups.includes(group)">
											<q-chip
												dense
												color="dark"
												text-color="secondary"
												class="tw-px-3 tw-border tw-border-gray-500"
												>{{ group }}
											</q-chip>
										</template>
										<template v-else>
											<q-chip
												dense
												color="secondary"
												text-color="dark"
												class="tw-px-3 tw-border tw-border-gray-500"
												>{{ group }}
											</q-chip>
										</template>
									</template>
								</template>
							</tower-select>
						</div>
					</div>
					<div class="tw-w-[20rem]">
						<div
							v-if="currentUserClone.type !== 'ldap' && currentUser"
							class="tw-mt-5 tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
						>
							<div class="tw-text-xl tw-font-medium tw-mx-3">
								Reset password
							</div>
							<div class="tw-text-gray-500 tw-mx-3">
								User password will be changed to
								<span class="tw-font-black">changeme</span>
								and will be prompted to change it during the next login
							</div>
							<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
							<q-btn
								class="tw-bg-secondary tw-mx-3 tw-flex-grow"
								flat
								text-color="primary"
								@click="resetPassword"
							>
								<q-icon
									class="tw-mr-3"
									color="primary"
									name="sym_o_lock_reset"
									size="sm"
								/>
								{{
									currentUserClone.newUser
										? 'Undo password reset'
										: 'Reset user password'
								}}
							</q-btn>
						</div>
						<div
							v-if="currentUserClone.username !== 'admin'"
							:class="{
								'tw-mt-5': currentUserClone.type === 'ldap' || !currentUser,
								'tw-mt-3': currentUserClone.type !== 'ldap' && currentUser,
							}"
							class="tw-flex tw-flex-col tw-py-3 tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
						>
							<div class="tw-text-xl tw-mx-3 tw-font-medium">Block user</div>
							<div class="tw-text-gray-500 tw-mx-3">Lock user account</div>
							<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
							<q-btn
								v-if="currentUserClone.username !== 'admin'"
								class="tw-bg-secondary tw-mx-3 tw-flex-grow"
								flat
								text-color="primary"
								@click="blockUser"
							>
								<q-icon
									class="tw-mr-3"
									color="primary"
									name="sym_o_lock"
									size="sm"
								/>
								{{ !currentUserClone.blocked ? 'Block user' : 'Unblock user' }}
							</q-btn>
						</div>
						<div
							v-if="
								currentUserClone.type !== 'ldap' &&
								currentUserClone.username !== 'admin'
							"
							class="tw-mt-3 tw-py-3 tw-flex tw-flex-col tw-self-start tw-rounded tw-border tw-border-dark tw-bg-dark"
						>
							<div class="tw-text-xl tw-mx-3 tw-font-medium">
								Technical user
							</div>
							<div class="tw-text-gray-500 tw-mx-3">
								<div>
									Technical users access token never expire, but they're not
									able to login to the user interface.
								</div>
								<div>Use this feature for your scripts and API execution</div>
							</div>
							<q-separator spaced class="tw-bg-darkPage tw-mx-[-1px]" />
							<q-btn
								class="tw-bg-secondary tw-mx-3 tw-flex-grow"
								@click="setAsTechnical"
								flat
								text-color="primary"
							>
								<q-icon
									class="tw-mr-3"
									color="primary"
									name="sym_o_api"
									size="sm"
								/>
								{{
									currentUserClone.technicalUser
										? 'Revoke technical user'
										: 'Set as technical user'
								}}
							</q-btn>
						</div>
					</div>
				</div>
			</transition>
		</div>
		<div class="tw-justify-self-end">
			<save-panel
				v-if="currentUserClone"
				:save-enabled="isDifferent"
				@save-clicked="saveUser"
				:loading="loading"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import TowerSelect from 'components/basic/towerSelect.vue';
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { User, UserType } from 'pages/settings/types/user';
import { towerAxios } from 'boot/axios';
import { Group } from 'pages/settings/types/group';
import SavePanel from 'components/basic/savePanel.vue';
import { useQuasar } from 'quasar';
import { navigationStore } from 'stores/navigation';

//====================================================
// Const
//====================================================
const $q = useQuasar();
const navigationSt = navigationStore();

//====================================================
// Data
//====================================================
const allUsers: Ref<Array<User>> = ref([]);
const currentUser: Ref<User | null> = ref(null);
const currentUserClone: Ref<User | null> = ref(null);

const allGroups: Ref<Array<string>> = ref([]);

const loading = ref(false);

const inputValue = ref('');

const accessToken = ref('');

let newUser = false;

//====================================================
// onMounted
//====================================================
onMounted(async () => {
	await getUsers();
});

//====================================================
// Computed
//====================================================
const isDifferent = computed(() => {
	if (currentUserClone.value && currentUser.value) {
		if (currentUserClone.value.newUser !== currentUser.value.newUser) {
			return true;
		}

		if (currentUserClone.value.blocked !== currentUser.value.blocked) {
			return true;
		}

		if (
			currentUserClone.value.technicalUser !== currentUser.value.technicalUser
		) {
			return true;
		}

		if (
			currentUserClone.value.groups.length !== currentUser.value.groups.length
		) {
			return true;
		}

		return currentUserClone.value.groups.some((cloneGroup) => {
			return !currentUser.value?.groups.some((el) => {
				return el === cloneGroup;
			});
		});
	} else if (!currentUser.value && currentUserClone.value) {
		return true;
	}

	return false;
});

//====================================================
// Methods
//====================================================
/**
 * getUsers
 */
const getUsers = async () => {
	loading.value = true;

	const filterUsers = {
		order: 'username ASC',
	};

	const responseUsers = await towerAxios.get(
		`/members?filter=${JSON.stringify(filterUsers, undefined, '')}`
	);
	if (responseUsers.status === 200) {
		allUsers.value = [];
		responseUsers.data.forEach((user: User) => {
			allUsers.value.push({
				newUser: user.newUser,
				groups: user.groups,
				blocked: user.blocked,
				technicalUser: user.technicalUser,
				display: user.type === 'ldap' ? user.display : user.username,
				dn: user.dn,
				type: user.type,
				username: user.username,
				id: user.id,
				realm: user.realm,
			});
		});
	}

	const filterGroups = {
		order: 'name ASC',
	};

	const responseGroups = await towerAxios.get(
		`/groups?$filter=${JSON.stringify(filterGroups, undefined, '')}`
	);
	if (responseGroups.status === 200) {
		allGroups.value = [];
		responseGroups.data.forEach((group: Group) => {
			allGroups.value.push(group.name);
		});
	}

	loading.value = false;
};

/**
 * setAsTechnical
 */
const setAsTechnical = () => {
	if (currentUserClone.value) {
		currentUserClone.value.technicalUser =
			!currentUserClone.value.technicalUser;
	}
};

/**
 * blockUser
 */
const blockUser = () => {
	if (currentUserClone.value) {
		currentUserClone.value.blocked = !currentUserClone.value.blocked;
	}
};

/**
 * resetPassword
 */
const resetPassword = () => {
	if (currentUserClone.value) {
		currentUserClone.value.newUser = !currentUserClone.value.newUser;
	}
};

/**
 * addUser
 */
const addUser = () => {
	newUser = true;
	currentUser.value = null;
	currentUserClone.value = {
		newUser: true,
		password: 'changeme',
		technicalUser: false,
		groups: [],
		blocked: false,
		username: inputValue.value,
		type: UserType.LOCAL,
		display: inputValue.value,
	};
};

/**
 * saveUser
 */
const saveUser = async () => {
	if (!currentUserClone.value) {
		return;
	}

	loading.value = true;

	let toSave: User = currentUserClone.value;

	if (toSave.type === 'local') {
		toSave = {
			type: UserType.LOCAL,
			blocked: toSave.blocked,
			username: toSave.username,
			technicalUser: toSave.technicalUser,
			newUser: toSave.newUser,
			groups: toSave.groups,
		};
	}

	if (currentUserClone.value.newUser && !currentUser.value?.newUser) {
		toSave.password = 'changeme';
	}

	try {
		if (!newUser) {
			await towerAxios.patch(`/members/${currentUserClone.value.id}`, toSave);
		} else {
			await towerAxios.post('/members', toSave);
		}

		await getUsers();

		const user = allUsers.value.find((el) => {
			if (newUser) {
				return el.username === currentUserClone.value?.username;
			} else {
				return el.id === currentUser.value?.id;
			}
		});

		if (user) {
			if (
				currentUserClone.value.technicalUser !==
				currentUser.value?.technicalUser
			) {
				await towerAxios.post(
					`/members/setAsTechnicalUser?isTechUser=${currentUserClone.value.technicalUser}&userId=${user.id}`
				);
			}

			currentUser.value = user;
		}
	} catch (e) {
		$q.notify({
			color: 'negative',
			position: 'top',
			textColor: 'secondary',
			icon: 'sym_o_error',
			message: 'Error saving user data',
		});

		loading.value = false;
		return;
	}

	$q.notify({
		color: 'positive',
		position: 'top',
		textColor: 'secondary',
		message: 'User data saved successfully',
	});

	loading.value = false;
};

//====================================================
// watch
//====================================================
watch(
	() => currentUser.value,
	async (current) => {
		accessToken.value = '';

		if (current) {
			newUser = false;

			if (current.technicalUser) {
				try {
					const response = await towerAxios.get(
						`/members/getTechnicalUserToken?userId=${current.id}`
					);
					if (response.status === 200) {
						accessToken.value = response.data;
					}
				} catch (e) {
					// IGNORE
				}
			}

			currentUserClone.value = {
				username: current.username,
				technicalUser: current.technicalUser,
				display: current.display,
				groups: [...current.groups],
				dn: current.dn,
				newUser: current.newUser,
				type: current.type,
				realm: current.realm,
				id: current.id,
				blocked: current.blocked,
			};
		} else {
			if (!newUser) {
				currentUserClone.value = null;
			}
		}
	}
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

<style scoped></style>
