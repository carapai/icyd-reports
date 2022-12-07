import { columns, columns2, columns3 } from "./Constants";
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
  toggleColumns,
  setSessions,
  addRemoveColumn2,
  toggleColumns2,
  changeCode,
  setSubCounties,
  setDistricts,
} from "./Events";
import moment from "moment";
import { every } from "lodash";
import { calculateQuarter } from "./utils";

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
    columns2: columns2,
    columns3: columns3,
    sessions: {},
    code: "",
    subCounties: {},
    districts: [],
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
  })
  .on(addRemoveColumn2, (state, { id, value }) => {
    const processed = state.columns2.map((column) => {
      if (id === column.id) {
        return { ...column, selected: value };
      }
      return column;
    });
    return { ...state, columns2: processed };
  })
  .on(toggleColumns, (state, value) => {
    const processed = state.columns.map((column) => {
      return { ...column, selected: value };
    });
    return { ...state, columns: processed };
  })
  .on(toggleColumns2, (state, value) => {
    const processed = state.columns2.map((column) => {
      return { ...column, selected: value };
    });
    return { ...state, columns2: processed };
  })
  .on(setSessions, (state, sessions) => {
    return { ...state, sessions };
  })
  .on(changeCode, (state, code) => {
    return { ...state, code };
  })
  .on(setSubCounties, (state, subCounties) => {
    return { ...state, subCounties };
  })
  .on(setDistricts, (state, districts) => {
    return { ...state, districts };
  });

export const $columns = $store.map((state) => {
  return state.columns.filter((c) => c.selected);
});
export const $columns2 = $store.map((state) => {
  return state.columns2.filter((c) => c.selected);
});

export const $isChecked = $store.map((state) => {
  return every(state.columns.map((c) => c.selected));
});

export const $financialQuarter = $store.map((state) => {
  const computation = calculateQuarter(
    state.period.year(),
    state.period.quarter()
  );
  return computation;
});
