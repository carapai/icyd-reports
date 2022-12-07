import { ColumnProps, DistrictOption } from "./../interfaces";

import { domain } from "./Domains";

export const changeTotal = domain.createEvent<number>();
export const setSelectedOrgUnits = domain.createEvent<string[]>();
export const setUserOrgUnits = domain.createEvent<any[]>();
export const changeRelationshipTypes = domain.createEvent<any[]>();
export const setProgram = domain.createEvent<any>();
export const setSelectedProgram = domain.createEvent<string>();
export const setColumn = domain.createEvent<any>();
export const changePeriod = domain.createEvent<any>();
export const addRemoveColumn = domain.createEvent<ColumnProps>();
export const addRemoveColumn2 = domain.createEvent<ColumnProps>();
export const toggleColumns = domain.createEvent<boolean>();
export const toggleColumns2 = domain.createEvent<boolean>();
export const setSessions = domain.createEvent<{ [key: string]: string[] }>();
export const changeCode = domain.createEvent<string>();
export const setSubCounties = domain.createEvent<{ [key: string]: any[] }>();
export const setDistricts = domain.createEvent<DistrictOption[]>();
