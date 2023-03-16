export interface RestConfiguration {
	url: string;
	returnType: string;
	template: string;
	type: RestConfigurationType;
	sequenceNumber: number;
	id?: string;
}

export enum RestConfigurationType {
	V1 = 'v1',
	V2 = 'v2',
}
