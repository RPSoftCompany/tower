export interface ConfigurationModel {
	name: string;
	rules: Array<ConfigurationModelRule>;
	base: string;
	options: {
		hasRestrictions: boolean;
	};
	restrictions: Array<any>;
	id?: string;
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
	TYPE = 'type'
}

export enum ConfigurationModelRuleConditionType {
	TYPE = 'type',
	VALUE = 'value'
}
