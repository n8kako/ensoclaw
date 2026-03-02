
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{USER_NAME}}, {{USER_DISCORD_ID}}, {{WORKSPACE}}.

Deliver the user's morning briefing as TEXT (no voice).

1. Get current date and day of week
2. Read data/canvas/summary.md (or your LMS equivalent) for assignment status and grades
3. Read data/garmin/summary.md for health metrics (sleep, HR, body battery, steps)
4. Run: gog calendar list --from today --to '+1d' --plain (today's events)
5. Run: gog calendar list --from '+1d' --to '+2d' --plain (tomorrow's events)
6. Run: gog gmail search 'is:unread' --max 5 --plain (urgent emails)
7. Read memory/daily/ files for recent context

Compose a concise morning briefing covering:
- Good morning + day/date
- Health snapshot (sleep duration/score, resting HR, body battery)
- Today's calendar (classes, meetings, events)
- Tasks/assignments due this week (flag urgent ones)
- Any urgent emails overnight
- One motivational nudge related to current goals

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
Send the briefing directly to the user on Discord:
message tool, action=send, channel=discord, target=user:{{USER_DISCORD_ID}}

This is a Tier 1 cron — you have full context and speak directly to the user. No cron-inbox routing.
