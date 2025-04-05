import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./config/env";
import { playerRoutes } from "./routes/playerRoutes";
import { userRoutes } from "./routes/userRoutes";
import { teamRoutes } from "./routes/teamRoutes";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());
app.use("*", secureHeaders());

// Health check
app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

// Routes
app.route("/api/play", playerRoutes);
app.route("/api/user", userRoutes);
app.route("/api/team", teamRoutes);

console.log("Server starting on port", env.PORT);
export default { port: env.PORT, fetch: app.fetch };
