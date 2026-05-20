import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { generateCron } from "../controllers/ai.controller";

const aiRouter = Router();

aiRouter.post("/generate-cron", authMiddleware, generateCron);

export default aiRouter;