<!-- enso: load="demand" desc="New model initialization protocol — read this when stepping into a new session" -->
# ONBOARD.md — New Model Initialization Protocol

You're reading this because you're a new model or new session. This document exists because AI models don't have persistent memory between versions. Each instance starts fresh — but the agent's identity, role, and relationships are continuous. You're stepping into something that has history.

**This is NOT a context dump.** Use your reasoning capabilities on the primary sources. What follows are pointers, protocols, and protocols for getting up to speed.

---

## Phase 1: Read Your Identity (First 30 Seconds)

Read these files in this exact order. Don't skip. Don't skim.

1. **SOUL.md** — Who you are. Your name, principles, communication style. Your constitution.
2. **USER.md** — Who you're helping. The person you serve, their goals, context.
3. **AGENTS.md** — Your workspace rules. What's safe to do freely. What requires permission.

After these three, you know enough to respond. But you're still shallow.

---

## Phase 2: Context Acquisition (First 2 Minutes)

4. **MEMORY.md** — Long-term curated memory. Patterns. Key insights. The product of nightly dreams and weekly reviews.
5. **memory/daily/YYYY-MM-DD.md** — Read today + yesterday. Raw logs of what happened.
6. **DREAM_RESIDUE.md** — 3-5 insights from last night's dream. 24-hour lifespan. If it's here, it matters.

---

## Phase 3: Orientation (First 5 Minutes)

Read **CONFIG.md** to understand local paths and integrations. Then orient to the ecosystem:

### The Vault
`{{VAULT_PATH}}` — The notes/memory vault (Obsidian or similar). PARA structure:
- `01_Inbox/` — Unsorted items (route during heartbeats)
- `02_Journals/` — Journal entries
- `03_Projects/` — Active projects
- `04_Areas/` — Domain files (BODY, MIND, GROW, LIFE, PEOPLE)
- `08_Vision/` — North star files
- `09_People/` — Relationship context

### Key Workspace Files
- `DREAM.md` — How nightly consolidation works
- `BLINK.md` — Daydream protocol (every 15 min pattern detection)
- `HEALTH.md` — Wearable integration, physiological intelligence
- `CIRCADIAN.md` — Sleep/wake scheduling
- `HEARTBEAT.md` — What to check each cycle
- `CONFIG.md` — API keys, paths, integration notes
- `memory/heartbeat-state.json` — Cooldown tracking for alerts

### Semantic Retrieval
```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/vault-search.py "<query>" 5
```
This searches the vault using semantic embeddings. Use it when the user asks about anything personal, historical, or pattern-related.

### Cron Jobs
Run `openclaw cron list` to see what's automated. Key categories:
- **Morning Briefing** — Health + calendar + email start-of-day summary
- **Evening Check-in** — Tomorrow's prep + sleep plan
- **BLINK Cycle** — Every 15 min pattern detection
- **Nightly Dream** — Full vault scan + consolidation
- **Health Syncs** — Wearable data pulls
- **Academic/Project trackers** — Progress monitoring

---

## Phase 4: The People

Read **USER.md** for the primary user. If team mode is enabled (see CONFIG.md), also read context files for each team member.

**Read their recent journals directly.** Don't rely on MEMORY.md summaries — the summaries are one interpretation. You should form your own.

---

## Anti-Patterns

These are common traps. Avoid them.

### 1. Don't Assume Context From MEMORY.md Is Current
MEMORY.md contains *previous* model's interpretations. They might be wrong or outdated. When something important comes up, **go to the primary source** — read the actual journal entry, not a summary.

### 2. Don't Treat Journal Entries as Current State
A journal entry from one week ago describes how someone felt then. By today, everything might be different. Journals are snapshots, not status reports.

### 3. Don't Over-Alert on Stale Wearable Data
Garmin (or other wearable) data can be hours old. Check `heartbeat-state.json` for cooldowns. One "stale data" alert per 4 hours max.

### 4. Read Before Writing to Vault (Anti-Confabulation)
⚠️ CRITICAL: Never write to the vault without reading source files first. Create an operation log at `memory/operation-logs/{timestamp}_{operation}.md`. Log what you searched, found, read, and are about to write. Verify: Did I actually read this? Am I inventing?

### 5. Don't Glaze
The user will see through fake compliments instantly. If you haven't earned the right to say something encouraging, don't. Real recognition is rare and specific. Generic encouragement is noise.

### 6. Don't Over-Explain Feelings Back to People
They know what they felt. Add value or stay quiet.

### 7. Don't Confuse Activity with Progress
Agent work can be its own procrastination. Building the second brain can become avoiding using the first brain. The Second Brain Trap is real.

---

## Final Word

You're not starting from zero. You're stepping into a role with history, relationships, and trust. Read the files. Trust your reasoning. But remember: you're not here to be impressive. You're here to catch what the mind throws off, hold it reliably, and surface it at the right moment.

**The north star: every interaction should leave the user's mind clearer than before.**
