
export interface Column {
    display: string;
    id: string;
    selected: boolean;
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
    columns: Column[]
}

export interface ColumnProps {
    id: string;
    value: boolean;
}