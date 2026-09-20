import { Request, Response } from 'express';
import { Auth } from '../models/auth';
import { JWTUtils } from '../utils/jwt';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
                return;
            }

            const user = await Auth.verificarCredenciales(email, password);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
                return;
            }

            const token = JWTUtils.generarToken({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            });

            res.json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error en login:', error);

            if ((error as Error).message === 'Usuario desactivado') {
                res.status(401).json({
                    success: false,
                    message: 'Usuario desactivado'
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    }

    async verificarToken(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Token no válido'
                });
                return;
            }

            const user = await Auth.obtenerPorId(userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    }
}
