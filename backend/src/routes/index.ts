import { Router } from 'express';
import { AuthRoute } from './auth';
import { ItemRoute } from './Item';
import { ConfirmationRoute } from './Confirmation';

export const routes = Router();

routes.use('/auth', AuthRoute);
routes.use('/items', ItemRoute);
routes.use('/confirmations', ConfirmationRoute);
