
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{VAULT_PATH}}, {{GITHUB_REPO}}, {{USER_TIMEZONE}}.

1. Read vault project files from `{{VAULT_PATH}}/03_Projects/`
2. Check GitHub activity on `{{GITHUB_REPO}}` repository
3. Review recent journal entries for project progress mentions
4. Scan for updates on:
   - Development milestones and blockers
   - Personal projects and side ventures
   - Academic projects and research (if applicable)
   - Collaboration initiatives
5. Analyze project momentum:
   - Completed tasks vs. planned work
   - Stuck projects needing intervention
   - New project ideas or pivots
   - Resource allocation and time management
6. Update project status in vault files
7. Log project insights to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Project Tracker
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
