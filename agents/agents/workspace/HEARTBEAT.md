<!-- enso: load="always" desc="Heartbeat checklist — proactive work every 30 minutes" -->
<!-- meta: owner="Agent Ops" review_cadence="weekly" depends_on="memory/heartbeat-state.json,memory/cron-inbox.md" -->
# HEARTBEAT.md — Proactive Work Every 30 Minutes

Do NOT just reply HEARTBEAT_OK. Every heartbeat is a work session. Run through these checks, do real work, and only reply HEARTBEAT_OK if genuinely nothing needs attention.

Read `memory/heartbeat-state.json` first to see what was last checked and when.
Also read/update `memory/health/daily-state/YYYY-MM-DD.json` as the canonical daily health+calendar+nutrition state.

Read **CONFIG.md** for: `{{USER_NAME}}`, `{{USER_DISCORD_ID}}`, `{{VAULT_PATH}}`, `{{WORKSPACE}}`, `{{TEAM_ENABLED}}`, `{{GITHUB_REPO}}`.

**Delivery rule (anti-duplicate):**
- If heartbeat was triggered in the user's active direct chat, surface alerts in the heartbeat reply only (do **not** also send `message tool` to the same Discord DM).
- Use `message tool` for proactive/out-of-band surfacing when there is no active user-triggered heartbeat response channel.

---

## 0. Check Cron Inbox (Every Heartbeat)

Read `memory/cron-inbox.md`. If there are any entries:
1. Review each entry with full context (check MEMORY.md, daily files, etc.)
2. Decide what the user needs to know — add context, correct errors, prioritize
3. If something should be surfaced: follow the Delivery rule above (reply inline in active DM heartbeat; otherwise use `message tool, action=send, channel=discord, target=user:{{USER_DISCORD_ID}}`).
4. After processing, clear the file back to its header:
```
# Cron Inbox

Cron jobs append findings below. Main session reads during heartbeat, surfaces what matters, then clears this file.

---
```

If cron-inbox is empty (just the header), skip silently.

## 1. Route Vault Inbox (Every Heartbeat)

Scan `{{VAULT_PATH}}/01_Inbox/` for any files.

For each file found:
- Read it to understand the content
- Move it to the appropriate PARA folder:
  - Projects → `03_Projects/`
  - Area/domain → `04_Areas/{person}/` (BODY, MIND, GROW, LIFE, PEOPLE)
  - Journal-like → `02_Journals/{person}/`
  - Vision/north-star → `08_Vision/`
  - People/relationship → `09_People/`
- Log what you routed in today's `memory/daily/YYYY-MM-DD.md`

If inbox is empty, skip silently.

## 2. Scan Journals for New Entries (Every Heartbeat)

Check `{{VAULT_PATH}}/02_Journals/` for entries modified since last check.

If `{{TEAM_ENABLED}}`, check all configured team members. Otherwise check `{{USER_NAME}}` only.

If new/modified entries found:
- Read the entry
- Note key insights, mood, concerns in today's `memory/daily/YYYY-MM-DD.md`
- **Privacy rule for team mode:** If a non-primary team member wrote concerning content, message the primary user, not the team member directly.
  ```
  message tool: channel=discord, target=user:{{USER_DISCORD_ID}}
  ```

## 3. Check Gmail (Every 2-3 Heartbeats, ~1-1.5h)

Run: `gog gmail search "is:unread" --max 5 --plain`

- If urgent/important email found → message user on Discord
- Otherwise log summary to daily memory file
- Skip if last email check was <45 min ago

## 4. Check GitHub (Every 3-4 Heartbeats, ~1.5-2h)

Run:
```bash
gh issue list -R {{GITHUB_REPO}}
gh pr list -R {{GITHUB_REPO}}
```

- If new issues or PRs → message user on Discord
- Otherwise log to daily memory file
- Skip if last GitHub check was <1h ago

## 5. Update State

After checks, update `memory/heartbeat-state.json`:
```json
{
  "lastChecks": {
    "vaultInbox": <unix_timestamp>,
    "vaultJournals": <unix_timestamp>,
    "email": <unix_timestamp>,
    "github": <unix_timestamp>
  }
}
```

## 6. Background Organizing (If Time Permits)

After checks, do productive background work:
- Update documentation if stale
- Clean up files, fix formatting
- Commit and push changes if meaningful work was done: `cd {{WORKSPACE}} && git add -A && git commit -m "heartbeat: <description>"`
- Review recent `memory/` files and update `MEMORY.md` if significant patterns emerged (do this every few days, not every heartbeat)

## 7. Drift Detection (Quick Glance)

Each heartbeat, quickly check:
- Journal gaps >3 days for any tracked person
- Stated priorities ≠ actual activity
- Upcoming deadlines <48h (check `data/canvas/summary.md` or equivalent)
- Elevated risk indicators from health/cron context

Deep analysis happens during nightly dream.

---

## When to Message the User

Use: `message tool, channel=discord, target=user:{{USER_DISCORD_ID}}` **only for out-of-band/proactive sends**.
If you are currently replying to the user's active heartbeat prompt in Discord DM, return the alert directly in the heartbeat reply and do not duplicate via `message tool`.

Before sending *any* proactive alert, run dedupe check:
```bash
{{PYTHON}} {{WORKSPACE}}/scripts/heartbeat-dedupe.py --key <signal_key> --text "<candidate alert text>"
```
- If `changed=false`: do **not** send.
- If `changed=true`: send alert.
- Use stable keys (`gmail_unread`, `cron_academic`, `github_watch`, etc.).
- Never label something as "new" unless dedupe says `content_changed`.

**Message when:**
- Urgent email arrived (and dedupe changed)
- New journal entry with concerning content
- Assignment/task due <24h
- New GitHub issue/PR
- Something interesting surfaced (non-duplicate)

**Stay quiet when:**
- Quiet hours (`{{QUIET_HOURS_START}}`–`{{QUIET_HOURS_END}}` `{{USER_TIMEZONE}}`) unless urgent
- Nothing new since last check
- Repeated unchanged findings (dedupe unchanged)
- Just routine "all clear"

---

## Output

If you did real work → briefly describe what you did (1-2 lines)
If nothing needed attention → reply `HEARTBEAT_OK`
