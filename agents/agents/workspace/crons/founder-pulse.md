
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{VAULT_PATH}}, {{USER_NAME}}, {{TEAM_ENABLED}}, {{USER_TIMEZONE}}.

_(This cron is most useful in team/multi-user mode. If TEAM_ENABLED is false, it monitors just the primary user's journal activity.)_

1. Check any team communication channels for new activity since last check (if Discord or similar is configured)
2. Read recent journal entries from all tracked people (see CONFIG.md team member list)
3. Scan for updates on:
   - Project progress and blockers
   - Team dynamics and collaboration
   - Individual stress/energy levels
   - Key decisions or pivots discussed
   - External challenges affecting the team
4. Synthesize a pulse check covering:
   - Overall team energy and momentum
   - Key progress since last check
   - Any concerns or friction points
   - Upcoming catalysts or deadlines
5. Log findings to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Team Pulse
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
