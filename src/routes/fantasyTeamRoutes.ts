import { Hono } from 'hono';
import { fantasyTeamController } from '../controllers/fantasyTeamController';
import { authMiddleware } from '../middleware/authMiddleware';

const fantasyTeamRoutes = new Hono();

// Apply auth middleware to all routes
fantasyTeamRoutes.use('*', authMiddleware);

fantasyTeamRoutes.get('/', async (c) => fantasyTeamController.getUserTeams(c));
fantasyTeamRoutes.post('/', async (c) => fantasyTeamController.createTeam(c));
fantasyTeamRoutes.get('/:id', fantasyTeamController.getTeamById);
fantasyTeamRoutes.put('/:id', fantasyTeamController.updateTeam);
fantasyTeamRoutes.delete('/:id', fantasyTeamController.deleteTeam);
// TODO: not sure I need this route if I have the addPlayer route
fantasyTeamRoutes.post('/:id/select-player', async (c) => fantasyTeamController.selectPlayer(c));
fantasyTeamRoutes.post('/:id/players/:playerId', async (c) => fantasyTeamController.addPlayer(c));
fantasyTeamRoutes.get('/:id/players', fantasyTeamController.getTeamPlayers);

export { fantasyTeamRoutes };
