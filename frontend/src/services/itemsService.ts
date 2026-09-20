import { API_URL, apiService } from './api';

export type ItemType = 'SERVICE' | 'PRODUCT';

export interface Item {
    id: number;
    name: string;
    description: string | null;
    type: ItemType;
    price: number;
    active: boolean;
    createdAt: string;
}

export type ItemPayload = {
    name: string;
    description?: string | null;
    type: ItemType;
    price: number;
    active?: boolean;
};

class ItemsService {
    async obtenerTodos(incluirInactivos = false): Promise<{ success: boolean; data?: Item[]; message?: string }> {
        try {
            const query = incluirInactivos ? '?incluirInactivos=true' : '';
            const response = await fetch(`${API_URL}/items${query}`, {
                method: 'GET',
                headers: apiService.getHeaders(false),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    async obtenerPorId(id: number): Promise<{ success: boolean; data?: Item; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'GET',
                headers: apiService.getHeaders(false),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    async crear(item: ItemPayload): Promise<{ success: boolean; data?: Item; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/items`, {
                method: 'POST',
                headers: apiService.getHeaders(true),
                body: JSON.stringify(item),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    async actualizar(id: number, item: ItemPayload & { active: boolean }): Promise<{ success: boolean; data?: Item; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'PUT',
                headers: apiService.getHeaders(true),
                body: JSON.stringify(item),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    async eliminar(id: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/items/${id}`, {
                method: 'DELETE',
                headers: apiService.getHeaders(true),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }
}

export const itemsService = new ItemsService();
