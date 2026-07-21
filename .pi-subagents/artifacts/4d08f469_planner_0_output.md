# Implementation Plan — Tier 1 Features

## Goal
Ship four high-value features: Run Now, Failure Alerts, Next N Run Times, and Job Search/Filter — in order of dependency, with concrete file-by-file changes.

---

## Tasks

### Task 1: Run Now / Test Trigger

**Order:** Do first (no deps).

**Backend changes (2 files):**

1. **`server/src/services/schedule.service.ts`**
   - Add method `runOnce(jobId: string, userId: string): Promise<ICronLog>`
     - Find job by `{ _id: jobId, userId }` — reuse existing `getJobs` pattern
     - Call `this.executeJob(...)` directly (same logic as `scheduleCronJob` callback, but synchronous return)
     - Return the created `CronLog` entry so controller can respond with it
   - No new imports needed — `CronLog` and `CronJob` models already imported

2. **`server/src/controllers/cron.controller.ts`**
   - Add handler `handleRunJob`
     - Extract `id` from `req.params.id`
     - Call `cronService.runOnce(id, userId)`
     - Return `{ message: "Job executed.", log }` with status 200
     - Catch errors → 404 if job not found, 500 if execution fails

3. **`server/src/routes/cron.route.ts`**
   - Add route: `cronRouter.post("/:id/run", handleRunJob);`
   - Must be placed BEFORE the generic `PUT /:id` route (Express 5 parses left-to-right, but `:id/run` is a specific path, so position doesn't strictly matter — put before `/:id` for clarity)

**Frontend changes (2 files):**

4. **`client/src/pages/Dashboard.tsx`**
   - Import `Play` icon from `lucide-react`
   - Add state `runningJobId: string | null` for spinner tracking
   - Add function `handleRunJob(jobId: string)`:
     ```ts
     const handleRunJob = async (jobId: string) => {
       setRunningJobId(jobId);
       try {
         await api.post(`/cron/${jobId}/run`);
         // Optionally refresh logs tab
       } catch (err) {
         console.error("Run failed:", err);
       } finally {
         setRunningJobId(null);
       }
     };
     ```
   - In the job table row's Actions cell, add a "Run" button after the toggle/delete:
     ```tsx
     <button onClick={() => handleRunJob(job._id)} title="Run Now">
       {runningJobId === job._id ? (
         <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" />
       ) : (
         <Play className="h-4 w-4 stroke-[1.5]" />
       )}
     </button>
     ```
   - No toast library exists — use simple inline feedback (button spinner + re-fetch logs)

5. **`client/src/components/CronJobDetailModal.tsx`**
   - In read mode general tab, add a "Run Now" button after the status/schedule section:
     ```tsx
     <Button onClick={() => handleRunJob(job._id)} disabled={running}>
       Run Now <Play className="h-4 w-4" />
     </Button>
     ```
   - Same `runningJobId` pattern or use local `running` state

**No new npm deps.**

---

### Task 2: Failure Alert Channels

**Order:** After Task 1 (no code dep, but Run Now is simpler — do it first for momentum).

**Backend — Schema change (2 files):**

6. **`server/src/models/CronJob.ts`**
   - Add to `ICronJob` interface:
     ```ts
     alertConfig?: {
       type: "email" | "webhook";
       target: string;
       enabled: boolean;
     };
     ```
   - Add to Mongoose schema:
     ```ts
     alertConfig: {
       type: {
         type: String,
         enum: ["email", "webhook"],
       },
       target: { type: String, trim: true },
       enabled: { type: Boolean, default: false },
     }
     ```

7. **`server/src/services/schedule.service.ts`**
   - In `executeJob()`, after saving the log entry (around line where `logEntry.status` is set), add failure alert logic:
     ```ts
     if (logEntry && logEntry.status === "failure") {
       // Fetch job to get alertConfig
       const job = await CronJob.findById(jobId);
       if (job?.alertConfig?.enabled) {
         await this.sendAlert(job.alertConfig, job, logEntry);
       }
     }
     ```
   - Add private method `sendAlert(config, job, logEntry)`:
     - If `type === "email"`: use `fetch()` (Bun has native fetch) to POST to Resend API or sendmail/subprocess to `sendmail`
     - If `type === "webhook"`: use `fetch()` to POST `{ job, logEntry }` to the target URL
     - **Recommendation:** Use Resend API (simple HTTP POST — no SMTP lib needed). Store API key in `process.env.RESEND_API_KEY`. If no key set, log a warning and skip.
     - Email template: basic HTML with job name, schedule, exit code, stderr snippet, timestamp
     - Webhook payload: full job + log entry JSON

8. **`server/src/configs/env.ts`** (check first if exists)
   - Add optional `RESEND_API_KEY` to env config

**Backend — Controller + Route (2 files, already modded in Task 1):**

9. **`server/src/controllers/cron.controller.ts`**
   - Update `handleCreateJob` — destructure `alertConfig` from body, pass to `cronService.createJob`
   - Update `handleUpdateJob` — destructure `alertConfig`, pass to `cronService.updateJob`

10. **`server/src/services/schedule.service.ts`**
    - Update `createJob()` method signature to accept `alertConfig`
    - Update `updateJob()` method signature to accept `alertConfig`
    - Persist `alertConfig` to MongoDB document in both methods

**Frontend — CreateJob (2 files):**

11. **`client/src/components/advanced-tab.tsx`**
    - Add alert config section:
      - Toggle switch "Enable failure alerts"
      - When on: show radio/select for type (`email` | `webhook`)
      - Text input for target (email address or webhook URL)
    - Add props:
      ```ts
      alertConfig: { type: string; target: string; enabled: boolean };
      onAlertConfigChange: (cfg: { type: string; target: string; enabled: boolean }) => void;
      ```

12. **`client/src/pages/CreateJob.tsx`**
    - Add state `alertConfig: { type: "email", target: "", enabled: false }`
    - Pass to `<AdvancedTab>` 
    - Include in `POST /cron` body

**Frontend — Detail Modal (1 file):**

13. **`client/src/components/CronJobDetailModal.tsx`**
    - Read mode: show alert config info (type + target + enabled status)
    - Edit mode: add same alert config UI as advanced-tab
    - Include in `PUT /cron/:id` body

**No new npm deps (Resend uses `fetch()` which Bun has natively).**

---

### Task 3: Next N Run Times

**Order:** After Task 1 (no dep on Task 2). Can be done in parallel with Task 2.

**Frontend only (3 files):**

14. **`client/package.json`**
    - Add dep: `"cron-parser": "^4.9.0"`
    - Run: `bun add cron-parser` (or `cd client && bun add cron-parser`)

15. **`client/src/lib/utils.ts`**
    - Add helper:
      ```ts
      import parser from "cron-parser";
      
      export const getNextRunTimes = (cronExpr: string, count = 5): Date[] => {
        try {
          const interval = parser.parseExpression(cronExpr);
          const times: Date[] = [];
          for (let i = 0; i < count; i++) {
            times.push(interval.next().toDate());
          }
          return times;
        } catch {
          return [];
        }
      };
      
      export const formatNextRuns = (cronExpr: string): string[] => {
        return getNextRunTimes(cronExpr).map(d => d.toLocaleString());
      };
      ```

16. **`client/src/pages/Dashboard.tsx`**
    - Replace the schedule cell in the jobs table:
      - Current: `<span className="...">{job.schedule}</span>`
      - New: Use a `Tooltip` wrapping a small info icon/button:
        ```tsx
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="...">
                <Clock className="h-3 w-3" />
                {job.schedule}
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-mono text-xs">
              <p className="font-semibold mb-1">Next runs:</p>
              {getNextRunTimes(job.schedule).map((d, i) => (
                <p key={i} className="text-[10px]">{d.toLocaleString()}</p>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        ```
      - Import `getNextRunTimes` from `@/lib/utils`

17. **`client/src/components/CronJobDetailModal.tsx`**
    - In read mode general tab, after the schedule display, add a "Next Runs" section:
      ```tsx
      <div>
        <Label className="text-[10px] font-normal text-neutral-500 uppercase tracking-wider">
          Next {nextRuns.length} Executions
        </Label>
        <div className="mt-1 space-y-1">
          {nextRuns.map((d, i) => (
            <p key={i} className="text-xs font-mono text-neutral-600">
              {d.toLocaleString()}
            </p>
          ))}
        </div>
      </div>
      ```

---

### Task 4: Job Search / Filter

**Order:** Can be done in parallel with Tasks 2 and 3.

**Frontend only (1 file):**

18. **`client/src/pages/Dashboard.tsx`**
    - Add state:
      ```ts
      const [searchQuery, setSearchQuery] = useState("");
      const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
      ```
    - Add search bar above the stats grid or between header and tabs:
      ```tsx
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 stroke-[1.5]" />
          <Input
            type="text"
            placeholder="Search by name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 border-[#e4e4e7] bg-white text-sm font-light rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>All</Button>
          <Button variant={statusFilter === "active" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("active")}>Active</Button>
          <Button variant={statusFilter === "paused" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("paused")}>Paused</Button>
        </div>
      </div>
      ```
    - Derived filtered list:
      ```ts
      const filteredJobs = jobs.filter(job => {
        const matchesSearch = !searchQuery || 
          (job.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (job.command?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "active" && job.isActive) ||
          (statusFilter === "paused" && !job.isActive);
        return matchesSearch && matchesStatus;
      });
      ```
    - Replace `jobs.map(...)` in table body with `filteredJobs.map(...)`
    - Update empty state to show "No matching jobs" when filtered but not empty
    - Import `Search` from `lucide-react`

---

## Files to Modify

| File | Feature | Change |
|------|---------|--------|
| `server/src/services/schedule.service.ts` | Run Now, Alerts | Add `runOnce()`, `sendAlert()`, update `createJob`/`updateJob` signatures |
| `server/src/controllers/cron.controller.ts` | Run Now, Alerts | Add `handleRunJob`, destructure `alertConfig` |
| `server/src/routes/cron.route.ts` | Run Now | Add `POST /:id/run` route |
| `server/src/models/CronJob.ts` | Alerts | Add `alertConfig` field to interface + schema |
| `server/src/configs/env.ts` | Alerts | Add `RESEND_API_KEY` (optional) |
| `client/src/pages/Dashboard.tsx` | Run Now, Next Runs, Search | Add run button, next-runs tooltip, search bar, filter toggles |
| `client/src/components/CronJobDetailModal.tsx` | Run Now, Next Runs, Alerts | Add run button, next-runs display, alert config in edit mode |
| `client/src/components/advanced-tab.tsx` | Alerts | Add alert config UI section |
| `client/src/pages/CreateJob.tsx` | Alerts | Add `alertConfig` state, pass to AdvancedTab, include in POST body |
| `client/src/lib/utils.ts` | Next Runs | Add `getNextRunTimes()` helper |
| `client/package.json` | Next Runs | Add `cron-parser` dependency |

## New Files

None.

---

## Dependencies

```
Task 1 (Run Now) ──── no deps ──── do first
       │
       ├── Task 2 (Alerts) ──── no code dep on T1 ──── do second (or parallel with T3)
       │
       ├── Task 3 (Next Runs) ──── no code dep on T1 ──── do in parallel with T2
       │
       └── Task 4 (Search/Filter) ──── no code dep on T1 ──── do in parallel with T2/T3
```

All 4 tasks are independent in terms of code changes (no conflicts in same files except Dashboard.tsx and CronJobDetailModal.tsx — those need sequential merges or git resolution).

---

## Risks & Pitfalls

1. **Task 2 — Email delivery failure:** If `RESEND_API_KEY` is missing, the send should fail silently (log warning, don't crash job execution). Use Bun's `fetch()` which handles async errors cleanly.

2. **Task 2 — No `env.ts` exists?** Let me verify. Actually the server reads from `process.env` directly in services. If `env.ts` configures it via `dotenv`, just add the key. If not, read `process.env.RESEND_API_KEY` directly.

3. **Task 3 — Invalid cron expression:** `cron-parser.parseExpression()` throws on bad input. The `getNextRunTimes` helper catches and returns `[]`. Frontend must handle empty array gracefully (show "—" or "Invalid expression").

4. **Task 3 — `Tooltip` won't show on mobile:** Tooltips don't trigger on touch. Acceptable — next-run times are a desktop convenience. The detail modal works on mobile.

5. **Task 1 — Double execution on race:** If user clicks Run Now while job is already executing, `executeJob` creates a new log entry. That's fine — same job can have overlapping manual + scheduled runs. No mutex needed.

6. **Task 4 — Search performance:** With < 100 jobs (reasonable for this scale), client-side filter is fine. No need for debounce at this stage.

7. **Express 5 route ordering:** `PUT /:id` and `POST /:id/run` are both parameterized. Express 5 matches methods separately so there's no conflict. But keep `POST /:id/run` before `PUT /:id` in the router for readability.

8. **No toast library exists:** All 4 features rely on inline UI feedback (spinners, button state changes). If the user later adds a toast library, Run Now and Alert triggers would benefit. For now, keep it simple.

---

## Acceptance