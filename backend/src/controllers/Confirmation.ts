import { Request, Response } from 'express';
import { Confirmation } from '../models/Confirmation';

export class ConfirmationController {
    async obtenerTodos(_req: Request, res: Response): Promise<void> {
        try {
            const confirmations = await Confirmation.obtenerTodos();

            res.json({
                success: true,
                data: confirmations,
                count: confirmations.length
            });
        } catch (error) {
            console.error('Error al listar confirmaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener confirmaciones',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);

            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, message: 'Id inválido' });
                return;
            }

            const confirmation = await Confirmation.obtenerPorId(id);

            if (!confirmation) {
                res.status(404).json({ success: false, message: 'Confirmación no encontrada' });
                return;
            }

            res.json({
                success: true,
                data: confirmation
            });
        } catch (error) {
            console.error('Error al obtener confirmación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la confirmación',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    async previsualizar(req: Request, res: Response): Promise<void> {
        try {
            const itemIds = this.normalizarItemIds(req.body?.itemIds);

            if (!itemIds) {
                res.status(400).json({
                    success: false,
                    message: 'itemIds debe ser un arreglo de ids numéricos'
                });
                return;
            }

            const preview = await Confirmation.previsualizar(itemIds);

            res.json({
                success: true,
                data: preview
            });
        } catch (error) {
            const message = (error as Error).message;
            const isBusinessError =
                message.includes('al menos un') ||
                message.includes('no existen') ||
                message.includes('inactivos');

            res.status(isBusinessError ? 400 : 500).json({
                success: false,
                message: isBusinessError ? message : 'Error al previsualizar descuentos',
                error: process.env.NODE_ENV === 'development' && !isBusinessError ? message : undefined
            });
        }
    }

    async crear(req: Request, res: Response): Promise<void> {
        try {
            const { clientName, clientLastname, clientEmail, eventDateTime, itemIds } = req.body;
            const ids = this.normalizarItemIds(itemIds);

            if (!clientName || !String(clientName).trim()) {
                res.status(400).json({ success: false, message: 'clientName es requerido' });
                return;
            }

            if (!clientLastname || !String(clientLastname).trim()) {
                res.status(400).json({ success: false, message: 'clientLastname es requerido' });
                return;
            }

            if (!clientEmail || !String(clientEmail).trim()) {
                res.status(400).json({ success: false, message: 'clientEmail es requerido' });
                return;
            }

            if (!eventDateTime || Number.isNaN(new Date(eventDateTime).getTime())) {
                res.status(400).json({ success: false, message: 'eventDateTime inválido' });
                return;
            }

            if (!ids) {
                res.status(400).json({
                    success: false,
                    message: 'itemIds debe ser un arreglo de ids numéricos'
                });
                return;
            }

            const result = await Confirmation.crear({
                clientName,
                clientLastname,
                clientEmail,
                eventDateTime,
                itemIds: ids
            });

            res.status(201).json({
                success: true,
                message: 'Confirmación registrada',
                data: result.confirmation,
                discounts: result.discounts
            });
        } catch (error) {
            const message = (error as Error).message;
            const isBusinessError =
                message.includes('al menos un') ||
                message.includes('no existen') ||
                message.includes('inactivos');

            console.error('Error al crear confirmación:', error);
            res.status(isBusinessError ? 400 : 500).json({
                success: false,
                message: isBusinessError ? message : 'Error al registrar la confirmación',
                error: process.env.NODE_ENV === 'development' && !isBusinessError ? message : undefined
            });
        }
    }

    async eliminar(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);

            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, message: 'Id inválido' });
                return;
            }

            const eliminado = await Confirmation.eliminar(id);

            if (!eliminado) {
                res.status(404).json({ success: false, message: 'Confirmación no encontrada' });
                return;
            }

            res.json({
                success: true,
                message: 'Confirmación eliminada'
            });
        } catch (error) {
            console.error('Error al eliminar confirmación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la confirmación',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    private normalizarItemIds(itemIds: unknown): number[] | null {
        if (!Array.isArray(itemIds)) {
            return null;
        }

        const ids = itemIds.map((id) => Number(id));
        if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
            return null;
        }

        return ids;
    }
}
