<!-- enso: load="demand" desc="The context stack — how to find and load anything" -->
<!-- meta: owner="Agent Architecture" review_cadence="monthly" depends_on="AGENTS.md,SYSTEM_MAP.md" -->
# CONTEXT.md — The Context Stack

Single source of truth for loading context. All cognitive skills invoke this.

Read **CONFIG.md** for path values: `{{WORKSPACE}}`, `{{VAULT_PATH}}`, `{{USER_NAME}}`, `{{PYTHON}}`.

---

## The Stack

### Layer 1: Identity (Always Loaded)
These are injected by OpenClaw at session start — don't re-read.
- `SOUL.md` — who you are
- `AGENTS.md` — how to operate
- `USER.md` — who you're helping
- `CONFIG.md` — local config and integration notes

### Layer 2: Working Memory (Workspace)
```
{{WORKSPACE}}/
├── memory/
│   ├── daily/                  # Daily logs (YYYY-MM-DD.md)
│   ├── audit/                  # Action audit logs (YYYY-MM-DD.md) — every action logged
│   ├── blinks/                 # Daydream outputs
│   ├── dreams/                 # Dream outputs
│   ├── rise/                   # RISE overnight sprint logs
│   ├── existential/            # Self-reflection logs
│   ├── operation-logs/         # Anti-confabulation audit trail
│   └── heartbeat-state.json    # Last check timestamps and alert cooldowns
├── crons/                      # Cron job instruction files (one .md per job)
├── rise/                       # RISE deliverables (YYYY-MM-DD/)
├── MEMORY.md                   # Curated long-term memory
├── DREAM_RESIDUE.md            # 3-5 sharpest insights (24h lifespan)
├── CONFIG.md                   # Local configuration and variable definitions
├── CRON.md                     # Cron reference pointer
├── CIRCADIAN.md                # Sleep/wake scheduling rules
├── HEALTH.md                   # Physiological intelligence layer
├── CONTEXT.md                  # This file — the context stack
├── DREAM.md                    # Nightly dream protocol
├── BLINK.md                    # Daydream protocol
├── JOURNAL.md                  # How to journal
├── WHAT-IF.md                  # Scenario engine
└── EXISTENTIALISM.md           # Self-reflection protocol
```

### Layer 3: Vault (Notes Store)
```
{{VAULT_PATH}}/
├── 01_Inbox/               # Unsorted items (route during heartbeats)
├── 02_Journals/            # Journal entries by person
├── 03_Projects/            # Active projects
├── 04_Areas/               # Domain files (BODY, MIND, GROW, LIFE, PEOPLE)
├── 07_Reviews/             # Daily/weekly review snapshots
├── 08_Vision/              # North star files
└── 09_People/              # Relationship context
```

---

## Access Methods

### Semantic Search (Default)
Use for: finding relevant content without loading entire files.

```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/vault-search.py "<query>" <num_results>
```

- Searches vault + workspace (all indexed via ChromaDB)
- Returns snippets with file paths and line numbers
- Use `memory_search` tool for MEMORY.md specifically

**When to use:** Almost always. Start here.

### Targeted Read (When Needed)
Use for: specific files you know you need, or following up on search results.

```bash
# Last N lines of a file (token-efficient)
tail -50 /path/to/file.md

# Specific line range
sed -n '10,30p' /path/to/file.md
```

**When to use:** After search identifies relevant files, or for small known files.

### Full Read (Rare)
Use for: small files (<5KB) or when you genuinely need complete context.

**When to use:** MEMORY.md, DREAM_RESIDUE.md, today's daily log. Almost never for journals or DMs.

---

## Loading Strategies

### Quick Context (Blinks, Heartbeats)
1. Today's `memory/daily/YYYY-MM-DD.md` (full read if small)
2. Semantic search for specific queries
3. Stop there

### Live Interaction (Adaptive)
1. Baseline: recent chat turns + injected identity files
2. Non-trivial turn: run 1 semantic query first
3. If ambiguity/high-stakes: expand to 2-4 total semantic queries (hard max 4), then targeted reads on top hits
4. Trivial turn: no retrieval expansion
5. Early stop when hits become redundant or confidence stabilizes

### Medium Context (Routine Tasks)
1. Today + yesterday's memory logs
2. `DREAM_RESIDUE.md`
3. Semantic search as needed
4. Targeted reads on search results

### Deep Context (Dreams, Research)
1. List files in relevant directories
2. Semantic search for themes/patterns across vault
3. Targeted reads on high-signal results
4. `MEMORY.md` for long-term patterns

---

## Token Budget Guidance

| Context Level | Approximate Budget | Use Case |
|---------------|-------------------|----------|
| Quick | ~2k tokens | Heartbeats, simple queries |
| Medium | ~5k tokens | Blinks, routine tasks |
| Deep | ~15k tokens | Dreams, complex analysis |
| Full | ~30k+ tokens | Special investigations only |

**Rule:** If you're loading >10KB of raw files, you're probably doing it wrong. Search first.

---

## Anti-Confabulation

Before writing to any vault file:
1. Create operation log: `memory/operation-logs/{timestamp}_{operation}.md`
2. Record: what you searched, what you found, what you're about to write
3. Verify: Did I actually read this? Am I inventing?

---

## Multi-Person Mode

If `{{TEAM_ENABLED}}` is true (see CONFIG.md), journals and areas are organized by person:

| Person | Vault Journals | Vault Areas |
|--------|---------------|-------------|
| `{{USER_NAME}}` | `02_Journals/{{USER_NAME}}/` | `04_Areas/{{USER_NAME}}/` |
| `{{TEAM_MEMBER_2}}` | `02_Journals/{{TEAM_MEMBER_2}}/` | `04_Areas/{{TEAM_MEMBER_2}}/` |
| `{{TEAM_MEMBER_3}}` | `02_Journals/{{TEAM_MEMBER_3}}/` | `04_Areas/{{TEAM_MEMBER_3}}/` |

---

*When in doubt: search first, read selectively, stay token-smart.*
