<template>
	<q-item
		class="tw-px-2 2xl:tw-py-1 tw-py-0 tw-mb-1 2xl:tw-mx-2 tw-mx-3 tw-rounded 2xl:tw-min-h-[2.25rem] tw-min-h-[2rem]"
		clickable
		tag="div"
	>
		<q-menu anchor="top right">
			<q-list>
				<q-item>
					<q-item-section class="tw-flex tw-min-w-[6rem] tw-max-w-[13rem]">
						<q-icon
							class="filled tw-self-center"
							name="sym_o_account_circle"
							size="lg"
						></q-icon>
						<div
							class="tw-mt-2 tw-self-center tw-font-medium tw-text-sm fullWordWrap"
						>
							{{ userSt.name }}
						</div>
					</q-item-section>
				</q-item>
				<q-item clickable @click="changePassword" v-if="!userSt.isLdapUser">
					<q-item-section>Change password</q-item-section>
				</q-item>
				<q-item clickable @click="logout">
					<q-item-section>Logout</q-item-section>
				</q-item>
			</q-list>
		</q-menu>
		<div class="tw-flex tw-w-full tw-justify-center 2xl:tw-justify-start">
			<q-icon
				:size="$q.screen.gt.lg ? 'xs' : 'sm'"
				class="tw-self-center 2xl:tw-mr-2 tw-grow 2xl:tw-grow-0 filled"
				name="sym_o_account_circle"
			>
			</q-icon>
			<div
				class="tw-text-xs tw-self-center tw-grow tw-justify-self-center 2xl:tw-block tw-hidden tw-truncate"
			>
				{{ userSt.name }}
			</div>
			<q-icon
				class="tw-self-center tw-transition-all tw-text-secondary"
				name="sym_o_chevron_right"
				size="xs"
			/>
		</div>
	</q-item>
</template>

<script lang="ts" setup>
import {userStore} from 'stores/user';
import {useRouter} from 'vue-router';

const userSt = userStore();
const router = useRouter();

//====================================================
// Methods
//====================================================
/**
 * logout
 */
const logout = () => {
	userSt.logout();
	router.push({name: 'Login'});
};

/**
 * changePassword
 */
const changePassword = () => {
	router.push({name: 'ChangePassword'});
};
</script>

<style scoped></style>
