import { Router } from 'express';
import { autenticarToken } from '../middlewares/auth';
import { ConfirmationController } from '../controllers/Confirmation';

const controller = new ConfirmationController();
export const ConfirmationRoute = Router();

// Preview y registro públicos (formulario del cliente)
ConfirmationRoute.post('/preview', (req, res) => controller.previsualizar(req, res));
ConfirmationRoute.post('/', (req, res) => controller.crear(req, res));

// Consulta / administración (requiere JWT)
ConfirmationRoute.get('/', autenticarToken, (req, res) => controller.obtenerTodos(req, res));
ConfirmationRoute.get('/:id', autenticarToken, (req, res) => controller.obtenerPorId(req, res));
ConfirmationRoute.delete('/:id', autenticarToken, (req, res) => controller.eliminar(req, res));
