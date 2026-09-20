import { getConnection, sql } from '../config/database';
import bcrypt from 'bcryptjs';

export interface IUserLogin {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    active: boolean;
}

export class Auth {
    static async verificarCredenciales(email: string, password: string): Promise<IUserLogin | null> {
        const pool = await getConnection();

        try {
            const result = await pool.request()
                .input('email', sql.NVarChar(150), email)
                .query(`
                    SELECT id, name, email, password, role, active, createdAt
                    FROM Users
                    WHERE email = @email
                `);

            if (result.recordset.length === 0) {
                return null;
            }

            const user = result.recordset[0] as IUserLogin;

            if (!user.active) {
                throw new Error('Usuario desactivado');
            }

            if (!user.password) {
                console.error('Password no encontrado para el usuario:', email);
                return null;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return null;
            }

            return user;
        } catch (error) {
            console.error('Error en verificarCredenciales:', error);
            throw error;
        }
    }

    static async obtenerPorId(id: number): Promise<Omit<IUserLogin, 'password'> | null> {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT id, name, email, role, active, createdAt
                FROM Users
                WHERE id = @id
            `);

        return result.recordset.length > 0
            ? result.recordset[0] as Omit<IUserLogin, 'password'>
            : null;
    }
}
