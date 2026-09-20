import * as jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export class JWTUtils {
    static generarToken(payload: object): string {
        return jwt.sign(
            payload,
            config.jwt.secret,
            {
                expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
            }
        );
    }

    static verificarToken(token: string): any {
        try {
            return jwt.verify(token, config.jwt.secret);
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    static decodificarToken(token: string): any {
        return jwt.decode(token);
    }
}
