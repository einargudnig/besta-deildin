import { Hono } from 'hono';
import { leaderboardController } from '../controllers/leaderboardController';

const leaderboardRoutes = new Hono();

leaderboardRoutes.get('/global', leaderboardController.getGlobalLeaderboard);
leaderboardRoutes.get('/gameweek/:id', leaderboardController.getGameweekLeaderboard);

export { leaderboardRoutes };
