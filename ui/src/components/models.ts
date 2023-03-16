import { ConfigurationVariable } from 'components/configuration/configuration';
import { ConstantVariableValue } from 'components/constantVariables/constantVariable';

export interface Export {
	inputFile: Blob | string | null;
	fileData?: string;
}

export interface ImportDetails {
	configurationVariables?: Array<ConfigurationVariable>;
	constantVariables?: Array<ConstantVariableValue>;
}
