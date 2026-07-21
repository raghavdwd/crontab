import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getKey(): Buffer {
  // Import lazily to avoid circular / ESM init issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require("../configs/env");
  if (!env.RESEND_ENCRYPTION_KEY) {
    throw new Error("RESEND_ENCRYPTION_KEY env var is required");
  }
  // Hash to ensure correct length for AES-256
  return createHash("sha256").update(env.RESEND_ENCRYPTION_KEY).digest();
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  // Format: iv:authTag:ciphertext
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encoded: string): string {
  const key = getKey();
  const parts = encoded.split(":");
  const ivHex = parts[0] ?? "";
  const authTagHex = parts[1] ?? "";
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = parts.slice(2).join(":");
  if (!encrypted) {
    throw new Error("Invalid encrypted payload");
  }
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
