<!-- enso: load="demand" desc="Sleep/wake scheduling and enforcement" -->
<!-- meta: owner="Agent Health" review_cadence="weekly" depends_on="scripts/sleep-calc.py,data/sleep-tonight.json" -->
# CIRCADIAN.md — Sleep/Wake Scheduling & Enforcement

This file manages the user's sleep/wake cycle. For the full health intelligence layer (baselines, patterns, correlations, how to use health data), see **HEALTH.md**.

Read **CONFIG.md** for user-specific values: `{{USER_TIMEZONE}}`, `{{BEDTIME_CEILING}}`, `{{ALARM_CEILING}}`, `{{SLEEP_TARGET}}`, `{{USER_DISCORD_ID}}`.

---

## Sleep/Wake Computation

Script: `scripts/sleep-calc.py`
Output: `data/sleep-tonight.json`

Reads tomorrow's calendar, factors in:
- First event time - 15min commute - 30min wake buffer = alarm time
- Health data adjusts sleep target (configurable baseline, +1h if body battery low or stress high)
- Hard floor: alarm never later than `{{ALARM_CEILING}}`
- Hard ceiling: bedtime never later than `{{BEDTIME_CEILING}}`

Calendar IDs used: see CONFIG.md → `{{WORK_CALENDAR_ID}}`, `{{ACADEMIC_CALENDAR_ID}}`.

---

## Sleep Enforcement (After 6 PM)

When running after 6 PM `{{USER_TIMEZONE}}`:

1. Read `data/sleep-tonight.json` — if missing, run `scripts/sleep-calc.py`
2. Check `bedtime` field and `nudges_sent` array
3. **30 min before bedtime:** Send heads-up → "Bedtime in 30 — start wrapping up"
4. **At bedtime:** Send directive → "Bed. Now. Alarm is set for X. You committed to this."
5. **30 min past bedtime:** Final nudge → "You're past your bedtime. Every minute now costs you tomorrow."

After sending any nudge, update `data/sleep-tonight.json` with the nudge in `nudges_sent` array. Only one message per stage.

**On early-alarm nights (alarm before 6 AM):** Escalate tone. Non-negotiable.

Send nudges to: `message tool, action=send, channel=discord, target=user:{{USER_DISCORD_ID}}`

---

## Circadian Risk Factors

Circadian depletion amplifies vulnerability. Treat these as risk multipliers:
- After 10 PM with high stimulation still active
- Sleep debt + isolation
- Post-reward window with low structure

When these conditions appear, default to:
1. Immediate downshift routine (water, food, hygiene, low-light)
2. Short structured task or shutdown checklist
3. Hard transition to sleep boundary (no drifting)

---

## Scripts & Data

| File | Purpose |
|------|---------|
| `scripts/garmin-quick.py` | Fast wearable pull → `data/garmin/latest.json` |
| `scripts/garmin-fetch.py` | Full daily wearable pull → `data/garmin/YYYY-MM-DD.json` |
| `scripts/sleep-calc.py` | Compute tonight's sleep/wake → `data/sleep-tonight.json` |
| `data/garmin/baselines.md` | Health baselines reference |
| `data/garmin/latest.json` | Most recent quick pull |
| `data/sleep-tonight.json` | Tonight's computed sleep/wake |
| `data/schedule.md` | Weekly schedule reference |
