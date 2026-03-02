
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_TIMEZONE}}.

1. Run: gog calendar list --from today --to '+7d' --plain
2. Analyze the user's calendar for the day and upcoming week
3. Look for:
   - Schedule conflicts or double-bookings
   - Travel time between locations
   - Missing prep time before important meetings
   - Overloaded days (too many back-to-back meetings)
   - Free time blocks that could be protected
4. Check for task/assignment due dates that need calendar blocking
5. Log findings to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Calendar Intelligence Daily
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
