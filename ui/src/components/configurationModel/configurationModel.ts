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

export interface ConfigurationModel {
	name: string;
	rules: Array<ConfigurationModelRule>;
	base: string;
	options: {
		hasRestrictions: boolean;
		forceComment?: boolean;
		templateEnabled?: boolean;
	};
	template?: Array<boolean>;
	restrictions: Array<any>;
	_id?: string | undefined;
}

export interface ConfigurationModelRule {
	_id: string;
	targetValue: string;
	targetType: ConfigurationModelRuleTargetType;
	targetRegEx: boolean;
	conditionValue: string;
	conditionType: ConfigurationModelRuleConditionType;
	conditionRegEx: boolean;
	error: string;
}

export enum ConfigurationModelRuleTargetType {
	NAME = 'name',
	TYPE = 'type',
}

export enum ConfigurationModelRuleConditionType {
	TYPE = 'type',
	VALUE = 'value',
}
