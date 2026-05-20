import { Router } from "express";
import { handleRegister, handleLogin, handleMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouter = Router();

// Register a new user
authRouter.post("/register", handleRegister);

// User login
authRouter.post("/login", handleLogin);

// Get current user (protected route)
authRouter.get("/me", authMiddleware as any, handleMe);

export default authRouter;
