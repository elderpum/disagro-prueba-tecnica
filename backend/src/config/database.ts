import * as sql from 'mssql';
import dotenv from 'dotenv';
import { config } from './environment';

dotenv.config();

const dbConfig: sql.config = {
    user: config.database.user,
    password: config.database.password,
    server: config.database.server,
    port: config.database.port,
    database: config.database.database,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool: sql.ConnectionPool | null = null;

export const connectDB = async (): Promise<sql.ConnectionPool> => {
    try {
        pool = await sql.connect(dbConfig);
        console.log('Conexión a la base de datos establecida');
        return pool;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
};

export const getConnection = async (): Promise<sql.ConnectionPool> => {
    if (!pool) {
        throw new Error('La conexión a la base de datos no ha sido establecida.');
    }
    return pool;
};

export { sql };
