
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{VAULT_PATH}}, {{USER_TIMEZONE}}.

Verify nightly dream completion for the previous local day.

Steps:
1. Compute `yesterday` in local time (`{{USER_TIMEZONE}}`) as `YYYY-MM-DD`.
2. Check for expected artifacts:
   - `{{WORKSPACE}}/memory/dreams/${yesterday}.md`
   - `{{VAULT_PATH}}/02_Journals/agent/${yesterday}.md`
3. If either file is missing, append this block to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Dream Watchdog
Nightly dream artifact gap detected for {yesterday}.
Missing: {comma-separated missing paths}
Action: trigger manual nightly-dream run and inspect cron run history.
```

4. If both artifacts exist, do nothing.

Important:
- Append only; never overwrite cron-inbox.
- Do not send Discord messages directly.
- Be concise and factual.
