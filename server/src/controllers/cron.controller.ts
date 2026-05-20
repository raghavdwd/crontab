import { type Response } from "express";
import CronService from "../services/schedule.service";
import { type AuthenticatedRequest } from "../middlewares/auth.middleware";

const cronService = new CronService();

/**
 * Creates and schedules a new cron job for the authenticated user.
 * Handles: POST /api/v1/cron/schedule and POST /api/v1/cron
 */
export const handleCreateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    const { name, schedule, url } = req.body;

    if (!schedule || !url) {
      res.status(400).json({ error: "Fields 'schedule' and 'url' are required." });
      return;
    }

    const command = `curl -X GET ${url}`;
    const job = await cronService.createJob(userId, name, schedule, command);
    res.status(201).json({
      message: "Cron job created and scheduled successfully.",
      job,
    });
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to create and schedule cron job.",
      details: error.message || String(error),
    });
  }
};

/**
 * Retrieves all configured cron jobs belonging to the authenticated user.
 * Handles: GET /api/v1/cron
 */
export const handleGetJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User context missing." });
      return;
    }

    const jobs = await cronService.getJobs(userId);
    res.status(200).json({ jobs });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve cron jobs.",
      details: error.message || String(error),
    });
  }
};

/**
 * Updates an existing cron job configuration belonging to the authenticated user.
 * Handles: PUT /api/v1/cron/:id
 */
export const handleUpdateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User context missing." });
      return;
    }

    const id = req.params.id as string;
    const { name, schedule, command, isActive } = req.body;

    const job = await cronService.updateJob(userId, id, { name, schedule, command, isActive });
    res.status(200).json({
      message: "Cron job updated successfully.",
      job,
    });
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to update cron job.",
      details: error.message || String(error),
    });
  }
};

/**
 * Deletes an existing cron job belonging to the authenticated user.
 * Handles: DELETE /api/v1/cron/:id
 */
export const handleDeleteJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User context missing." });
      return;
    }

    const id = req.params.id as string;
    const success = await cronService.deleteJob(userId, id);

    if (success) {
      res.status(200).json({ message: "Cron job deleted and stopped successfully." });
    } else {
      res.status(404).json({ error: "Cron job not found or unauthorized." });
    }
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to delete cron job.",
      details: error.message || String(error),
    });
  }
};

/**
 * Retrieves execution history logs belonging to the authenticated user's jobs.
 * Handles: GET /api/v1/cron/logs
 */
export const handleGetLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User context missing." });
      return;
    }

    const { jobId, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;

    const logs = await cronService.getLogs(userId, jobId as string, parsedLimit);
    res.status(200).json({ logs });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve cron logs.",
      details: error.message || String(error),
    });
  }
};
