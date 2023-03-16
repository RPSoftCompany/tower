import {Member} from 'components/user/user';

export interface Audit {
	entity: string,
	url: string,
	method: string,
	userId: string,
	query: string,
	status: AuditStatus,
	statusCode: string,
	errorDescription: string,
	date: Date,
	id: string,
	member?: Member
}

export enum AuditStatus {
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR'
}
