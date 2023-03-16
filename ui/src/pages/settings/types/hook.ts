export interface Hook {
	url: string;
	description?: string;
	template: string;
	method: string;
	headers?: Array<HookHeader>;
	_id?: string;
}

export interface HookParent {
	id?: string;
	method: string;
	model: string;
	hooks: Array<Hook>;
}

export interface HookHeader {
	name: string;
	value: string;
}
