import { Configuration } from 'components/configuration/configuration';

export interface ArchiveConfig {
	id: number;
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
