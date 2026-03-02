
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{PYTHON}}, {{USER_TIMEZONE}}.

Run the blink lifecycle manager to prevent blink file accumulation.

```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/blink-prune.py
```

Read the JSON output. If `digested` > 0 or `deleted` > 0, append a one-line summary to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Blink Prune
Kept {kept_raw} raw, digested {digested} into {N} daily files, deleted {deleted} stale.
```

If nothing was pruned (all zeros), do nothing.

## Anti-Confabulation
Only report the actual JSON values. Do not invent numbers.
