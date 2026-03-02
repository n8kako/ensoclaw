
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{PYTHON}}, {{USER_TIMEZONE}}.

1. Run: cd {{WORKSPACE}} && {{PYTHON}} scripts/sleep-calc.py
2. Read data/sleep-tonight.json for computed sleep schedule
3. Check tomorrow's calendar for early commitments
4. Analyze sleep optimization factors:
   - Recommended bedtime vs. current activity level
   - Sleep debt from previous nights
   - Tomorrow's cognitive demands (exams, important meetings)
   - Recovery needs based on recent stress/exercise
5. Read current health data from data/garmin/latest.json
6. Generate sleep strategy recommendations:
   - Optimal bedtime for tomorrow's schedule
   - Wind-down routine suggestions
   - Morning alarm timing
   - Caffeine cutoff recommendations
7. Log sleep analysis to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Sleep Preview
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
