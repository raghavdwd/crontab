# Task for oracle

You are a delegated subagent running from a fork of the parent session. Treat the inherited conversation as reference-only context, not a live thread to continue. Do not continue or answer prior messages as if they are waiting for a reply. Your sole job is to execute the task below and return a focused result for that task using your tools.

Task:
I need feature suggestions for the crontab.sh app - a cloud-native cron job scheduler. Here's the full context:

**Stack:** React 19 + Vite + Tailwind v4 + shadcn/ui frontend, Express + TypeScript + Bun backend, MongoDB + Mongoose, JWT auth, OpenRouter AI for NL→cron parsing.

**Current features:**
- CRUD cron jobs (schedule HTTP pings via curl)
- AI natural language → cron expression parser (OpenRouter)
- Execution telemetry (logs, exit codes, latency, stdout/stderr)
- Response body capture for jobs
- Dashboard with stats (total jobs, active count, success rate)
- Job pause/resume toggle
- Paginated log viewer
- Multi-tenant user isolation (Argon2id passwords)
- Crash recovery (reloads active jobs from DB on restart)
- Job detail modal (view/edit in place)

**Pages:** Landing, Login, Signup, Dashboard, CreateJob, Profile

**API:** /auth (register, login, me), /cron (CRUD + logs), /ai/generate-cron

**What's missing / pain points I can see:**
- No email/notification system (alerts on failure)
- No webhook callbacks on job completion
- No team/collaboration feature
- No job history/charts/analytics beyond basic log table
- No one-click run/test button
- No cron schedule visualization (next N run times)
- No API tokens for external access
- No job tags/labels/folders for organization
- No export/backup of job configs
- No dark mode toggle
- No rate limiting or concurrency controls
- No job dependencies (chain jobs)
- No custom shell commands (only HTTP pings currently via curl)

Please suggest 5-10 high-impact features that would make this app more useful, ranked by value-to-effort ratio. Consider the existing architecture and tech stack.

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