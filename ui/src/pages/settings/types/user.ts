export interface User {
	groups: Array<string>;
	newUser: boolean;
	technicalUser: boolean;
	type: UserType;
	display?: string;
	password?: string;
	dn?: string;
	realm?: string;
	username: string;
	id?: string;
	blocked?: boolean;
}

export enum UserType {
	LOCAL = 'local',
	LDAP = 'ldap'
}
