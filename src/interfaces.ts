export interface Column {
  display: string;
  id: string;
  selected: boolean;
  bg?: string;
}
export interface Store {
  loading: boolean;
  selectedOrgUnits: string[];
  userOrgUnits: any[];
  relationshipTypes: any[];
  selectedProgram: string;
  program: any;
  total: number;
  period?: any;
  columns: Column[];
  columns2: Column[];
  sessions: { [key: string]: string[] };
}

export interface ColumnProps {
  id: string;
  value: boolean;
}
