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
import { userStore } from 'stores/user';
import { useRouter } from 'vue-router';
import { basesStore } from 'stores/bases';

const userSt = userStore();
const router = useRouter();
const baseSt = basesStore();

//====================================================
// Methods
//====================================================
/**
 * logout
 */
const logout = () => {
	userSt.logout();
	baseSt.reset();
	router.push({ name: 'Login' });
};

/**
 * changePassword
 */
const changePassword = () => {
	router.push({ name: 'ChangePassword' });
};
</script>

<style scoped></style>
