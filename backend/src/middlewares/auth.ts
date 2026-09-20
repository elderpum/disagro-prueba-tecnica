import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        name: string;
        role: string;
    };
}

export const autenticarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Use: Bearer <token>'
            });
            return;
        }

        const decoded = jwt.verify(token, config.jwt.secret || 'disagro-secret-key');
        req.user = decoded as AuthRequest['user'];
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};
