import CronJob, { type ICronJob } from "../models/CronJob";
import CronLog from "../models/CronLog";
import { saveResponseBodyToFile } from "../utils/save-response-body";
import { unlink } from "node:fs/promises";

class CronService {
  private static instance: CronService;
  private activeJobs = new Map<string, any>();

  constructor() {
    if (CronService.instance) {
      return CronService.instance;
    }
    CronService.instance = this;
  }

  /**
   * Initializes the service by loading all active cron jobs from the database and scheduling them.
   * This runs system-wide during startup (does not filter by user, to restore all jobs).
   */
  async initialize() {
    console.log("Initializing Cron Service...");
    try {
      const activeJobsFromDb = await CronJob.find({ isActive: true });
      console.log(
        `Found ${activeJobsFromDb.length} active cron jobs to schedule.`,
      );

      for (const job of activeJobsFromDb) {
        try {
          this.scheduleCronJob(
            job._id.toString(),
            job.name!,
            job.schedule,
            job.command,
            job.saveResponse,
          );
          console.log(
            `Scheduled job: ${job.name || job._id} (${job.schedule})`,
          );
        } catch (err: any) {
          console.error(
            `Failed to schedule job ${job._id} on initialization:`,
            err.message,
          );
        }
      }
    } catch (error) {
      console.error("Error during Cron Service initialization:", error);
    }
  }

  /**
   * Schedules a cron job in-memory using Bun.cron.
   */
  scheduleCronJob(
    jobId: string,
    jobName: string,
    schedule: string,
    command: string,
    saveResponse = false,
  ): boolean {
    const stringJobId = jobId.toString();

    // Stop the existing in-memory job if there is one
    this.stopCronJob(stringJobId);

    try {
      const job = Bun.cron(schedule, async () => {
        await this.executeJob(stringJobId, jobName, command, saveResponse);
      });

      this.activeJobs.set(stringJobId, job);
      return true;
    } catch (error) {
      console.error(
        `Failed to schedule cron job ${stringJobId} with schedule "${schedule}":`,
        error,
      );
      throw error;
    }
  }

  /**
   * Stops a scheduled cron job in-memory.
   */
  stopCronJob(jobId: string): boolean {
    const stringJobId = jobId.toString();
    const activeJob = this.activeJobs.get(stringJobId);

    if (activeJob) {
      try {
        activeJob.stop();
        this.activeJobs.delete(stringJobId);
        return true;
      } catch (error) {
        console.error(`Error stopping cron job ${stringJobId}:`, error);
      }
    }
    return false;
  }

  /**
   * Executes the cron job command as a child process and logs the run to the database.
   */
  async executeJob(
    jobId: string,
    jobName: string,
    command: string,
    saveResponse = false,
  ) {
    const triggerTime = new Date();
    const bodyFilePath = saveResponse
      ? `/tmp/cron-body-${jobId}-${Date.now()}.txt`
      : undefined;
    let logEntry;

    try {
      // 1. Create a log entry indicating the job is running
      logEntry = await CronLog.create({
        jobId,
        jobName,
        command,
        triggerTime,
        status: "running",
      });
    } catch (err) {
      console.error(`[Job ${jobId}] Failed to create cron log entry:`, err);
    }

    try {
      // 2. Spawn the process inside a shell
      const proc = Bun.spawn(["sh", "-c", command], {
        stdout: "pipe",
        stderr: "pipe",
      });

      // Wait for process to exit and capture streams
      const exitCode = await proc.exited;
      const endTime = new Date();
      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();

      // 3. If saveResponse is on, read the body file, truncate, then clean up
      let responseBody: string | undefined;
      let bodyTruncated: boolean | undefined;
      if (saveResponse && bodyFilePath) {
        await saveResponseBodyToFile(stdout, bodyFilePath);
      }

      // 4. Update the log entry with results
      if (logEntry) {
        logEntry.endTime = endTime;
        logEntry.exitCode = exitCode;
        logEntry.stdout = stdout;
        logEntry.stderr = stderr;
        if (responseBody !== undefined) {
          logEntry.responseBody = responseBody;
          logEntry.bodyTruncated = bodyTruncated;
        }
        logEntry.status = exitCode === 0 ? "success" : "failure";
        await logEntry.save();
      }
    } catch (error: any) {
      console.error(
        `[Job ${jobId}] Error executing command "${command}":`,
        error,
      );
      if (bodyFilePath) {
        try {
          await unlink(bodyFilePath);
        } catch {
          // ignore — best effort cleanup
        }
      }
      if (logEntry) {
        logEntry.endTime = new Date();
        logEntry.exitCode = -1;
        logEntry.stderr = error.message || String(error);
        logEntry.status = "failure";
        await logEntry.save();
      }
    }
  }

