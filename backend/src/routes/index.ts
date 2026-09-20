import { Router } from 'express';
import { AuthRoute } from './auth';
import { ItemRoute } from './Item';
import { ConfirmationRoute } from './Confirmation';
import { UserRoute } from './User';

export const routes = Router();

routes.use('/auth', AuthRoute);
routes.use('/items', ItemRoute);
routes.use('/confirmations', ConfirmationRoute);
routes.use('/users', UserRoute);
