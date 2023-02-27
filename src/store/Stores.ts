import dayjs from "dayjs";
import { every } from "lodash";
import { Column, Option, Store } from "../interfaces";
import { columns, columns2, columns3, columns4 } from "./Constants";
import { domain } from "./Domains";
import {
  addRemoveColumn,
  addRemoveColumn2,
  addRemoveColumn3,
  addRemoveColumn4,
  changeCode,
  changePeriod,
  changeRelationshipTypes,
  changeTotal,
  setColumn4,
  setCurrentProgram,
  setCurrentStage,
  setDistricts,
  setProgram,
  setSelectedOrgUnits,
  setSessions,
  setSubCounties,
  setUserOrgUnits,
  toggleColumns,
  toggleColumns2,
  toggleColumns3,
  toggleColumns4,
} from "./Events";
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
    period: dayjs(),
    columns: columns,
    columns2: columns2,
    columns3: columns3,
    columns4: [],
    sessions: {},
    code: "",
    subCounties: {},
    districts: [],
    currentProgram: {},
    currentStage: "",
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
  .on(addRemoveColumn3, (state, { id, value }) => {
    const processed = state.columns3.map((column) => {
      if (id === column.id) {
        return { ...column, selected: value };
      }
      return column;
    });
    return { ...state, columns3: processed };
  })
  .on(addRemoveColumn4, (state, { id, value }) => {
    const processed = state.columns4.map((column) => {
      if (id === column.id) {
        return { ...column, selected: value };
      }
      return column;
    });
    return { ...state, columns4: processed };
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
  .on(toggleColumns3, (state, value) => {
    const processed = state.columns3.map((column) => {
      return { ...column, selected: value };
    });
    return { ...state, columns2: processed };
  })
  .on(toggleColumns4, (state, value) => {
    const processed = state.columns4.map((column) => {
      return { ...column, selected: value };
    });
    return { ...state, columns4: processed };
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
  })
  .on(setCurrentProgram, (state, currentProgram) => {
    return { ...state, currentProgram };
  })
  .on(setCurrentStage, (state, currentStage) => {
    return { ...state, currentStage };
  })
  .on(setColumn4, (state, columns4) => {
    return { ...state, columns4 };
  });

export const $columns = $store.map((state) => {
  return state.columns.filter((c) => c.selected);
});
export const $columns2 = $store.map((state) => {
  return state.columns2.filter((c) => c.selected);
});

export const $stages = $store.map((state) => {
  return (
    state.currentProgram?.programStages?.map(({ id, name }: any) => {
      const a: Option = {
        value: id,
        label: name,
      };
      return a;
    }) || []
  );
});
export const $columns4 = $store.map((state) => {
  return state.columns4.filter((c) => c.selected);
});
export const $columns3 = $store.map((state) => {
  return state.columns3.filter((c) => c.selected);
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
