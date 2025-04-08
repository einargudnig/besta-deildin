import { Hono } from 'hono';
import { fantasyTeamController } from '../controllers/fantasyTeamController';

const fantasyTeamRoutes = new Hono();

fantasyTeamRoutes.get('/', fantasyTeamController.getUserTeams);
fantasyTeamRoutes.post('/', fantasyTeamController.createTeam);
fantasyTeamRoutes.get('/:id', fantasyTeamController.getTeamById);
fantasyTeamRoutes.put('/:id', fantasyTeamController.updateTeam);
fantasyTeamRoutes.delete('/:id', fantasyTeamController.deleteTeam);
fantasyTeamRoutes.post('/:id/select-players', fantasyTeamController.selectPlayers);
fantasyTeamRoutes.get('/:id/players', fantasyTeamController.getTeamPlayers);

export { fantasyTeamRoutes };
