export interface Board {
    id: string;
    name: string;
    description?: string;
    groups: Group[];
    columns: BoardColumn[];
    items: Item[];
    createdAt: string;
    updatedAt: string;
}

export interface Group {
    id: string;
    name: string;
    position: number;
    color: string;
    boardId: string;
    items?: Item[];
}

export interface Item {
    id: string;
    name: string;
    position: number;
    groupId: string;
    boardId: string;
    cellValues: CellValue[];
    createdAt: string;
}

export enum ColumnType {
    TEXT = 'text',
    STATUS = 'status',
    DATE = 'date',
    TIMELINE = 'timeline',
    PERSON = 'person',
    LINK = 'link',
    NUMBER = 'number',
    PRIORITY = 'priority',
    FILES = 'files',
}

export interface BoardColumn {
    id: string;
    label: string;
    type: ColumnType;
    position: number;
    settings?: any;
    boardId: string;
}

export interface CellValue {
    id: string;
    value: any;
    itemId: string;
    columnId: string;
    updatedAt: string;
}

export interface StatusOption {
    label: string;
    color: string;
}

export interface PriorityOption {
    label: string;
    color: string;
}