  /**
   * Database Operations: Creates a new cron job for a specific user, persists it, and schedules it.
   */
  async createJob(
    userId: string,
    name: string | undefined,
    schedule: string,
    command: string,
    advanced?: {
      method?: string;
      headers?: { name: string; value: string; enabled: boolean }[];
      body?: string;
      timeout?: number;
      expectedStatus?: number;
      saveResponse?: boolean;
    },
  ): Promise<ICronJob> {
    // 1. Save to the database
    const job = await CronJob.create({
      userId,
      name,
      schedule,
      command,
      isActive: true,
      method: advanced?.method,
      headers: advanced?.headers,
      body: advanced?.body,
      timeout: advanced?.timeout,
      expectedStatus: advanced?.expectedStatus,
      saveResponse: advanced?.saveResponse ?? false,
    });

    try {
      // 2. Schedule the job in-memory
      this.scheduleCronJob(
        job._id.toString(),
        name || "unknown",
        schedule,
        command,
        job.saveResponse,
      );
    } catch (err) {
      // If scheduling fails (e.g. invalid cron pattern), roll back database entry
      await CronJob.findByIdAndDelete(job._id);
      throw err;
    }

    return job;
  }

  /**
   * Database Operations: Updates a user's cron job, modifies in-memory state.
   */
  async updateJob(
    userId: string,
    jobId: string,
    updateData: {
      name?: string;
      schedule?: string;
      command?: string;
      isActive?: boolean;
      method?: string;
      headers?: { name: string; value: string; enabled: boolean }[];
      body?: string;
      timeout?: number;
      expectedStatus?: number;
      saveResponse?: boolean;
    },
  ): Promise<ICronJob | null> {
    // Find job belonging ONLY to this user
    const job = await CronJob.findOne({ _id: jobId, userId });
    if (!job) {
      throw new Error("Cron job not found or unauthorized.");
    }

    // Keep previous values for rollback if re-scheduling fails
    const previousIsActive = job.isActive;
    const previousSchedule = job.schedule;
    const previousCommand = job.command;
    const previousName = job.name;
    const previousMethod = job.method;
    const previousHeaders = job.headers;
    const previousBody = job.body;
    const previousTimeout = job.timeout;
    const previousExpectedStatus = job.expectedStatus;
    const previousSaveResponse = job.saveResponse;

    // Apply updates to DB object
    if (updateData.name !== undefined) job.name = updateData.name;
    if (updateData.schedule !== undefined) job.schedule = updateData.schedule;
    if (updateData.command !== undefined) job.command = updateData.command;
    if (updateData.isActive !== undefined) job.isActive = updateData.isActive;
    if (updateData.method !== undefined) job.method = updateData.method;
    if (updateData.headers !== undefined) job.headers = updateData.headers;
    if (updateData.body !== undefined) job.body = updateData.body;
    if (updateData.timeout !== undefined) job.timeout = updateData.timeout;
    if (updateData.expectedStatus !== undefined)
      job.expectedStatus = updateData.expectedStatus;
    if (updateData.saveResponse !== undefined)
      job.saveResponse = updateData.saveResponse;

    await job.save();

    try {
      if (job.isActive) {
        this.scheduleCronJob(
          job._id.toString(),
          job.name || "unknown",
          job.schedule,
          job.command,
          job.saveResponse,
        );
      } else {
        this.stopCronJob(job._id.toString());
      }
    } catch (error) {
      // Rollback database updates if scheduling of updated job fails
      await CronJob.findOneAndUpdate(
        { _id: jobId, userId },
        {
          isActive: previousIsActive,
          schedule: previousSchedule,
          command: previousCommand,
          name: previousName || "unknown",
          method: previousMethod,
          headers: previousHeaders,
          body: previousBody,
          timeout: previousTimeout,
          expectedStatus: previousExpectedStatus,
          saveResponse: previousSaveResponse,
        },
      );
      throw error;
    }

    return job;
  }

  /**
   * Database Operations: Deletes a user's cron job and stops its execution in-memory.
   */
  async deleteJob(userId: string, jobId: string): Promise<boolean> {
    const result = await CronJob.findOneAndDelete({ _id: jobId, userId });
    if (result) {
      this.stopCronJob(jobId);
      // Clean up logs associated with this job
      await CronLog.deleteMany({ jobId });
      return true;
    }
    return false;
  }

  /**
   * Database Operations: Retrieves all jobs belonging to a specific user.
   */
  async getJobs(userId: string): Promise<ICronJob[]> {
    return await CronJob.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Database Operations: Retrieves logs belonging to a specific user's jobs with pagination.
   */
  async getLogs(
    userId: string,
    jobId?: string,
    page = 1,
    limit = 10,
  ): Promise<{ logs: any[]; total: number }> {
    // 1. Fetch only jobs owned by this user
    const userJobs = await CronJob.find({ userId }).select("_id");
    const jobIds = userJobs.map((j) => j._id);

    // 2. Query logs filtered by the user's job IDs
    const query: any = { jobId: { $in: jobIds } };
    if (jobId) {
      // Intersect with jobIds to maintain ownership restriction
      query.jobId = { $in: jobIds, $eq: jobId };
    }

    const [logs, total] = await Promise.all([
      CronLog.find(query)
        .populate("jobId", "name schedule command")
        .sort({ triggerTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      CronLog.countDocuments(query),
    ]);

    return { logs, total };
  }
}

export default CronService;
