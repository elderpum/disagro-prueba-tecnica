import type { ReactNode } from 'react';

export interface TableColumn<T = unknown> {
    prop: keyof T | string;
    name: string;
    sortable?: boolean;
    cellRenderer?: (value: unknown, row: T) => ReactNode;
    width?: string | number;
    className?: string;
}

export interface TableConfig<T = unknown> {
    columns: TableColumn<T>[];
    apiUrl: string;
    dataParser?: (data: unknown) => T;
    title?: string;
    showNewButton?: boolean;
    newButtonRoute?: string;
    newButtonText?: string;
    onRowClick?: (row: T) => void;
    detailRoute?: string;
    showSearch?: boolean;
    searchFields?: string[];
    showPagination?: boolean;
    pageSize?: number;
    requireAuth?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T[];
    count?: number;
    message?: string;
    error?: string;
}
