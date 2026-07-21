# Task for planner

You are a delegated subagent running from a fork of the parent session. Treat the inherited conversation as reference-only context, not a live thread to continue. Do not continue or answer prior messages as if they are waiting for a reply. Your sole job is to execute the task below and return a focused result for that task using your tools.

Task:
Create a detailed implementation plan for Tier 1 features of crontab.sh app. Here's the app context:

**Stack:** React 19 + Vite + Tailwind v4 + shadcn/ui frontend, Express + TypeScript + Bun backend, MongoDB + Mongoose, JWT auth, OpenRouter AI.

**Project structure:**
- `/home/async/projects/crontab/client/` — React frontend (Vite)
  - `src/pages/` — Dashboard, CreateJob, Landing, Login, Signup, Profile
  - `src/components/` — Navbar, CronJobDetailModal, ResponseBodyModal, general-tab, advanced-tab, Chart (dead), ui/* (shadcn)
  - `src/contexts/AuthContext.tsx`
  - `src/lib/api.ts` — axios instance with JWT interceptor
- `/home/async/projects/crontab/server/` — Express backend (Bun)
  - `src/controllers/cron.controller.ts` — CRUD handlers
  - `src/services/schedule.service.ts` — CronService singleton with Bun.cron()
  - `src/models/CronJob.ts` — Mongoose schema
  - `src/models/CronLog.ts` — Log schema
  - `src/routes/cron.route.ts` — Router

**Tier 1 features to plan:**

### 1. Run Now / Test Trigger
- New API: `POST /api/v1/cron/:id/run` — immediately executes job and stores log entry
- "Run" button in dashboard table row + job detail modal
- Backend: add `runOnce(jobId, userId)` to CronService — same executeJob logic, sync instead of timer
- Frontend: button calls API, shows toast/spinner on completion

### 2. Failure Alert Channels
- Add `alertConfig` to CronJob schema: `{ type: "email"|"webhook", target: string, enabled: boolean }`
- On job failure (exitCode !== 0), send email via SMTP/Resend API or POST to webhook URL
- Edit form fields in CreateJob + detail modal
- Need to think about: what SMTP config? what lib? nodemailer vs Resend vs custom?

### 3. Next N Run Times
- Show next 5 run times in dashboard table tooltip or job detail modal
- Frontend-only: use `cron-parser` npm package to compute next dates from cron expression
- Dashboard table: add small popover/tooltip on schedule cell showing next runs
- Job detail modal: show next runs section

### 4. Job Search / Filter
- Client-side search bar filtering by job name + URL
- Filter toggle for active/paused status
- Pure frontend, no backend changes

**Please provide:**
1. Exact files to create/modify for each feature
2. Order of implementation (dependencies between features)
3. Key implementation details (schema changes, new deps, API contracts)
4. Potential pitfalls

Read the existing files to understand current patterns before planning. Focus on `/home/async/projects/crontab/`.

---
**Output:**
Write your findings to exactly this path: /home/async/projects/crontab/.pi-subagents/artifacts/outputs/4d08f469/plan.md
This path is authoritative for this run.
Ignore any other output filename or output path mentioned elsewhere, including output destinations in the base agent prompt, system prompt, or task instructions.

## Acceptance Contract
Acceptance level: checked
Completion is not accepted from prose alone. End with a structured acceptance report.

Criteria:
- criterion-1: Implement the requested change without widening scope

Required evidence: changed-files, tests-added, commands-run, residual-risks, no-staged-files

Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
`criteriaSatisfied[].status` must be exactly one of: satisfied, not-satisfied, not-applicable.
`commandsRun[].result` must be exactly one of: passed, failed, not-run.
`manualNotes` and `notes` are optional strings; an empty string means no note and does not satisfy `manual-notes` evidence.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```