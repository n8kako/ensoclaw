# Sub-Agent Context Rule (Global)

This rule is mandatory for all cron instruction files in this workspace.

## Requirement
Before doing domain-specific work, ingest sub-agent context so the agent has continuity across spawned sessions.

1. Run `subagents(action=list, recentMinutes=180)`.
2. Identify relevant sub-agent sessions (e.g., any active/recent sessions tied to the current task).
3. For each relevant session, fetch recent context with `sessions_history` (at least 5-20 latest messages).
4. Use these signals as first-class context when making conclusions/actions.

## Notes
- If no relevant sub-agents are active/recent, continue normally and state that none were found.
- Do not expose raw private internals to external recipients; apply normal masking/privacy rules.
- This requirement is additive and does not replace existing cron-specific checks.
