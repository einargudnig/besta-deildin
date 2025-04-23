import { Hono } from 'hono';
import { matchesController } from '../controllers/matchesController';

const matchesRoutes = new Hono();

matchesRoutes.get('/', matchesController.getAllMatches);

export { matchesRoutes };
