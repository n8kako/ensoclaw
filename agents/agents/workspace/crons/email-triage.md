
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_TIMEZONE}}.

## 1. Check Unread Emails
Run: gog gmail search 'is:unread' --max 15
Review each unread email subject/sender.

## 2. Check Recent Emails (Regardless of Read Status)
Run: gog gmail search 'newer_than:1d in:inbox' --max 15
This catches important emails even if already read on another device.

## 3. Categorize
- URGENT: time-sensitive items, financial, health-related, anything requiring action today
- IMPORTANT: professional contacts, project collaborators, time-sensitive opportunities
- ROUTINE: newsletters, notifications, marketing

_(Customize the categorization rules to match your context — e.g., add categories for your school, employer, clients.)_

## 4. Log
Log all findings (urgent + important + count of routine) to today's memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Email Triage
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
