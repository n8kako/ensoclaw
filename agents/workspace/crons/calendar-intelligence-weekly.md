
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_TIMEZONE}}.

1. Run: gog calendar list --from tomorrow --to '+7d' --plain
2. Analyze the upcoming week's schedule for optimization opportunities
3. Identify potential issues:
   - Double-bookings or schedule conflicts
   - Insufficient travel time between locations
   - Back-to-back meetings without breaks
   - Missing prep time for important events
   - Overloaded days requiring rebalancing
4. Cross-reference with any tracked tasks, assignments, or project deadlines
5. Check for missing calendar entries:
   - Study/focus blocks for upcoming deadlines
   - Task completion time blocks
   - Social commitments
   - Health appointments or maintenance
6. Suggest schedule optimizations:
   - Time blocking for deep work
   - Buffer time around important meetings
   - Batch similar activities
   - Protect energy management (avoiding late meetings before early events)
7. Log calendar analysis to memory/daily/YYYY-MM-DD.md

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Calendar Intelligence Weekly
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
