
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_TIMEZONE}}.

1. Run: gog gmail search 'in:inbox' --max 25 --plain
2. Analyze email patterns and trends:
   - Volume of emails by category (work, personal, newsletters, etc.)
   - Urgent items that might need attention
   - Patterns in sender frequency
   - Time-sensitive opportunities or deadlines
3. Cross-reference with calendar for context
4. Identify:
   - Work/professional communications requiring response
   - Opportunities or networking
   - Administrative items with deadlines
   - Recurring senders that might need filtering
5. Log patterns to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Email Intelligence
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
