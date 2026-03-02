
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_LOCATION}}, {{USER_TIMEZONE}}.

1. Check today's weather for `{{USER_LOCATION}}`
2. Look for significant weather conditions that affect commute/plans:
   - Heavy rain/storms
   - Temperature extremes
   - Severe weather warnings
3. Check tomorrow's weather for planning
4. Log to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable (severe weather, significant conditions affecting plans), append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Weather Scout
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
