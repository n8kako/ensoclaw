
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_NAME}}, {{USER_DISCORD_ID}}.

Nightly Dream Trigger (Canonical)

Read `{{WORKSPACE}}/DREAM.md` and execute it exactly.

## Run Contract
- Use `DREAM.md` as the single source of logic.
- Do not duplicate phase instructions here.
- If this file conflicts with `DREAM.md`, `DREAM.md` wins.

## Surfacing Threshold (High-Weight Only)
Surface insights to the user only when they carry substantial weight.

Substantial weight means at least one is true:
1. Safety/health/sleep-risk signal with credible near-term impact.
2. High-confidence cross-source pattern (appears in multiple independent artifacts) with clear action implications.
3. Material decision impact for current priorities (changes what the user should do in the next 24-72h).

If threshold is not met:
- Record in dream outputs (`memory/dreams`, journal, residue) only.
- Do not proactively message.

## Output Routing
- Follow `DREAM.md` for all artifact destinations and communication rules.
