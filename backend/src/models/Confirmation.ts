import { getConnection, sql } from '../config/database';
import { Item, IItem, ItemType } from './Item';
import { calcularDescuentos, DiscountResult } from '../utils/discounts';

export interface IConfirmationItem {
    confirmationId: number;
    itemId: number;
    unitPrice: number;
    itemType: ItemType;
    itemName: string;
}

export interface IConfirmation {
    id: number;
    clientName: string;
    clientLastname: string;
    clientEmail: string;
    eventDateTime: Date;
    servicesDiscountPercentage: number;
    productsDiscountPercentage: number;
    totalAmount: number;
    finalAmount: number;
    createdAt: Date;
    items?: IConfirmationItem[];
}

export interface IConfirmationCreate {
    clientName: string;
    clientLastname: string;
    clientEmail: string;
    eventDateTime: string | Date;
    itemIds: number[];
}

export interface IConfirmationCreateResult {
    confirmation: IConfirmation;
    discounts: DiscountResult;
}

export class Confirmation {
    static async obtenerTodos(): Promise<IConfirmation[]> {
        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT id, clientName, clientLastname, clientEmail, eventDateTime,
                   servicesDiscountPercentage, productsDiscountPercentage,
                   totalAmount, finalAmount, createdAt
            FROM Confirmation
            ORDER BY createdAt DESC
        `);

        return result.recordset as IConfirmation[];
    }

    static async obtenerPorId(id: number): Promise<IConfirmation | null> {
        const pool = await getConnection();

        const confirmationResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT id, clientName, clientLastname, clientEmail, eventDateTime,
                       servicesDiscountPercentage, productsDiscountPercentage,
                       totalAmount, finalAmount, createdAt
                FROM Confirmation
                WHERE id = @id
            `);

        if (confirmationResult.recordset.length === 0) {
            return null;
        }

        const itemsResult = await pool.request()
            .input('confirmationId', sql.Int, id)
            .query(`
                SELECT confirmationId, itemId, unitPrice, itemType, itemName
                FROM ConfirmationItem
                WHERE confirmationId = @confirmationId
                ORDER BY itemType, itemName
            `);

        const confirmation = confirmationResult.recordset[0] as IConfirmation;
        confirmation.items = itemsResult.recordset as IConfirmationItem[];
        return confirmation;
    }

    static async previsualizar(itemIds: number[]): Promise<{ items: IItem[]; discounts: DiscountResult }> {
        const { items } = await this.resolverItemsActivos(itemIds);
        const discounts = calcularDescuentos(items);
        return { items, discounts };
    }

    static async crear(data: IConfirmationCreate): Promise<IConfirmationCreateResult> {
        const { items } = await this.resolverItemsActivos(data.itemIds);
        const discounts = calcularDescuentos(items);

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            const insertConfirmation = await new sql.Request(transaction)
                .input('clientName', sql.NVarChar(100), data.clientName.trim())
                .input('clientLastname', sql.NVarChar(100), data.clientLastname.trim())
                .input('clientEmail', sql.NVarChar(150), data.clientEmail.trim().toLowerCase())
                .input('eventDateTime', sql.DateTime, new Date(data.eventDateTime))
                .input('servicesDiscountPercentage', sql.Decimal(5, 2), discounts.servicesDiscountPercentage)
                .input('productsDiscountPercentage', sql.Decimal(5, 2), discounts.productsDiscountPercentage)
                .input('totalAmount', sql.Decimal(10, 2), discounts.totalAmount)
                .input('finalAmount', sql.Decimal(10, 2), discounts.finalAmount)
                .query(`
                    INSERT INTO Confirmation (
                        clientName, clientLastname, clientEmail, eventDateTime,
                        servicesDiscountPercentage, productsDiscountPercentage,
                        totalAmount, finalAmount
                    )
                    OUTPUT INSERTED.id, INSERTED.clientName, INSERTED.clientLastname, INSERTED.clientEmail,
                           INSERTED.eventDateTime, INSERTED.servicesDiscountPercentage,
                           INSERTED.productsDiscountPercentage, INSERTED.totalAmount,
                           INSERTED.finalAmount, INSERTED.createdAt
                    VALUES (
                        @clientName, @clientLastname, @clientEmail, @eventDateTime,
                        @servicesDiscountPercentage, @productsDiscountPercentage,
                        @totalAmount, @finalAmount
                    )
                `);

            const confirmation = insertConfirmation.recordset[0] as IConfirmation;
            const confirmationItems: IConfirmationItem[] = [];

            for (const item of items) {
                const detail = await new sql.Request(transaction)
                    .input('confirmationId', sql.Int, confirmation.id)
                    .input('itemId', sql.Int, item.id)
                    .input('unitPrice', sql.Decimal(10, 2), item.price)
                    .input('itemType', sql.NVarChar(20), item.type)
                    .input('itemName', sql.NVarChar(150), item.name)
                    .query(`
                        INSERT INTO ConfirmationItem (
                            confirmationId, itemId, unitPrice, itemType, itemName
                        )
                        OUTPUT INSERTED.confirmationId, INSERTED.itemId, INSERTED.unitPrice,
                               INSERTED.itemType, INSERTED.itemName
                        VALUES (@confirmationId, @itemId, @unitPrice, @itemType, @itemName)
                    `);

                confirmationItems.push(detail.recordset[0] as IConfirmationItem);
            }

            await transaction.commit();

            confirmation.items = confirmationItems;
            return { confirmation, discounts };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async eliminar(id: number): Promise<boolean> {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            const exists = await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .query('SELECT id FROM Confirmation WHERE id = @id');

            if (exists.recordset.length === 0) {
                await transaction.rollback();
                return false;
            }

            await new sql.Request(transaction)
                .input('confirmationId', sql.Int, id)
                .query('DELETE FROM ConfirmationItem WHERE confirmationId = @confirmationId');

            await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .query('DELETE FROM Confirmation WHERE id = @id');

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private static async resolverItemsActivos(itemIds: number[]): Promise<{ items: IItem[]; uniqueIds: number[] }> {
        const uniqueIds = [...new Set(itemIds.filter((id) => Number.isInteger(id) && id > 0))];

        if (uniqueIds.length === 0) {
            throw new Error('Debe seleccionar al menos un servicio o producto');
        }

        const items = await Item.obtenerPorIds(uniqueIds);

        if (items.length !== uniqueIds.length) {
            throw new Error('Uno o más ítems no existen');
        }

        const inactivos = items.filter((item) => !item.active);
        if (inactivos.length > 0) {
            throw new Error(`Ítems inactivos: ${inactivos.map((i) => i.name).join(', ')}`);
        }

        return { items, uniqueIds };
    }
}
