import { columns } from "./Constants";
import { Store } from "../interfaces";
import { domain } from "./Domains";
import {
  setUserOrgUnits,
  setSelectedOrgUnits,
  changeRelationshipTypes,
  setProgram,
  changeTotal,
  changePeriod,
  addRemoveColumn,
} from "./Events";
import moment from "moment";

export const $store = domain
  .createStore<Store>({
    loading: false,
    selectedOrgUnits: [],
    userOrgUnits: [],
    relationshipTypes: [],
    selectedProgram: "RDEklSXCD4C",
    program: {},
    total: 0,
    period: moment(),
    columns: columns,
  })
  .on(setUserOrgUnits, (state, userOrgUnits) => {
    return { ...state, userOrgUnits };
  })
  .on(setSelectedOrgUnits, (state, selectedOrgUnits) => {
    return { ...state, selectedOrgUnits };
  })
  .on(changeRelationshipTypes, (state, relationshipTypes) => {
    return { ...state, relationshipTypes };
  })
  .on(setProgram, (state, program) => {
    return { ...state, program };
  })
  .on(changeTotal, (state, total) => {
    return { ...state, total };
  })
  .on(changePeriod, (state, period) => {
    return { ...state, period };
  })
  .on(addRemoveColumn, (state, { id, value }) => {
    const processed = state.columns.map((column) => {
      if (id === column.id) {
        return { ...column, selected: value };
      }
      return column;
    });
    return { ...state, columns: processed };
  });

export const $columns = $store.map((state) => {
  return state.columns.filter((c) => c.selected);
});
