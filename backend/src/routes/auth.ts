import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { autenticarToken } from '../middlewares/auth';

const controller = new AuthController();
export const AuthRoute = Router();

AuthRoute.post('/login', (req, res) => controller.login(req, res));
AuthRoute.get('/verify', autenticarToken, (req, res) => controller.verificarToken(req, res));
