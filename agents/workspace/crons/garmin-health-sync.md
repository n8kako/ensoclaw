
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{PYTHON}}, {{BASELINE_RHR}}.

Run the Garmin health data fetch:
1. Run: cd {{WORKSPACE}} && {{PYTHON}} scripts/garmin-fetch.py
2. Read data/garmin/summary.md for the results
3. Log key metrics to today's memory/daily/YYYY-MM-DD.md under a ## Garmin Health section
4. Check for concerning patterns (compare against CONFIG.md baselines):
   - Sleep < 6h or sleep score < 60
   - Resting HR elevated (>20% above {{BASELINE_RHR}} baseline)
   - Body battery very low (< 20)
   - Stress consistently high (>40 at rest)

The morning briefing will read data/garmin/summary.md and include it.

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Garmin Health Sync
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
