import express from "express";
import apiRouter from "./api";
import cors from "cors";
import morgan from "morgan";
import { env } from "./configs/env";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.CLIENT_APP_URL, // Allow only the client app to access the API
  }),
);
app.use(morgan("dev"));

app.use("/api/v1", apiRouter);

export default app;
