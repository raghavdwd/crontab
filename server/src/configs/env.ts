import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const env = {
  PORT: process.env.PORT as string,
  NODE_ENV: process.env.NODE_ENV as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  DB_URI: process.env.DB_URI as string,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY as string,
  CLIENT_APP_URL: process.env.CLIENT_APP_URL as string,
  SERVER_APP_URL: process.env.SERVER_APP_URL as string,
};
