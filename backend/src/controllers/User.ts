import { Request, Response } from 'express';
import { User } from '../models/User';

export class UserController {
    async obtenerTodos(req: Request, res: Response): Promise<void> {
        try {
            const soloActivos = req.query.soloActivos === 'true';
            const users = await User.obtenerTodos(soloActivos);

            res.json({
                success: true,
                data: users,
                count: users.length
            });
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
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

            const user = await User.obtenerPorId(id);
            if (!user) {
                res.status(404).json({ success: false, message: 'Usuario no encontrado' });
                return;
            }

            res.json({ success: true, data: user });
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el usuario',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    async crear(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password, role, active } = req.body;
            const validationError = this.validarPayload({ name, email, password }, true);

            if (validationError) {
                res.status(400).json({ success: false, message: validationError });
                return;
            }

            const user = await User.crear({
                name,
                email,
                password,
                role,
                active
            });

            res.status(201).json({
                success: true,
                message: 'Usuario creado',
                data: user
            });
        } catch (error) {
            const message = (error as Error).message;
            const isBusiness = message.includes('Ya existe');

            console.error('Error al crear usuario:', error);
            res.status(isBusiness ? 400 : 500).json({
                success: false,
                message: isBusiness ? message : 'Error al crear el usuario',
                error: process.env.NODE_ENV === 'development' && !isBusiness ? message : undefined
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

            const { name, email, password, role, active } = req.body;
            const validationError = this.validarPayload({ name, email, password, active, role }, false);

            if (validationError) {
                res.status(400).json({ success: false, message: validationError });
                return;
            }

            const user = await User.actualizar(id, {
                name,
                email,
                password,
                role: role || 'Admin',
                active: Boolean(active)
            });

            if (!user) {
                res.status(404).json({ success: false, message: 'Usuario no encontrado' });
                return;
            }

            res.json({
                success: true,
                message: 'Usuario actualizado',
                data: user
            });
        } catch (error) {
            const message = (error as Error).message;
            const isBusiness = message.includes('Ya existe');

            console.error('Error al actualizar usuario:', error);
            res.status(isBusiness ? 400 : 500).json({
                success: false,
                message: isBusiness ? message : 'Error al actualizar el usuario',
                error: process.env.NODE_ENV === 'development' && !isBusiness ? message : undefined
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

            const desactivado = await User.desactivar(id);
            if (!desactivado) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado o ya estaba inactivo'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Usuario desactivado'
            });
        } catch (error) {
            console.error('Error al desactivar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al desactivar el usuario',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    private validarPayload(
        data: {
            name?: unknown;
            email?: unknown;
            password?: unknown;
            role?: unknown;
            active?: unknown;
        },
        requirePassword: boolean
    ): string | null {
        if (!data.name || String(data.name).trim().length === 0) {
            return 'El nombre es requerido';
        }

        if (!data.email || String(data.email).trim().length === 0) {
            return 'El email es requerido';
        }

        const email = String(data.email).trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'El email no es válido';
        }

        if (requirePassword) {
            if (!data.password || String(data.password).trim().length < 6) {
                return 'La contraseña debe tener al menos 6 caracteres';
            }
        } else if (data.password && String(data.password).trim().length > 0 && String(data.password).trim().length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!requirePassword && typeof data.active !== 'boolean') {
            return 'El campo active debe ser boolean';
        }

        return null;
    }
}
