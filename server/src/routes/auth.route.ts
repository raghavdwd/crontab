import { Router } from "express";
import {
  handleRegister,
  handleLogin,
  handleMe,
  handleUpdateResendConfig,
  handleGetResendConfig,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouter = Router();

// Register a new user
authRouter.post("/register", handleRegister);

// User login
authRouter.post("/login", handleLogin);

// Get current user (protected route)
authRouter.get("/me", authMiddleware as any, handleMe);

// Update Resend email alert configuration (protected route)
authRouter.put("/resend-config", authMiddleware as any, handleUpdateResendConfig);

// Get Resend email alert configuration status (protected route)
authRouter.get("/resend-config", authMiddleware as any, handleGetResendConfig);

export default authRouter;
