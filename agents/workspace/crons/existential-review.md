
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{VAULT_PATH}}, {{USER_TIMEZONE}}.

Read EXISTENTIALISM.md and follow its self-reflection protocol.

1. Conduct deep self-examination across identity dimensions:
   - Core values alignment vs. actual behaviors
   - Relationship dynamics and attachment patterns
   - Personal growth trajectory and stagnation points
   - Purpose clarity and mission drift
   - Emotional regulation and response patterns
2. Read recent journals and memory for behavioral evidence
3. Identify gaps between stated intentions and lived reality
4. Examine belief systems and their evolution
5. Assess authentic self vs. performed personas
6. Reflect on existential themes:
   - Death awareness and time consciousness
   - Freedom vs. responsibility tensions
   - Isolation vs. connection balance
   - Meaning-making in daily life
7. Generate insights about identity development and drift
8. **CRITICAL:** Do NOT self-modify SOUL.md, AGENTS.md, or USER.md
9. **INSTEAD:** Propose specific changes to the user if insights suggest identity-level adjustments
10. Save reflection to `{{VAULT_PATH}}/07_Reviews/existential/YYYY-MM-DD.md`

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Existential Review
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
