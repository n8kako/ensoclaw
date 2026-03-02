
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{VAULT_PATH}}, {{USER_NAME}}, {{TEAM_ENABLED}}, {{USER_TIMEZONE}}.

1. Scan `{{VAULT_PATH}}/02_Journals/` for entries modified today
2. If `{{TEAM_ENABLED}}`, check all configured team member directories. Otherwise check `{{USER_NAME}}` only.
3. Use: find `{{VAULT_PATH}}/02_Journals/` -name '*.md' -mtime 0 -type f
4. For any new entries found:
   a. Read the full entry
   b. Note key insights, mood, themes, concerns
   c. Write findings to today's memory/daily/YYYY-MM-DD.md

Focus on substance: emotional state, commitments kept/broken, new insights, health signals.

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Journal Watch
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
