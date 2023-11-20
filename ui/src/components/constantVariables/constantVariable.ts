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

import { Member } from 'components/user/user';

export interface ConstantVariable {
	effectiveDate: Date;
	variables: Array<ConstantVariableValue>;
	id: string;
	createdBy?: Member;
}

export interface ConstantVariableValue {
	name: string;
	value: string | number | Array<string> | boolean | null | undefined;
	valueKey?: string;
	type: ConfigurationVariableType;
	forced: boolean;
	addIfAbsent: boolean;
	deleted?: boolean;
}

export interface ConstantVariableValueToDisplay extends ConstantVariableValue {
	isNew?: boolean;
	sourceModel?: string;
	sourceBase?: string;
}

export interface ConstantVariableValueToDisplay extends ConstantVariableValue {
	from?: string;
	currentType?: ConfigurationVariableType;
	currentValue?: string | number | Array<string> | boolean | null | undefined;
}

export enum ConfigurationVariableType {
	STRING = 'string',
	TEXT = 'text',
	NUMBER = 'number',
	LIST = 'list',
	BOOLEAN = 'boolean',
	PASSWORD = 'password',
	VAULT = 'Vault',
	AWS = 'AWS SM',
}

export interface typeInterface {
	label: string;
	value: ConfigurationVariableType;
	icon: string;
	valueKey?: string;
}

export const typeOptions: Array<typeInterface> = [
	{
		label: 'String',
		value: ConfigurationVariableType.STRING,
		icon: 'sym_o_text_fields',
	},
	{
		label: 'Password',
		value: ConfigurationVariableType.PASSWORD,
		icon: 'sym_o_password',
	},
	{
		label: 'Text',
		value: ConfigurationVariableType.TEXT,
		icon: 'sym_o_edit_note',
	},
	{
		label: 'Number',
		value: ConfigurationVariableType.NUMBER,
		icon: 'sym_o_numbers',
	},
	{
		label: 'Boolean',
		value: ConfigurationVariableType.BOOLEAN,
		icon: 'sym_o_exposure',
	},
	{
		label: 'List',
		value: ConfigurationVariableType.LIST,
		icon: 'sym_o_list',
	},
	{
		label: 'Vault',
		value: ConfigurationVariableType.VAULT,
		icon: 'sym_o_text_fields',
	},
	{
		label: 'AWS',
		value: ConfigurationVariableType.AWS,
		icon: 'sym_o_enhanced_encryption',
	},
];

export const valueConverter = (
	value: string | number | boolean | string[] | null | undefined | unknown,
	type: ConfigurationVariableType
) => {
	if (
		type === ConfigurationVariableType.STRING ||
		type === ConfigurationVariableType.PASSWORD ||
		type === ConfigurationVariableType.TEXT ||
		type === ConfigurationVariableType.VAULT ||
		type === ConfigurationVariableType.AWS
	) {
		if (!valueExists(value)) {
			return '';
		} else {
			if (Array.isArray(value)) {
				return `[${value}]`;
			}

			return `${value}`;
		}
	} else if (type === ConfigurationVariableType.NUMBER) {
		if (!valueExists(value)) {
			return 0;
		} else {
			const tempValue = Number(value);
			if (isNaN(tempValue)) {
				return 0;
			}

			return tempValue;
		}
	} else if (type === ConfigurationVariableType.BOOLEAN) {
		if (!valueExists(value)) {
			return false;
		} else {
			return ['true', 1].includes(`${value}`);
		}
	} else if (type === ConfigurationVariableType.LIST) {
		if (!valueExists(value)) {
			return [];
		} else {
			if (Array.isArray(value)) {
				const tempArray = [];
				for (const temp of value) {
					tempArray.push(`${temp}`);
				}
				return tempArray;
			} else {
				try {
					const tempValue = JSON.parse(`${value}`);
					if (Array.isArray(tempValue)) {
						const tempArray = [];
						for (const temp of tempValue) {
							tempArray.push(`${temp}`);
						}
						return tempArray;
					} else {
						return [];
					}
				} catch (e) {
					return [];
				}
			}
		}
	}
};

export const valueAsString = (
	value: string | number | boolean | string[] | null | undefined | unknown
) => {
	return valueConverter(value, ConfigurationVariableType.STRING) as string;
};

export const valueExists = (
	value: string | number | boolean | string[] | null | undefined | unknown
) => {
	return !(value === undefined || value === null || value === '');
};
