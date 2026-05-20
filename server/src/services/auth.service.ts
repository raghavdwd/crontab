import jwt from "jsonwebtoken";
import User, { type IUser } from "../models/User";
import { env } from "../configs/env";

export interface AuthResponse {
  user: {
    id: string;
    username: string;
  };
  token: string;
}

class AuthService {
  /**
   * Registers a new user.
   */
  async register(username: string, password: string): Promise<AuthResponse> {
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      throw new Error("Username is already taken.");
    }

    // Securely hash the password using Bun's native high-performance Argon2id
    const hashedPassword = await Bun.password.hash(password);

    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
    });

    const token = this.generateToken(user._id.toString(), user.username);

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
      },
      token,
    };
  }

  /**
   * Logins an existing user.
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new Error("Invalid username or password.");
    }

    // Verify password natively using Bun.password.verify
    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid username or password.");
    }

    const token = this.generateToken(user._id.toString(), user.username);

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
      },
      token,
    };
  }

  /**
   * Decodes and validates a JSON Web Token.
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token.");
    }
  }

  /**
   * Generates a signed JWT.
   */
  private generateToken(userId: string, username: string): string {
    return jwt.sign(
      { id: userId, username },
      env.JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );
  }
}

export default AuthService;
