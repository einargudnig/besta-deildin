import { Hono } from 'hono';
import { gameweekController } from '../controllers/gameWeekController';

const gameweekRoutes = new Hono();

gameweekRoutes.get('/', gameweekController.getAllGameweeks);
gameweekRoutes.get('/current', gameweekController.getCurrentGameweek);
gameweekRoutes.get('/:id', gameweekController.getGameweekById);
gameweekRoutes.get('/:id/matches', gameweekController.getGameweekMatches);

export { gameweekRoutes };
