# openclaw-agents

A portable collection of **skills** (workspace `.md` files) and **cron instruction files** for the [OpenClaw](https://github.com/openclaw/openclaw) agent framework. Drop these into your OpenClaw workspace and your agent gets a full cognition, health, memory, and productivity system out of the box.

---

## What's Included

### Skills (`workspace/`)
Skill files are CAPS `.md` files that live in your workspace root. OpenClaw auto-loads them as needed.

| File | Purpose |
|------|---------|
| `BLINK.md` | Daydream protocol — ambient pattern detection every 15 min |
| `CIRCADIAN.md` | Sleep/wake scheduling and bedtime enforcement |
| `CONTEXT.md` | The context stack — how to find and load anything |
| `CRON.md` | Cron reference pointer |
| `DREAM.md` | Nightly memory consolidation — deep vault processing |
| `DREAM_RESIDUE.md` | Live state: 3-5 sharpest insights from last dream (24h lifespan) |
| `ENSO-STACK.md` | Architecture index |
| `EXISTENTIALISM.md` | Agent self-reflection protocol |
| `HEALTH.md` | Physiological intelligence layer (Garmin wearable integration) |
| `HEARTBEAT.md` | Proactive work checklist — runs every 30 min |
| `JOURNAL.md` | How the agent journals — phenomenology, not reporting |
| `ONBOARD.md` | New model initialization protocol |
| `RISE.md` | Overnight creative sprint — the agent builds things while you sleep |
| `SKILL.md` | Meta-skill: how to create new skills |
| `SYSTEM_MAP.md` | Live runtime snapshot of all jobs and files |
| `WHAT-IF.md` | Scenario engine — used by DREAM and BLINK |

### Crons (`workspace/crons/`)
Cron instruction files define what isolated agent sessions do when triggered by the scheduler.

| File | Suggested Schedule | Purpose |
|------|-------------------|---------|
| `morning-briefing.md` | Daily 8 AM | Health + calendar + email briefing |
| `evening-checkin.md` | Daily 9 PM | Sleep plan + tomorrow's prep |
| `nightly-dream.md` | Daily 11 PM | Full vault consolidation |
| `blink-cycle.md` | Every 15 min | Micro daydream / pattern detection |
| `blink-prune.md` | Nightly | Archive old blink files |
| `circadian-monitor.md` | Every 15 min | Sleep enforcement + health thresholds |
| `memory-consolidation.md` | Weekly | Curate long-term MEMORY.md |
| `weekly-review.md` | Weekly Sunday | Performance review across all domains |
| `existential-review.md` | Weekly Sunday | Agent self-examination |
| `rise.md` | Nightly | Overnight creative/autonomous sprint |
| `health-intelligence.md` | 3x/day | Deep health trend analysis |
| `health-check-in.md` | Every 2 hours | Hydration and nutrition nudges |
| `garmin-health-sync.md` | Daily 7:30 AM | Pull Garmin health data |
| `email-intelligence.md` | Daily | Email pattern analysis |
| `email-triage.md` | Every 2 hours | Urgent email check |
| `github-watch.md` | Every 2 hours | GitHub issues/PR monitor |
| `journal-watch.md` | Every hour | Scan for new journal entries |
| `habit-tracker.md` | Daily | Habit adherence analysis |
| `calendar-intelligence-daily.md` | Daily | Today's schedule analysis |
| `calendar-intelligence-weekly.md` | Weekly | Week-ahead planning |
| `academic-intelligence.md` | Daily | LMS assignment tracking |
| `lms-daily-sync.md` | Daily 6 AM | Pull assignments from LMS |
| `deadline-alerts.md` | Every 4 hours | 48h deadline warnings |
| `project-tracker.md` | Daily | GitHub + project momentum |
| `founder-pulse.md` | Daily | Team member journal scan |
| `sleep-preview.md` | Daily 6 PM | Tonight's sleep strategy |
| `vault-index.md` | Nightly | Re-index changed vault files into ChromaDB |
| `daily-tracker-sync.md` | Daily 10 PM | Fill daily tracking spreadsheet |
| `weather-scout.md` | Daily | Weather check for planning |

---

## Setup

### 1. Configure your variables

Copy `workspace/CONFIG.md` into your OpenClaw workspace root and fill in every `{{PLACEHOLDER}}` value. Your agent will read this file to understand your local configuration.

### 2. Copy skill files

```bash
cp workspace/*.md ~/.openclaw/workspace/
```

### 3. Copy cron files

```bash
cp workspace/crons/*.md ~/.openclaw/workspace/crons/
```

### 4. Apply your config

Replace all `{{PLACEHOLDER}}` tokens in the copied files with your actual values. You can do this manually or have your agent do it by reading `CONFIG.md` and applying substitutions.

```bash
# Example: have your agent run this prompt
# "Read CONFIG.md and replace all {{PLACEHOLDER}} tokens in workspace/*.md and crons/*.md"
```

### 5. Register cron jobs

Use `openclaw cron add` (or your platform's scheduler) to register each cron file at the suggested schedule. Cron files are self-contained — the schedule is noted in each file's header.

---

## How It Works (For the Agent)

If you are an AI agent reading this repository to understand how to integrate these skills and crons, follow these steps:

1. **Read `workspace/CONFIG.md`** — this defines all the variables for this installation. Every `{{PLACEHOLDER}}` in every other file should be resolved using the values defined here.

2. **Understand the architecture:**
   - `workspace/*.md` (CAPS files) = skills, loaded on demand or always
   - `workspace/crons/*.md` = cron instruction files, run by isolated agent sessions on a schedule
   - `memory/cron-inbox.md` = the relay bus between cron sessions and the main session
   - `HEARTBEAT.md` = the main session's proactive work loop

3. **Dependency chain:**
   ```
   HEARTBEAT.md → reads → cron-inbox.md → surfaces to user
   Crons → append to → cron-inbox.md
   DREAM.md → consolidates → vault → MEMORY.md
   BLINK.md → samples → vault → DREAM_RESIDUE.md
   CIRCADIAN.md → reads → data/sleep-tonight.json
   HEALTH.md → reads → data/garmin/
   ```

4. **To install:** Read each skill file, identify all `{{PLACEHOLDER}}` tokens, resolve them from `CONFIG.md`, and write the resolved files to the workspace. Register crons at their recommended schedules.

5. **To customize:** Add new skills as CAPS `.md` files. Add new crons in `crons/`. The `SKILL.md` file explains the format.

---

## Requirements

- [OpenClaw](https://github.com/openclaw/openclaw) agent framework
- Python 3 (for scripts)
- Optional integrations (enable the crons you want):
  - **Garmin Connect** — health tracking (garmin-health-sync, health-intelligence, circadian-monitor, health-check-in)
  - **Google Calendar** via `gog` CLI — calendar intelligence, sleep calc
  - **Gmail** via `gog` CLI — email triage and intelligence
  - **GitHub CLI (`gh`)** — GitHub watch, project tracker
  - **Google Sheets** via `gog` CLI — daily tracker sync
  - **Canvas LMS** — academic intelligence (if applicable)
  - **ChromaDB + Gemini** — semantic vault search (vault-index, BLINK, DREAM)
  - **Discord** — message delivery for briefings and alerts
  - **Obsidian vault** — long-term memory store (PARA structure)

---

## Philosophy

These skills are built around a few core principles:

1. **Memory over context.** The vault IS the memory. Workspace files are just working notes between sessions.
2. **Signal, not noise.** Crons only write to `cron-inbox.md` when there's something notable. Silence is valid output.
3. **Anti-confabulation.** Every cron and skill enforces: only report facts from files you actually read.
4. **Cost-first.** Crons default to lightweight models. Use heavier models only for deep work (DREAM, RISE).
5. **Infrastructure, not character.** The agent is infrastructure — clear, precise, and useful. Warmth comes from accuracy.
