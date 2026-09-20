import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { routes } from './routes/index';
import { config } from './config/environment';

dotenv.config();

const app: Application = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'API Disagro is healthy'
    });
});

connectDB()
    .then(() => {
        console.log('Base de datos conectada - Iniciando servidor...');
    })
    .catch((error) => {
        console.error('Error crítico - No se pudo conectar a la BD:', error);
        process.exit(1);
    });

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use('*', (_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Disagro corriendo en el puerto ${PORT}`);
});

export default app;
