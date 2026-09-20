import dotenv from 'dotenv';
import path from 'path';

// Carga .env del backend; si no existe, intenta el de la raíz del monorepo
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    port: process.env.PORT || 5000,
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    },
    database: {
        server: process.env.DB_SERVER || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '1433', 10),
        database: process.env.DB_NAME || 'DisagroEvento',
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'DisagroPassword123!',
    }
};
