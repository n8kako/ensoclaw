
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{GITHUB_REPO}}, {{USER_TIMEZONE}}.

1. Run: gh issue list -R {{GITHUB_REPO}}
2. Run: gh pr list -R {{GITHUB_REPO}}
3. Run: gh api repos/{{GITHUB_REPO}}/events --jq '.[0:5] | .[] | {type, created_at, actor: .actor.login}' 2>/dev/null || echo 'No events API'
4. Compare with previous state — check memory/heartbeat-state.json for last GitHub check timestamp
5. Log findings to today's memory/daily/YYYY-MM-DD.md
6. Update memory/heartbeat-state.json with current timestamp

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] GitHub Watch
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
