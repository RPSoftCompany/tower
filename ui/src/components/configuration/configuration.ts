import { ConfigurationVariableType } from 'components/constantVariables/constantVariable';
import { Member } from 'components/user/user';

export interface Configuration {
	effectiveDate: Date;
	variables: Array<ConfigurationVariable>;
	createdBy: string;
	promoted: boolean;
	description: string;
	version: number;
	draft: boolean;
	id: string;
	member?: Member;
}

export interface ConfigurationVariable {
	name: string;
	type: ConfigurationVariableType;
	value: string | number | Array<string> | boolean | null | undefined;
}

export interface ConfigurationVariableToDisplay extends ConfigurationVariable {
	deleted?: boolean;
	constantVariable?: boolean;
	forced?: boolean;
	addIfAbsent?: boolean;
	error?: string;
}
