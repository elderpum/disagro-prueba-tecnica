import bcrypt from 'bcryptjs';
import { getConnection, sql } from '../config/database';

export interface IUser {
    id: number;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: Date;
}

export interface IUserCreate {
    name: string;
    email: string;
    password: string;
    role?: string;
    active?: boolean;
}

export interface IUserUpdate {
    name: string;
    email: string;
    password?: string;
    role: string;
    active: boolean;
}

export class User {
    static async obtenerTodos(soloActivos: boolean = false): Promise<IUser[]> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('soloActivos', sql.Bit, soloActivos ? 1 : 0)
            .query(`
                SELECT id, name, email, role, active, createdAt
                FROM Users
                WHERE (@soloActivos = 0 OR active = 1)
                ORDER BY name
            `);

        return result.recordset as IUser[];
    }

    static async obtenerPorId(id: number): Promise<IUser | null> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT id, name, email, role, active, createdAt
                FROM Users
                WHERE id = @id
            `);

        return result.recordset.length > 0 ? result.recordset[0] as IUser : null;
    }

    static async crear(data: IUserCreate): Promise<IUser> {
        const pool = await getConnection();
        const hashedPassword = await bcrypt.hash(data.password, 10);

        try {
            const result = await pool.request()
                .input('name', sql.NVarChar(150), data.name.trim())
                .input('email', sql.NVarChar(150), data.email.trim().toLowerCase())
                .input('password', sql.NVarChar(255), hashedPassword)
                .input('role', sql.NVarChar(50), data.role?.trim() || 'Admin')
                .input('active', sql.Bit, data.active === false ? 0 : 1)
                .query(`
                    INSERT INTO Users (name, email, password, role, active)
                    OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role,
                           INSERTED.active, INSERTED.createdAt
                    VALUES (@name, @email, @password, @role, @active)
                `);

            return result.recordset[0] as IUser;
        } catch (error: unknown) {
            const number = (error as { number?: number }).number;
            if (number === 2627 || number === 2601) {
                throw new Error('Ya existe un usuario con ese email');
            }
            throw error;
        }
    }

    static async actualizar(id: number, data: IUserUpdate): Promise<IUser | null> {
        const pool = await getConnection();

        try {
            let result;

            if (data.password && data.password.trim().length > 0) {
                const hashedPassword = await bcrypt.hash(data.password.trim(), 10);
                result = await pool.request()
                    .input('id', sql.Int, id)
                    .input('name', sql.NVarChar(150), data.name.trim())
                    .input('email', sql.NVarChar(150), data.email.trim().toLowerCase())
                    .input('password', sql.NVarChar(255), hashedPassword)
                    .input('role', sql.NVarChar(50), data.role.trim())
                    .input('active', sql.Bit, data.active ? 1 : 0)
                    .query(`
                        UPDATE Users
                        SET name = @name,
                            email = @email,
                            password = @password,
                            role = @role,
                            active = @active
                        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role,
                               INSERTED.active, INSERTED.createdAt
                        WHERE id = @id
                    `);
            } else {
                result = await pool.request()
                    .input('id', sql.Int, id)
                    .input('name', sql.NVarChar(150), data.name.trim())
                    .input('email', sql.NVarChar(150), data.email.trim().toLowerCase())
                    .input('role', sql.NVarChar(50), data.role.trim())
                    .input('active', sql.Bit, data.active ? 1 : 0)
                    .query(`
                        UPDATE Users
                        SET name = @name,
                            email = @email,
                            role = @role,
                            active = @active
                        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role,
                               INSERTED.active, INSERTED.createdAt
                        WHERE id = @id
                    `);
            }

            return result.recordset.length > 0 ? result.recordset[0] as IUser : null;
        } catch (error: unknown) {
            const number = (error as { number?: number }).number;
            if (number === 2627 || number === 2601) {
                throw new Error('Ya existe un usuario con ese email');
            }
            throw error;
        }
    }

    static async desactivar(id: number): Promise<boolean> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                UPDATE Users
                SET active = 0
                WHERE id = @id AND active = 1
            `);

        return (result.rowsAffected[0] ?? 0) > 0;
    }
}
