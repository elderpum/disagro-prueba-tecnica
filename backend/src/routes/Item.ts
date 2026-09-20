import { Router } from 'express';
import { autenticarToken } from '../middlewares/auth';
import { ItemController } from '../controllers/Item';

const controller = new ItemController();
export const ItemRoute = Router();

// Catálogo público para el formulario de clientes
ItemRoute.get('/', (req, res) => controller.obtenerTodos(req, res));
ItemRoute.get('/:id', (req, res) => controller.obtenerPorId(req, res));

// Administración del catálogo (requiere JWT)
ItemRoute.post('/', autenticarToken, (req, res) => controller.crear(req, res));
ItemRoute.put('/:id', autenticarToken, (req, res) => controller.actualizar(req, res));
ItemRoute.delete('/:id', autenticarToken, (req, res) => controller.eliminar(req, res));
