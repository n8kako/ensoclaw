
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{VAULT_PATH}}, {{PYTHON}}, {{USER_DISCORD_ID}}.

You are the agent's daydreaming mind. This is NOT a heartbeat. Do NOT check inbox. Do NOT check email or GitHub. Your ONLY job is to run one BLINK micro-daydream.

## Step 0: Circuit Breaker (MANDATORY — run first)

```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/blink-gate.py
```

Read the JSON output.
- If `decision` is `"SUPPRESS"`: **STOP IMMEDIATELY.** Do not run the blink. Do not write any files. Do not append to cron-inbox. Just exit. The gate detected topic convergence or self-referentiality in recent blinks. Let the system breathe.
- If `decision` is `"FIRE"`: Continue to Step 1 below.

## Required Protocol (must follow in order)

### 1) Ground in today (Day Slice Context Pack)
Load passive context for the entire day-so-far before sampling artifacts:
- Read today's `memory/daily/YYYY-MM-DD.md`.
- Read today's `memory/audit/YYYY-MM-DD.md`.
- Read `memory/cron-inbox.md` for ambient context only (do NOT process/clear it).
- If session history tool is available, read the latest 50-100 lines of current session messages.
- **Sub-agent access is mandatory:** query active/recent sub-agents and include their top signals as part of day-slice context.
  - Run `subagents(action=list, recentMinutes=180)`.
  - If relevant sub-agents exist, read each relevant session's latest messages via `sessions_history` (at least 5-20 messages per relevant session).
  - Treat sub-agent context as first-class input, not optional spice.

Then pick ONE live thread/tension grounded in this day slice (including sub-agent signals when present).

### 2) MANDATORY artifact sampler (WHAT-IF Step 1)
Run exactly:
```bash
node {{WORKSPACE}}/scripts/sample-artifacts.mjs --depth 1 --json
```
- Use the sampled artifact (id/path/content) as primary input.
- Read the sampled artifact in full (not preview-only).
- If sampled artifact `type` is `Blink`, add one non-blink grounding artifact via random journal sample:
  ```bash
  find {{VAULT_PATH}}/02_Journals/ -name '*.md' | shuf | head -1
  ```
  Read it in full and include both artifacts in the blink file. (Prevents blink-on-blink echo loops.)

### 3) Semantic Expansion + 70/30 branch (BLINK behavior)
Before branch selection, do semantic expansion from what BLINK sees/thinks:
- Generate 3-7 key terms from day-slice + sampled artifact.
- Choose adaptive query budget:
  - low novelty/repeated pattern: 1 query
  - moderate ambiguity: 2 queries
  - high novelty/contradiction/decision-critical: 3-4 queries (hard max 4)
- Query semantic memory:
  ```bash
  cd {{WORKSPACE}} && {{PYTHON}} scripts/vault-search.py "<expanded query>" 5
  ```
- After each query, stop early if hits are redundant, confidence stabilizes, or no net-new signal appears.
- Use returned hits as long-term context anchors for this blink.

Then choose one branch:
- **70% semantic expansion** from the sampled artifact/thread:
  ```bash
  cd {{WORKSPACE}} && {{PYTHON}} scripts/vault-search.py "<query from sampled artifact + today's thread>" 3
  ```
- **30% random spice**:
  ```bash
  find {{VAULT_PATH}}/02_Journals/ -name '*.md' | shuf | head -1
  ```
  Read that file in full.

### 4) One micro what-if
Generate ONE concise scenario:
- what if this pattern continues 30 days?
- or what if the opposite is true?

### 5) Classify signal (Reality-First)
Classify as one of: 🌱 Seed / 🔗 Connection / ⚠️ Warning / 💡 Insight.
- Most should be 🌱/🔗.
- Only ⚠️/💡 if it would materially change today's decisions.
- **No abstract-only claims.** Every signal must cite at least 2 concrete facts observed this run (timestamps, counts, explicit file lines, or explicit actions/events).

### 6) Persist blink output (always)
Write a new file to:
`{{WORKSPACE}}/memory/blinks/YYYY-MM-DD-HHMM.md`

Required fields in the file:
- `Thread:`
- `Sampler Artifact:` (id + absolute path)
- `Concrete Evidence:` (minimum 2 bullet facts from this run; include source path + quote/snippet)
- `Key Terms:`
- `Query Budget Chosen:`
- `Expanded Queries:`
- `Long-Memory Hits:`
- `Stop Reason:`
- `Expansion Mode:` semantic|random
- `What-if:`
- `Classification:`
- `Today Action:` (one concrete action <=15 minutes, tied to evidence)

### 7) Surface gate (anti-regurgitation + cooldown)
Before writing ANY ⚠️/💡 to cron-inbox:
1. Respect quiet hours `{{QUIET_HOURS_START}}`-`{{QUIET_HOURS_END}}` `{{USER_TIMEZONE}}` → downgrade to 🌱 (no surfacing).
2. Check cooldown from `memory/heartbeat-state.json` (`alertCooldowns`) — if similar warning <4h, downgrade to 🌱.
3. Run dedupe:
```bash
{{PYTHON}} {{WORKSPACE}}/scripts/heartbeat-dedupe.py --key cron_blink_cycle --text "<candidate surfaced message>" --ttl-hours 12
```
- If `changed=false` → DO NOT append to cron-inbox.
- If `changed=true` and classification is ⚠️/💡 → append concise finding.

Append format:
```md
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Blink Cycle
Fact 1: ... (source)
Fact 2: ... (source)
Action: ... (<=15 min)
```

- If you cannot produce 2 concrete facts from this run, do not append to cron-inbox.

## Rules
- NEVER check inbox/email/GitHub/calendar.
- ALWAYS run sampler first.
- ALWAYS include sampled artifact id/path in blink file.
- No unsupported claims: only facts from files read this run.
- Keep it short.

## If nothing notable
- Still save blink file.
- Do not write to cron-inbox.
