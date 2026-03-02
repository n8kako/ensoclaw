<!-- enso: load="demand" desc="How to create new skills — meta-skill for skill authoring" -->
<!-- meta: owner="Enso Builder" review_cadence="monthly" depends_on="skills/*" -->
# SKILL.md — How to Create Skills

A skill is a CAPS `.md` file in the workspace root. That's it.

## Creating a Skill

1. **Write the file:** `WHATEVER.md` in `{{WORKSPACE}}/` (see CONFIG.md for your workspace path)
2. **Add the metadata tag** on line 1:
   ```
   <!-- enso: load="demand" desc="One-line description of what this does" -->
   ```
3. **Done.** The file watcher auto-runs `sync-skills.py` and AGENTS.md updates.

## Metadata Fields

| Field | Values | Meaning |
|-------|--------|---------|
| `load` | `"always"` | Injected every session (workspace context). Use sparingly — costs tokens every message. |
| `load` | `"demand"` | Read when relevant. Default for most skills. |
| `desc` | string | One-line description. Shows up in AGENTS.md skills index. Be specific. |

## File Structure

```markdown
<!-- enso: load="demand" desc="What this skill does" -->
# NAME.md — Title

What to do. Concrete steps. Commands to run. Files to read/write.

No preamble. No "this file is for..." — the desc tag handles that.
```

## Rules

- **Name:** ALL CAPS, hyphens and underscores allowed. `[A-Z][A-Z0-9_-]*\.md`
- **No boilerplate.** Get to the instructions.
- **Concrete > abstract.** Commands, paths, conditions, exit criteria.
- **Self-contained.** A skill should work without reading other skills (reference them if needed, don't depend on having read them).
- **`load="always"` is expensive.** Only identity/memory/operations files need it. If in doubt, use `"demand"`.

## When to Create a Skill

When a pattern repeats:
- Same type of task keeps coming up
- A cron job needs behavioral rules that are shared across jobs
- A domain has enough nuance to warrant its own doc (health, sleep, academics)

Don't create a skill for one-off instructions. That's what `crons/*.md` files are for.

## Skill vs Cron Instruction

| | Skill (`.md` in root) | Cron instruction (`crons/*.md`) |
|---|---|---|
| **Scope** | Reusable across sessions and crons | Single cron job |
| **Loaded by** | Any session that needs it | Only its cron job |
| **In AGENTS.md** | Yes (auto-synced) | No |
| **Example** | `HEALTH.md` — health data rules | `crons/health-check-in.md` — specific check-in steps |
