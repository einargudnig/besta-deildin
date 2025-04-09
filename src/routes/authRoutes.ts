import { Hono } from 'hono';
import { authController } from '../controllers/authController';

const authRoutes = new Hono();

authRoutes.post('/login', authController.login);
authRoutes.post('/register', authController.register);

export { authRoutes };
