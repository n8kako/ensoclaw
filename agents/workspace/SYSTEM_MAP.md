<!-- meta: owner="Agent Architecture" review_cadence="weekly" depends_on="reports/cron-registry.csv,reports/script-callgraph.md" -->
# SYSTEM_MAP.md

_(This file is a live runtime snapshot. Update it as your installation evolves.)_

Read **CONFIG.md** for: `{{WORKSPACE}}`, `{{VAULT_PATH}}`, `{{USER_NAME}}`, `{{TEAM_ENABLED}}`.

Last updated: _(update with your install date)_

## 1) Ecosystem Layers

### A. Governance / Identity Layer
Top-level context docs (loaded always or on demand):
`AGENTS.md`, `SOUL.md`, `USER.md`, `IDENTITY.md`, `HEARTBEAT.md`, `MEMORY.md`, `CONFIG.md`, `CONTEXT.md`, `ENSO-STACK.md`, `CRON.md`, `HEALTH.md`, `CIRCADIAN.md`, `DREAM.md`, `DREAM_RESIDUE.md`, `BLINK.md`, `EXISTENTIALISM.md`, `RISE.md`, `JOURNAL.md`, `ONBOARD.md`, `SKILL.md`, `WHAT-IF.md`.

### B. Execution Layer
- Cron scheduler jobs trigger isolated agent turns.
- Cron prompt specs live in `crons/*.md`.
- Scripts in `scripts/*` provide deterministic data pulls/transforms.

### C. Data / Memory Layer
- `memory/cron-inbox.md` = cron-to-main-session relay bus.
- `memory/heartbeat-state.json` = heartbeat cadence state and alert cooldowns.
- `memory/daily/*` = operational logs.
- `memory/audit/*` = action ledger.
- Vault path: `{{VAULT_PATH}}`.

## 2) Runtime Scheduling Topology

### Cadence Bands
- Every 15 min: BLINK Cycle, Circadian Monitor.
- Every 30 min: Heartbeat.
- Every 2 hours: Health Check-in, Email Triage.
- Daily windows: Email/GitHub/Health/Academic/Calendar/Project intelligence jobs.
- Nightly: Daily Tracker Sync, Nightly Dream, RISE, Vault Index, Blink Prune.
- Weekly: Weekly Review, Calendar Weekly, Existential Review.

### Routing Pattern
Most intelligence jobs are configured as:
1. Read cron instruction doc
2. Run tool/script work
3. Append notable findings to `memory/cron-inbox.md`
4. Heartbeat loop surfaces relevant items to user

## 3) Execution Assets

### Cron instruction docs
See `crons/` directory. Reference files:
- `crons/morning-briefing.md`
- `crons/evening-checkin.md`
- `crons/nightly-dream.md`
- `crons/blink-cycle.md`
- `crons/blink-prune.md`
- `crons/circadian-monitor.md`
- `crons/daily-tracker-sync.md`
- `crons/deadline-alerts.md`
- `crons/email-intelligence.md`
- `crons/email-triage.md`
- `crons/existential-review.md`
- `crons/founder-pulse.md`
- `crons/garmin-health-sync.md`
- `crons/github-watch.md`
- `crons/habit-tracker.md`
- `crons/health-check-in.md`
- `crons/health-intelligence.md`
- `crons/journal-watch.md`
- `crons/memory-consolidation.md`
- `crons/lms-daily-sync.md`
- `crons/academic-intelligence.md`
- `crons/calendar-intelligence-daily.md`
- `crons/calendar-intelligence-weekly.md`
- `crons/project-tracker.md`
- `crons/rise.md`
- `crons/sleep-preview.md`
- `crons/vault-index.md`
- `crons/weather-scout.md`
- `crons/weekly-review.md`

### Script domains
- Health/Garmin: `garmin-*`, `health-sync.py`, `sleep-calc.py`, `sentinel.py`
- Calendar/LMS: `canvas-*` (or your LMS equivalent), `canvas-to-gcal.sh`
- Memory/Vault: `vault-index.py`, `vault-search.py`, `memory-consolidation-prep.py`
- Voice/Transcripts: `sync-voice-transcripts.py`, `transcribe-*`
- Meta automation: `sync-skills.py`, `watch-skills.sh`, `blink-prune.py`

## 4) Common Friction Points
- Alert fatigue from too many crons surfacing the same information → use cooldowns and dedupe scripts
- Mixed execution style (some cron prompts are policy-heavy, others script-heavy)
- Timeout on long-running jobs (Dream, Memory Consolidation) → configure appropriate model budgets
- High cron count increases cognitive + operational overhead → disable crons for integrations you don't use

## 5) Customization Notes

When adding new crons:
1. Create `crons/your-cron.md` following the pattern in existing files
2. Add it to `openclaw cron` scheduler
3. Update this file's cron list
4. If the cron introduces new scripts, document them in the script domains list above
