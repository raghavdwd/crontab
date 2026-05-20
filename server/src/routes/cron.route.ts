import { Router } from "express";
import {
  handleGetJobs,
  handleUpdateJob,
  handleDeleteJob,
  handleGetLogs,
  handleCreateJob,
} from "../controllers/cron.controller";

const cronRouter = Router();

// Retrieve all cron jobs
cronRouter.get("/", handleGetJobs);

// Create and schedule a new cron job
cronRouter.post("/", handleCreateJob)
cronRouter.post("/schedule", handleCreateJob);

// Retrieve execution logs
cronRouter.get("/logs", handleGetLogs);

// Update configuration or status of a cron job
cronRouter.put("/:id", handleUpdateJob);

// Delete/stop a cron job
cronRouter.delete("/:id", handleDeleteJob);

export default cronRouter;
