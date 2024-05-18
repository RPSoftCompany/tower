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

import { ConfigurationVariableType } from 'components/constantVariables/constantVariable';
import { Member } from 'components/user/user';

export interface Configuration {
	effectiveDate: Date;
	variables: Array<ConfigurationVariable>;
	promoted: boolean;
	description: string;
	version: number;
	draft: boolean;
	comment?: string;
	id: string;
	createdBy?: Member | undefined;
}

export interface ConfigurationVariable {
	name: string;
	type: ConfigurationVariableType;
	value: string | number | Array<string> | boolean | null | undefined;
	valueKey?: string;
}

export interface ConfigurationVariableToDisplay extends ConfigurationVariable {
	deleted?: boolean;
	constantVariable?: boolean;
	forced?: boolean;
	addIfAbsent?: boolean;
	error?: string;
	sourceBase?: string;
	sourceModel?: string;
}
