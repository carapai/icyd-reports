import { ColumnProps } from './../interfaces';

import { domain } from './Domains';

export const changeTotal = domain.createEvent<number>();
export const setSelectedOrgUnits = domain.createEvent<string[]>();
export const setUserOrgUnits = domain.createEvent<any[]>();
export const changeRelationshipTypes = domain.createEvent<any[]>();
export const setProgram = domain.createEvent<any>();
export const setSelectedProgram = domain.createEvent<string>();
export const setColumn = domain.createEvent<any>();
export const changePeriod = domain.createEvent<any>();
export const addRemoveColumn = domain.createEvent<ColumnProps>()