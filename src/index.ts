import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { env } from './config/env';
import { authRoutes } from './routes/authRoutes';
import { fantasyTeamRoutes } from './routes/fantasyTeamRoutes';
import { matchesRoutes } from './routes/matchesRoutes';
import { playerRoutes } from './routes/playerRoutes';
import { teamRoutes } from './routes/teamRoutes';
// import userRoutes from "./routes/userRoutes";

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', secureHeaders());

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'API is running' }));

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/player', playerRoutes);
app.route('/api/team', teamRoutes);
// Authenticated routes
app.route('/api/fantasy-team', fantasyTeamRoutes);
app.route('/api/matches', matchesRoutes);
// app.route("/api/gameweek", gameweekRoutes);
// app.route("/api/leaderboard", leaderboardRoutes);
// app.route("/api/user", userRoutes);

console.log('Server starting on port', env.PORT);
export default { port: env.PORT, fetch: app.fetch };
