import { API_URL, apiService } from './api';
import type { Item } from './itemsService';

export interface DiscountResult {
    servicesCount: number;
    productsCount: number;
    servicesSubtotal: number;
    productsSubtotal: number;
    servicesDiscountPercentage: number;
    productsDiscountPercentage: number;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
}

export interface ConfirmationItem {
    confirmationId: number;
    itemId: number;
    unitPrice: number;
    itemType: 'SERVICE' | 'PRODUCT';
    itemName: string;
}

export interface Confirmation {
    id: number;
    clientName: string;
    clientLastname: string;
    clientEmail: string;
    eventDateTime: string;
    servicesDiscountPercentage: number;
    productsDiscountPercentage: number;
    totalAmount: number;
    finalAmount: number;
    createdAt: string;
    items?: ConfirmationItem[];
}

export interface ConfirmationCreatePayload {
    clientName: string;
    clientLastname: string;
    clientEmail: string;
    eventDateTime: string;
    itemIds: number[];
}

class ConfirmationsService {
    async preview(itemIds: number[]): Promise<{
        success: boolean;
        data?: { items: Item[]; discounts: DiscountResult };
        message?: string;
    }> {
        try {
            const response = await fetch(`${API_URL}/confirmations/preview`, {
                method: 'POST',
                headers: apiService.getHeaders(false),
                body: JSON.stringify({ itemIds }),
            });
            return await response.json();
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
            };
        }
    }

    async crear(payload: ConfirmationCreatePayload): Promise<{
        success: boolean;
        data?: Confirmation;
        discounts?: DiscountResult;
        message?: string;
    }> {
        try {
            const response = await fetch(`${API_URL}/confirmations`, {
                method: 'POST',
                headers: apiService.getHeaders(false),
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

    async obtenerTodos(): Promise<{ success: boolean; data?: Confirmation[]; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/confirmations`, {
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

    async obtenerPorId(id: number): Promise<{ success: boolean; data?: Confirmation; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/confirmations/${id}`, {
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

    async eliminar(id: number): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/confirmations/${id}`, {
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

export const confirmationsService = new ConfirmationsService();
