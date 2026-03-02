
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{PYTHON}}, {{USER_NAME}}, {{TEAM_ENABLED}}.

## Step 1: Pre-process inputs
Run the prep script to collect and consolidate all raw sources:
```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/memory-consolidation-prep.py
```
This generates `memory/consolidation-input.md` containing:
- Past 7 days of daily logs
- Past 7 days of blinks (truncated if excessive)
- MEMORY.md structure summary

It also archives blinks older than 14 days into `memory/blinks/archive/`.

## Step 2: Read the consolidated input
Read `memory/consolidation-input.md` — this is your single source of truth for this run.

## Step 3: Read current MEMORY.md
Read `{{WORKSPACE}}/MEMORY.md` in full.

## Step 4: Identify consolidation candidates
From the consolidated input, identify:
- Recurring patterns or themes across multiple days
- Decisions made that affect future behavior
- Relationship developments (if team mode enabled: across all team members)
- Project milestones or pivots
- Health trends worth tracking long-term
- Things already in MEMORY.md that need updating

## Step 5: Update MEMORY.md
Add significant new memories. Remove or update stale entries. Keep MEMORY.md under 600 lines. Be selective — this is curated long-term memory, not a log dump.

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Memory Consolidation
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
