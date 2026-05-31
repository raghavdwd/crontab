import { type Response, type NextFunction, type Request } from "express";
import AuthService from "../services/auth.service";

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Access denied. Token malformed." });
      return;
    }
    const decoded = authService.verifyToken(token);
    if (!decoded.id || decoded === null) {
      res.status(401).json({ error: "Access denied. Invalid token." });
      return;
    }
    // Attach decoded user payload to request
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: "Authentication failed.",
      details: error.message || String(error),
    });
  }
};
