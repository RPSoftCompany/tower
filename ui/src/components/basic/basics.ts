/*
 * Copyright RPSoft 2019,2023. All Rights Reserved.
 * This file is part of RPSoft Tower.
 *
 * Tower is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tower is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
 */

import { Configuration } from 'components/configuration/configuration';

export interface ArchiveConfig {
	id: string;
	loading: boolean;
	version?: number;
	effectiveDate?: Date;
	path: string;
	configuration?: Array<Configuration>;
}

export interface VersionChangeEvent {
	configId: number;
	version: number;
}

export interface SwitchPlacesEvent {
	sourceId: string;
	targetId: string;
}
