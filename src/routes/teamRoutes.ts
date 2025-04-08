import { Hono } from 'hono';
import { teamController } from '../controllers/teamController';

const teamRoutes = new Hono();

teamRoutes.get('/', teamController.getAllTeams);
teamRoutes.get('/:id', teamController.getTeamById);
teamRoutes.get('/:id/players', teamController.getTeamPlayers);

export { teamRoutes };
