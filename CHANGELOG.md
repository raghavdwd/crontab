## RECENT CHANGES
2026-07-21 — open PR #4 (feat/tier1-run-now-alerts → production)
2026-07-21 — fix build: add missing imports (getNextRunTimes, Play, Bell) and alertConfig state/interface in CronJobDetailModal
2026-07-21 — add Tier 1 features: Run Now button, failure alerts (email+webhook), next N run times tooltip, job search/filter bar
2026-07-01 — apply copilot review: fix build-curl.ts shQuote for bodyFilePath
2026-07-01 — apply copilot review: replace non-standard Tailwind widths in Dashboard (w-35→w-36, w-30→w-28, w-25→w-24, w-50→w-48, max-w-75→max-w-72, max-w-100→max-w-96)
2026-07-01 — add CronJobDetailModal with read/edit modes and link from dashboard jobs table
2026-07-01 — fix dashboard: remove broken Modal component and empty Dialog stub
2026-07-01 — fix save-response-body: return truncated body data to caller
2026-07-01 — fix curl command: inject bodyFilePath at execution time into stored command
2026-07-01 — fix save-response-body: use byte-accurate truncation instead of char count
