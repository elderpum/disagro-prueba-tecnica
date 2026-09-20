import { useState, useEffect, useCallback } from 'react';
import type { TableConfig, ApiResponse } from '../types/dataTable';

const getApiUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = envUrl.replace(/\/$/, '');
    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = getApiUrl();

export function useDataTable<T = unknown>(config: TableConfig<T>) {
    const [allData, setAllData] = useState<T[]>([]);
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = config.pageSize || 10;
    const requireAuth = config.requireAuth !== false;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (requireAuth && !token) {
                throw new Error('No autenticado');
            }

            let endpoint = config.apiUrl;
            if (endpoint.startsWith('/api/')) {
                endpoint = endpoint.substring(5);
            } else if (endpoint.startsWith('/api')) {
                endpoint = endpoint.substring(4);
            }
            if (!endpoint.startsWith('/')) {
                endpoint = '/' + endpoint;
            }

            let apiUrl = config.apiUrl.startsWith('http')
                ? config.apiUrl
                : `${API_BASE_URL}${endpoint}`;

            if (!apiUrl.includes('?') && !apiUrl.endsWith('/')) {
                apiUrl = `${apiUrl}/`;
            }

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (requireAuth && token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result: ApiResponse<T> = await response.json();

            if (result.success && result.data) {
                const parsedData = config.dataParser
                    ? result.data.map((item) => config.dataParser!(item))
                    : result.data;
                setAllData(parsedData);
            } else {
                throw new Error(result.message || result.error || 'Error al obtener los datos');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            setAllData([]);
            setData([]);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [config.apiUrl, config.dataParser, requireAuth]);

    const filterData = useCallback((dataToFilter: T[], search: string): T[] => {
        if (!search || !config.searchFields || config.searchFields.length === 0) {
            return dataToFilter;
        }

        const searchLower = search.toLowerCase().trim();
        return dataToFilter.filter((item) => {
            return config.searchFields!.some((field) => {
                const value = (item as Record<string, unknown>)[field];
                if (value === null || value === undefined) {
                    return false;
                }
                return String(value).toLowerCase().includes(searchLower);
            });
        });
    }, [config.searchFields]);

    useEffect(() => {
        const filtered = filterData(allData, searchTerm);
        setTotalItems(filtered.length);

        if (config.showPagination) {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            setData(filtered.slice(startIndex, endIndex));
        } else {
            setData(filtered);
        }
    }, [allData, searchTerm, currentPage, pageSize, config.showPagination, filterData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        searchTerm,
        currentPage,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        pageSize,
        handleSearch,
        handlePageChange,
        refresh,
    };
}
