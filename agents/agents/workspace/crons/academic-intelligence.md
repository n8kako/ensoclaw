
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_TIMEZONE}}.

_(This cron requires LMS integration. See CONFIG.md → LMS_PLATFORM, LMS_BASE_URL, LMS_COURSE_IDS. If not using an LMS, disable this cron.)_

1. Read data/canvas/summary.md (or your LMS equivalent) for academic status
2. Check for:
   - Missing assignments or low grades
   - Upcoming deadlines within 3-7 days
   - Patterns in assignment completion
   - Grade trends by course
3. Cross-reference with calendar for study time allocation
4. Log findings to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Academic Intelligence
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
