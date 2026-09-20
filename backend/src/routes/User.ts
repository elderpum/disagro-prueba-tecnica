import { Router } from 'express';
import { autenticarToken } from '../middlewares/auth';
import { UserController } from '../controllers/User';

const controller = new UserController();
export const UserRoute = Router();

UserRoute.get('/', autenticarToken, (req, res) => controller.obtenerTodos(req, res));
UserRoute.get('/:id', autenticarToken, (req, res) => controller.obtenerPorId(req, res));
UserRoute.post('/', autenticarToken, (req, res) => controller.crear(req, res));
UserRoute.put('/:id', autenticarToken, (req, res) => controller.actualizar(req, res));
UserRoute.delete('/:id', autenticarToken, (req, res) => controller.eliminar(req, res));
