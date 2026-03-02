
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{VAULT_PATH}}, {{USER_NAME}}, {{USER_TIMEZONE}}.

1. Read data/garmin/summary.md for health habit adherence (sleep, activity, etc.)
2. Check calendar compliance with planned routines and commitments
3. Review journal entries for habit tracking mentions
4. Analyze patterns across key areas:
   - Sleep consistency (bedtime/wake time vs. targets)
   - Exercise and movement (step count, workouts)
   - Task/project discipline (completion rate, focus time)
   - Social connections (team interactions, relationship maintenance — if applicable)
5. Compare current week vs. previous week performance
6. Identify habit drift or positive momentum
7. Log habit analysis to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Habit Tracker
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
