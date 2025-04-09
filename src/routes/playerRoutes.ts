import { Hono } from "hono";
import { playerController } from "../controllers/playerController.ts";

const playerRoutes = new Hono();

playerRoutes.get("/", playerController.getAllPlayers);
playerRoutes.get("/:id", playerController.getPlayerById);
playerRoutes.post("/", playerController.createPlayer);
playerRoutes.put("/:id", playerController.updatePlayer);
playerRoutes.delete("/:id", playerController.deletePlayer);

export { playerRoutes };
