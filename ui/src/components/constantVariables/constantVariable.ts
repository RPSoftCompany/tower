import { Member } from 'components/user/user';

export interface ConstantVariable {
	effectiveDate: Date;
	createdBy: string;
	variables: Array<ConstantVariableValue>;
	id: string;
	member?: Member;
}

export interface ConstantVariableValue {
	name: string;
	value: string | number | Array<string> | boolean | null | undefined;
	type: ConfigurationVariableType;
	forced: boolean;
	addIfAbsent: boolean;
	deleted?: boolean;
}

export interface ConstantVariableValueToDisplay extends ConstantVariableValue {
	isNew?: boolean;
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
}

export interface typeInterface {
	label: string;
	value: ConfigurationVariableType;
	icon: string;
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
];

export const valueConverter = (
	value: string | number | boolean | string[] | null | undefined | unknown,
	type: ConfigurationVariableType
) => {
	if (
		type === ConfigurationVariableType.STRING ||
		type === ConfigurationVariableType.PASSWORD ||
		type === ConfigurationVariableType.TEXT ||
		type === ConfigurationVariableType.VAULT
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
