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

export interface Audit {
	entity: string;
	url: string;
	method: string;
	user: string;
	query: string;
	status: AuditStatus;
	statusCode: string;
	errorDescription: string;
	date: Date;
	id: string;
}

export enum AuditStatus {
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
}
