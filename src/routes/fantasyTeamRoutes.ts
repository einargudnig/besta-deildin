import { Hono } from 'hono';
import { fantasyTeamController } from '../controllers/fantasyTeamController';

const fantasyTeamRoutes = new Hono();

fantasyTeamRoutes.get('/', async (c) => fantasyTeamController.getUserTeams(c));
fantasyTeamRoutes.post('/', async (c) => fantasyTeamController.createTeam(c));
fantasyTeamRoutes.get('/:id', fantasyTeamController.getTeamById);
fantasyTeamRoutes.put('/:id', fantasyTeamController.updateTeam);
fantasyTeamRoutes.delete('/:id', fantasyTeamController.deleteTeam);
fantasyTeamRoutes.post('/:id/select-player', async (c) => fantasyTeamController.selectPlayer(c));
// fantasyTeamRoutes.get('/:id/players', fantasyTeamController.getTeamPlayers);

export { fantasyTeamRoutes };
