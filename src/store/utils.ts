export function s2ab(s: any) {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}
export const calculateQuarter = (
  year: number,
  quarter: number
): [Date, Date] => {
  if (quarter === 1) {
    return [new Date(`${year - 1}-10-01`), new Date(`${year}-03-31`)];
  }
  if (quarter === 2) {
    return [new Date(`${year - 1}-10-01`), new Date(`${year}-06-30`)];
  }
  if (quarter === 3) {
    return [new Date(`${year - 1}-10-01`), new Date(`${year}-09-30`)];
  }
  if (quarter === 4) {
    return [new Date(`${year}-10-01`), new Date(`${year}-12-31`)];
  }
  return [new Date(`${year}-10-01`), new Date(`${year}-12-31`)];
};

export const findQuarters = (year: number, quarter: number) => {
  if (quarter === 1) {
    return [`${year - 1}Q4`, `${year}Q1`];
  }
  if (quarter === 2) {
    return [`${year - 1}Q4`, `${year}Q1`, `${year}Q2`];
  }
  if (quarter === 3) {
    return [`${year - 1}Q4`, `${year}Q1`, `${year}Q2`, `${year}Q3`];
  }
  return [`${year}Q4`];
};

export const innerColumns = (index: number) => {
  if (index === 0) {
    return {
      position: "sticky",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      backgroundColor: "white",
      zIndex: 100,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      w: "250px",
      minW: "250px",
      maxWidth: "250px",
      left: "200px",
      backgroundColor: "white",
      zIndex: 100,
    } as any;
  }
  return {} as any;
};

export const otherRows = (index: number, bg: string = "white") => {
  if (index === 0) {
    return {
      position: "sticky",
      backgroundColor: "white",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      top: "0px",
      zIndex: 2000,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      backgroundColor: "white",
      w: "200px",
      minW: "200px",
      maxWidth: "200px",
      left: "200px",
      top: "0px",
      zIndex: 2000,
    } as any;
  }
  return {
    top: "0px",
    position: "sticky",
    bg,
    // textAlign: "center",
    zIndex: 1000,
  } as any;
};

export const ovcTrackerFreezes = (index: number) => {
  if (index === 0) {
    return {
      position: "sticky",
      // backgroundColor: "white",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      top: "0px",
      zIndex: 2000,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      w: "200px",
      minW: "200px",
      maxWidth: "200px",
      left: "200px",
      top: "0px",
      zIndex: 2000,
    } as any;
  }
  return {
    top: "0px",
    position: "sticky",
  } as any;
};

export const ovcTrackerInnerColumns = (index: number) => {
  if (index === 0) {
    return {
      position: "sticky",
      w: "200px",
      minWidth: "200px",
      maxWidth: "200px",
      left: "0px",
      zIndex: 100,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      w: "250px",
      minW: "250px",
      maxWidth: "250px",
      left: "200px",
      zIndex: 100,
    } as any;
  }
  return {} as any;
};

export const secondHeader = (): any => {
  return {
    position: "sticky",
    top: "50px",
    zIndex: 10000,
  };
};

export const indicatorReportQueries = {
  OVC_SERV: {
    sum: {
      field: "OVC_SERV",
    },
  },
  // OVC_SERV_SUBPOP: {
  //   sum: {
  //     field: "OVC_SERV_SUBPOP",
  //   },
  // },
  // OVC_TST_ASSESS: {
  //   sum: {
  //     field: "riskAssessment",
  //   },
  // },
  OVC_TST_RISK: {
    sum: {
      field: "isAtRisk",
    },
  },
  OVC_TST_REFER: {
    sum: {
      field: "OVC_TST_REFER",
    },
  },
  OVC_TST_REPORT: {
    sum: {
      field: "OVC_TST_REPORT",
    },
  },
  OVC_VL_ELIGIBLE: {
    sum: {
      field: "ovcEligible",
    },
  },
  OVC_VLR: {
    sum: {
      field: "ovcVL",
    },
  },
  OVC_VLS: {
    sum: {
      field: "VLSuppressed",
    },
  },
};

export const ovcTrackerIndicators = {
  OVC_SERV: {
    sum: {
      field: "OVC_SERV",
    },
  },
  servedInPreviousQuarter: {
    sum: {
      field: "servedInPreviousQuarter",
    },
  },
  quarter: {
    sum: {
      field: "quarter",
    },
  },
};

export const ovcTrackerPreventionIndicators = {
  completedPrevention: {
    sum: {
      field: "completedPrevention",
    },
  },
};
