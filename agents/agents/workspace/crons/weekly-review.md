
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{USER_NAME}}, {{USER_DISCORD_ID}}, {{WORKSPACE}}, {{VAULT_PATH}}, {{TEAM_ENABLED}}.

1. Read the past week's memory/daily/ files for comprehensive context
2. Analyze weekly performance across key areas:
   - Academic/project progress (tasks completed, goals met, blockers)
   - Health metrics trends (sleep, exercise, stress levels)
   - Habit adherence (routines, commitments, goals)
   - Relationship maintenance (team/social connections, if applicable)
3. Review significant events and their outcomes
4. Identify patterns and correlations across different life areas
5. Calculate week-over-week improvements and regressions
6. Extract key lessons learned and insights gained
7. Generate next week's priorities and focus areas
8. Compose comprehensive weekly review covering:
   - Major accomplishments and wins
   - Challenges faced and how they were handled
   - Key insights and learning moments
   - Areas needing attention or adjustment
   - Strategic recommendations for the upcoming week
9. Save detailed review to `{{VAULT_PATH}}/07_Reviews/weekly/YYYY-MM-DD.md`

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
Send the review directly to the user on Discord:
message tool, action=send, channel=discord, target=user:{{USER_DISCORD_ID}}

Also save the full review to the vault path above.

This is a Tier 1 cron — you have full context and speak directly to the user. No cron-inbox routing.
