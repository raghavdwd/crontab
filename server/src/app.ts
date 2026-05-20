import express from "express";
import apiRouter from "./api";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1", apiRouter);

export default app;
