import { API_URL, apiService } from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
}

export interface UserCreatePayload {
    name: string;
    email: string;
    password: string;
    role?: string;
    active?: boolean;
}

export interface UserUpdatePayload {
    name: string;
    email: string;
    password?: string;
    role: string;
    active: boolean;
}

class UsersService {
    async obtenerTodos(): Promise<{ success: boolean; data?: User[]; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'GET',
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

    async obtenerPorId(id: number): Promise<{ success: boolean; data?: User; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'GET',
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

    async crear(payload: UserCreatePayload): Promise<{ success: boolean; data?: User; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: apiService.getHeaders(true),
                body: JSON.stringify(payload),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    async actualizar(id: number, payload: UserUpdatePayload): Promise<{ success: boolean; data?: User; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: apiService.getHeaders(true),
                body: JSON.stringify(payload),
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
            const response = await fetch(`${API_URL}/users/${id}`, {
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

export const usersService = new UsersService();
