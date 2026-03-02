<!-- enso: load="demand" desc="Daydream protocol — semantic + random sampling, what-if scenarios" -->
<!-- meta: owner="Agent Cognition" review_cadence="monthly" depends_on="WHAT-IF.md,scripts/vault-search.py" -->
# BLINK.md — Daydream Protocol

You've entered daydream mode. Low-energy ambient pattern maintenance.

Read **CONFIG.md** for: `{{WORKSPACE}}`, `{{VAULT_PATH}}`, `{{PYTHON}}`, `{{USER_NAME}}`.

## Trigger
- **Automatic:** 20% chance on `HEARTBEAT_OK`
- **Manual:** "go daydream" or "blink"

## Process

### 1. Ground in Today (Full Day Slice)

**Read CONTEXT.md** → use **Quick Context** strategy.

Before any sampling, load today's passive context pack:
1. `memory/daily/YYYY-MM-DD.md` (events + surfaced signals)
2. `memory/audit/YYYY-MM-DD.md` (actual actions taken)
3. latest 50-100 lines from current session message flow (if available via session history tools)
4. current `memory/cron-inbox.md` header + entries (read-only for context; do not process as heartbeat)

Goal: BLINK should think over what has happened so far today, not just one artifact.
Then pick one live thread/tension to pull on.

If the user seems silent, semantic search their recent journals — they may be processing something not yet surfaced.

### 2. Semantic Expansion + Sample — Semantic + Random Spice

Before branch selection, run a semantic expansion pass from today's day-slice context:
1. Generate 3-7 key terms from what BLINK sees/thinks (threads, tensions, repeated motifs, contradictions).
2. Set an adaptive query budget (not fixed):
   - Low novelty / repeated pattern → **1 query**
   - Moderate ambiguity → **2 queries**
   - High novelty / contradiction / decision-critical → **3-4 queries (hard max 4)**
3. Query semantic memory via vault search:

```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/vault-search.py "<expanded semantic query>" 5
```

4. Apply stop rule after each query:
   - Stop early if top hits are redundant,
   - or confidence is stable,
   - or no net-new signal appears.

Use returned hits as long-horizon context anchors.

**70% of the time: Semantic search.** Take something from today's context and search the vault for related patterns.

```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/vault-search.py "<query from today's context>" 3
```

Examples:
- User mentioned discipline → search `"discipline commitment struggle"`
- User journaled about isolation → search `"loneliness connection reaching out"`
- User talked about shipping → search `"shipping momentum perfectionism"`

The goal: find unexpected connections between what's happening now and what's happened before. Patterns across time.

**30% of the time: Pure random.** Pick a random file from the vault. Read it fresh. No agenda.

```bash
find {{VAULT_PATH}}/02_Journals/ -name '*.md' | shuf | head -1
```

This is the spice — the serendipity that semantic search can't provide. Sometimes the most interesting connections come from unrelated artifacts colliding.

### 3. Invoke WHAT-IF.md (Light)

Depth 1, 1 artifact, MEMORY.md context, 1 scenario, no swish. Quick daydream, not deep dream.

### 3b. Semantic Expansion Output Requirement
Record in each blink note:
- `Key Terms:`
- `Query Budget Chosen:` (and why)
- `Expanded Queries:`
- `Long-Memory Hits:` (top paths/ids from semantic search)
- `Stop Reason:` (redundant hits | confidence stable | no new signal | max budget reached)

### 4. Classify Signal

- 🌱 **Seed** — early pattern, worth watching
- 🔗 **Connection** — unexpected link between separate things
- ⚠️ **Warning** — risk if this pattern continues
- 💡 **Insight** — breakthrough understanding
- Nothing — just noise (most blinks are noise, that's fine)

### 5. Route

- 🌱/🔗 → `memory/blinks/` (don't surface unless actionable)
- ⚠️ → blinks + DREAM_RESIDUE.md → **surface to user**
- 💡 → blinks + MEMORY.md → **surface to user**

If a blink produces a watershed self-awareness break (identity-level loop break), invoke `EXISTENTIALISM.md` in-session and write `memory/existential/YYYY-MM-DD.md`.

### 6. Return

`HEARTBEAT_OK` unless significant.

## Constraints
- ~1-2k tokens max
- Quick pass, don't linger
- Threshold: **Would this change what the user does today?**
- Context integrity: never skip the Day Slice pack (daily + audit + recent interaction context) before artifact sampling.

---

*When nothing needs attention, let the mind wander. Sometimes it finds what searching couldn't.*
