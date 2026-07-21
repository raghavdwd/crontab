import { type Response } from "express";
import AuthService from "../services/auth.service";
import User from "../models/User";
import { encrypt } from "../utils/crypto";
import { type AuthenticatedRequest } from "../middlewares/auth.middleware";

const authService = new AuthService();

/**
 * Handles user registration.
 * POST /api/v1/auth/register
 */
export const handleRegister = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Fields 'username' and 'password' are required." });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: "Username must be at least 3 characters long." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }

    const result = await authService.register(username, password);
    res.status(201).json({
      message: "User registered successfully.",
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      error: "Registration failed.",
      details: error.message || String(error),
    });
  }
};

/**
 * Handles user login.
 * POST /api/v1/auth/login
 */
export const handleLogin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Fields 'username' and 'password' are required." });
      return;
    }

    const result = await authService.login(username, password);
    res.status(200).json({
      message: "Login successful.",
      ...result,
    });
  } catch (error: any) {
    res.status(401).json({
      error: "Login failed.",
      details: error.message || String(error),
    });
  }
};

/**
 * Updates the authenticated user's Resend email alert configuration.
 * PUT /api/v1/auth/resend-config
 */
export const handleUpdateResendConfig = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { apiKey, email } = req.body;

    const updateFields: Record<string, any> = {};

    if (apiKey !== undefined && apiKey !== "") {
      updateFields.resendApiKeyEncrypted = encrypt(apiKey);
    }
    if (email !== undefined) {
      updateFields.resendEmail = email.trim().toLowerCase() || undefined;
    }

    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(userId, updateFields);
    }

    res.status(200).json({ message: "Resend configuration updated." });
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to update Resend configuration.",
      details: error.message || String(error),
    });
  }
};

/**
 * Returns the authenticated user's Resend configuration (never the raw API key).
 * GET /api/v1/auth/resend-config
 */
export const handleGetResendConfig = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const user = await User.findById(userId).select("resendApiKeyEncrypted resendEmail");

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({
      configured: !!user.resendApiKeyEncrypted,
      email: user.resendEmail || null,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve Resend configuration.",
      details: error.message || String(error),
    });
  }
};

/**
 * Returns currently authenticated user details.
 * GET /api/v1/auth/me
 */
export const handleMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    res.status(200).json({
      user: req.user,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve user context.",
      details: error.message || String(error),
    });
  }
};
