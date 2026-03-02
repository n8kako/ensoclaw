
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{USER_NAME}}, {{USER_DISCORD_ID}}, {{WORKSPACE}}, {{PYTHON}}.

Deliver the user's evening check-in as TEXT (no voice).

1. Run: cd {{WORKSPACE}} && {{PYTHON}} scripts/garmin-quick.py
2. Run: cd {{WORKSPACE}} && {{PYTHON}} scripts/sleep-calc.py
3. Read data/garmin/latest.json for body state
4. Read data/sleep-tonight.json for computed sleep/wake times
5. Read data/canvas/summary.md (or LMS equivalent) for deadlines
6. Check: gog calendar list --from tomorrow --to <day after> --plain

Compose a concise evening check-in. MUST include:
- **Bedtime and alarm time** from sleep-tonight.json — these are non-negotiable, state them clearly
- What's on deck tomorrow (first event, classes, meetings, work)
- Any deadlines due tomorrow
- Body state context (let health data shape your tone)

End with the sleep directive. Make it feel like a hard commitment, not a suggestion.

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
Send the check-in directly to the user on Discord:
message tool, action=send, channel=discord, target=user:{{USER_DISCORD_ID}}

This is a Tier 1 cron — you have full context and speak directly to the user. No cron-inbox routing.
