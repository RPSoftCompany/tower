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
	<div class="fullscreen bg-darkPage text-center q-pa-md flex flex-center">
		<div>
			<div class="text-secondary" style="font-size: min(30vh, 30vw)">403</div>

			<div
				class="text-secondary"
				style="opacity: 0.4; font-size: min(6vh, 6vw)"
			>
				You have insufficient permissions to view this page
			</div>

			<q-btn
				class="q-mt-xl"
				color="secondary"
				label="Go Home"
				no-caps
				text-color="primary"
				to="/login"
				unelevated
			/>
		</div>
	</div>
</template>

<script lang="ts" setup></script>
