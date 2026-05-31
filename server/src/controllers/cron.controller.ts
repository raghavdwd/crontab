import { type Response } from "express";
import CronService from "../services/schedule.service";
import { type AuthenticatedRequest } from "../middlewares/auth.middleware";
import { buildCurlCommand } from "../utils/build-curl";
const cronService = new CronService();

/**
 * Creates and schedules a new cron job for the authenticated user.
 * Handles: POST /api/v1/cron/schedule and POST /api/v1/cron
 */
export const handleCreateJob = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    const {
      name,
      schedule,
      url,
      method,
      headers,
      body,
      timeout,
      expectedStatus,
    } = req.body;

    if (!schedule || !url) {
      res
        .status(400)
        .json({ error: "Fields 'schedule' and 'url' are required." });
      return;
    }

    const command = buildCurlCommand(url, method, headers, body, timeout);
    const job = await cronService.createJob(userId, name, schedule, command, {
      method,
      headers,
      body,
      timeout,
      expectedStatus,
    });
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
export const handleGetJobs = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;

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
export const handleUpdateJob = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    const id = req.params.id as string;
    const {
      name,
      schedule,
      url,
      method,
      headers,
      body,
      timeout,
      expectedStatus,
      isActive,
    } = req.body;

    let command: string | undefined;
    if (url) {
      command = buildCurlCommand(url, method, headers, body, timeout);
    }

    const job = await cronService.updateJob(userId, id, {
      name,
      schedule,
      command,
      isActive,
      method,
      headers,
      body,
      timeout,
      expectedStatus,
    });
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
export const handleDeleteJob = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    const id = req.params.id as string;
    const success = await cronService.deleteJob(userId, id);

    if (success) {
      res
        .status(200)
        .json({ message: "Cron job deleted and stopped successfully." });
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
export const handleGetLogs = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    const { jobId, page, limit } = req.query;
    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

    const { logs, total } = await cronService.getLogs(
      userId,
      jobId as string,
      parsedPage,
      parsedLimit,
    );
    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve cron logs.",
      details: error.message || String(error),
    });
  }
};
