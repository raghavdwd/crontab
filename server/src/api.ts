import { Router } from "express";
import cronRouter from "./routes/cron.route";
import authRouter from "./routes/auth.route";
import aiRouter from "./routes/ai.route";
import { authMiddleware } from "./middlewares/auth.middleware";

const apiRouter = Router();

// Public health check route
apiRouter.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

// Authentication routes (Register, Login, Me)
apiRouter.use("/auth", authRouter);

// Protected cron job routes (Requires Bearer JWT token)
apiRouter.use("/cron", authMiddleware as any, cronRouter);

// Protected AI job generation routes
apiRouter.use("/ai", authMiddleware as any, aiRouter);

export default apiRouter;
