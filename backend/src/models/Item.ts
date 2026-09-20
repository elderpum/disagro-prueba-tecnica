import { getConnection, sql } from '../config/database';

export type ItemType = 'SERVICE' | 'PRODUCT';

export interface IItem {
    id: number;
    name: string;
    description: string | null;
    type: ItemType;
    price: number;
    active: boolean;
    createdAt: Date;
}

export interface IItemCreate {
    name: string;
    description?: string | null;
    type: ItemType;
    price: number;
    active?: boolean;
}

export interface IItemUpdate {
    name: string;
    description?: string | null;
    type: ItemType;
    price: number;
    active: boolean;
}

export class Item {
    static async obtenerTodos(soloActivos: boolean = true): Promise<IItem[]> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('soloActivos', sql.Bit, soloActivos ? 1 : 0)
            .query(`
                SELECT id, name, description, type, price, active, createdAt
                FROM Item
                WHERE (@soloActivos = 0 OR active = 1)
                ORDER BY type, name
            `);

        return result.recordset as IItem[];
    }

    static async obtenerPorId(id: number): Promise<IItem | null> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT id, name, description, type, price, active, createdAt
                FROM Item
                WHERE id = @id
            `);

        return result.recordset.length > 0 ? result.recordset[0] as IItem : null;
    }

    static async obtenerPorIds(ids: number[]): Promise<IItem[]> {
        if (ids.length === 0) {
            return [];
        }

        const pool = await getConnection();
        const request = pool.request();

        const placeholders = ids.map((_, index) => {
            const key = `id${index}`;
            request.input(key, sql.Int, ids[index]);
            return `@${key}`;
        }).join(', ');

        const result = await request.query(`
            SELECT id, name, description, type, price, active, createdAt
            FROM Item
            WHERE id IN (${placeholders})
        `);

        return result.recordset as IItem[];
    }

    static async crear(data: IItemCreate): Promise<IItem> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('name', sql.NVarChar(150), data.name)
            .input('description', sql.NVarChar(sql.MAX), data.description ?? null)
            .input('type', sql.NVarChar(20), data.type)
            .input('price', sql.Decimal(10, 2), data.price)
            .input('active', sql.Bit, data.active === false ? 0 : 1)
            .query(`
                INSERT INTO Item (name, description, type, price, active)
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.type,
                       INSERTED.price, INSERTED.active, INSERTED.createdAt
                VALUES (@name, @description, @type, @price, @active)
            `);

        return result.recordset[0] as IItem;
    }

    static async actualizar(id: number, data: IItemUpdate): Promise<IItem | null> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar(150), data.name)
            .input('description', sql.NVarChar(sql.MAX), data.description ?? null)
            .input('type', sql.NVarChar(20), data.type)
            .input('price', sql.Decimal(10, 2), data.price)
            .input('active', sql.Bit, data.active ? 1 : 0)
            .query(`
                UPDATE Item
                SET name = @name,
                    description = @description,
                    type = @type,
                    price = @price,
                    active = @active
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.type,
                       INSERTED.price, INSERTED.active, INSERTED.createdAt
                WHERE id = @id
            `);

        return result.recordset.length > 0 ? result.recordset[0] as IItem : null;
    }

    /** Soft delete: marca active = 0 */
    static async desactivar(id: number): Promise<boolean> {
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                UPDATE Item
                SET active = 0
                WHERE id = @id AND active = 1
            `);

        return (result.rowsAffected[0] ?? 0) > 0;
    }
}
