import { Request, Response } from 'express';
import { Item, ItemType } from '../models/Item';

const TIPOS_VALIDOS: ItemType[] = ['SERVICE', 'PRODUCT'];

export class ItemController {
    async obtenerTodos(req: Request, res: Response): Promise<void> {
        try {
            const incluirInactivos = req.query.incluirInactivos === 'true';
            const items = await Item.obtenerTodos(!incluirInactivos);

            res.json({
                success: true,
                data: items,
                count: items.length
            });
        } catch (error) {
            console.error('Error al obtener items:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el catálogo',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);

            if (Number.isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Id inválido'
                });
                return;
            }

            const item = await Item.obtenerPorId(id);

            if (!item) {
                res.status(404).json({
                    success: false,
                    message: 'Ítem no encontrado'
                });
                return;
            }

            res.json({
                success: true,
                data: item
            });
        } catch (error) {
            console.error('Error al obtener item:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el ítem',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    async crear(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, type, price, active } = req.body;
            const validationError = this.validarPayload({ name, type, price }, false);

            if (validationError) {
                res.status(400).json({ success: false, message: validationError });
                return;
            }

            const item = await Item.crear({
                name: String(name).trim(),
                description: description ?? null,
                type,
                price: Number(price),
                active
            });

            res.status(201).json({
                success: true,
                message: 'Ítem creado',
                data: item
            });
        } catch (error) {
            console.error('Error al crear item:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el ítem',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);

            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, message: 'Id inválido' });
                return;
            }

            const { name, description, type, price, active } = req.body;
            const validationError = this.validarPayload({ name, type, price, active }, true);

            if (validationError) {
                res.status(400).json({ success: false, message: validationError });
                return;
            }

            const item = await Item.actualizar(id, {
                name: String(name).trim(),
                description: description ?? null,
                type,
                price: Number(price),
                active: Boolean(active)
            });

            if (!item) {
                res.status(404).json({ success: false, message: 'Ítem no encontrado' });
                return;
            }

            res.json({
                success: true,
                message: 'Ítem actualizado',
                data: item
            });
        } catch (error) {
            console.error('Error al actualizar item:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el ítem',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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

            const desactivado = await Item.desactivar(id);

            if (!desactivado) {
                res.status(404).json({
                    success: false,
                    message: 'Ítem no encontrado o ya estaba inactivo'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Ítem desactivado'
            });
        } catch (error) {
            console.error('Error al eliminar item:', error);
            res.status(500).json({
                success: false,
                message: 'Error al desactivar el ítem',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    private validarPayload(
        data: { name?: unknown; type?: unknown; price?: unknown; active?: unknown },
        requireActive: boolean
    ): string | null {
        if (!data.name || String(data.name).trim().length === 0) {
            return 'El nombre es requerido';
        }

        if (!TIPOS_VALIDOS.includes(data.type as ItemType)) {
            return "El tipo debe ser 'SERVICE' o 'PRODUCT'";
        }

        if (data.price === undefined || data.price === null || Number.isNaN(Number(data.price)) || Number(data.price) < 0) {
            return 'El precio debe ser un número mayor o igual a 0';
        }

        if (requireActive && typeof data.active !== 'boolean') {
            return 'El campo active debe ser boolean';
        }

        return null;
    }
}
