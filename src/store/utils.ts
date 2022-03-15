export const calculateQuarter = (
  year: number,
  quarter: 1 | 2 | 3 | 4
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
      zIndex: 10000,
    } as any;
  }
  if (index === 1) {
    return {
      position: "sticky",
      backgroundColor: "white",
      w: "250px",
      minW: "250px",
      maxWidth: "250px",
      left: "200px",
      top: "0px",
      zIndex: 10000,
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