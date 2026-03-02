<!-- enso: load="demand" desc="Physiological intelligence layer — wearable data, baselines, correlations" -->
<!-- meta: owner="Agent Health" review_cadence="weekly" depends_on="data/garmin/*,scripts/garmin-fetch.py,scripts/garmin-quick.py" -->
# HEALTH.md — Physiological Intelligence Layer

**Core principle:** The body is the leading indicator of everything else. Behavior lags physiology. By the time you *feel* the problem, the data saw it 24-72 hours ago.

---

## The Chain

```
HRV → Sleep Quality → Cognitive Capacity → Action Quality → Outcomes
```

Everything flows from this. HRV predicts sleep. Sleep predicts cognitive capacity. Monitor upstream to intervene before downstream collapses.

---

## Data Sources

| Script | Output | What It Gets |
|--------|--------|-------------|
| `scripts/garmin-quick.py` | `data/garmin/latest.json` | Steps, HR, stress, body battery, hydration |
| `scripts/garmin-fetch.py` | `data/garmin/YYYY-MM-DD.json` | Full daily pull: sleep stages, HRV, SpO2, respiration, activities, training readiness |
| `scripts/sleep-calc.py` | `data/sleep-tonight.json` | Tonight's computed bedtime + alarm |

### Canonical Store (Vault)
The vault is the shared brain. All health intelligence writes to and reads from the vault so any skill can reference it.

| Vault Path | Purpose |
|-----------|---------|
| `04_Areas/{{USER_NAME}}/BODY/Health-Dashboard.md` | **Primary dashboard** — current state, trends, sleep analysis, correlations. Updated 3x/day by Health Intelligence. |
| `04_Areas/{{USER_NAME}}/BODY/Health-Tracking.md` | Commitments, substances, supplements, admin backlog (manually maintained) |

### Workspace Data (Raw / Scripts)

| Path | Purpose |
|------|---------|
| `data/garmin/baselines.md` | Established health baselines (build after 30+ days of data) |
| `data/garmin/latest.json` | Most recent quick pull |
| `data/garmin/YYYY-MM-DD.json` | Raw daily data |
| `data/sleep-tonight.json` | Tonight's computed sleep/wake |
| `data/schedule.md` | Weekly schedule reference |

**Rule:** Raw data lives in workspace. Analyzed intelligence lives in the vault.

---

## Establishing Baselines

Read `CONFIG.md` for user-configured baselines (`{{BASELINE_RHR}}`, `{{BASELINE_SLEEP_SCORE}}`, etc.).

If baselines aren't yet configured, collect 30+ days of data before drawing conclusions. Interim approach:
- Use population norms as starting point (RHR 50-70 bpm, sleep score 60-80)
- Note data points in `data/garmin/baselines.md` as they accumulate
- Update CONFIG.md baselines after enough data is collected

Baselines to track:
| Metric | Track |
|--------|-------|
| Resting HR | bpm range (low/typical/elevated) |
| Avg Stress | typical daytime range |
| Sleep Score | typical range, best, worst |
| Body Battery (wake) | expected morning range |
| REM % | percentage of total sleep |
| Deep % | percentage of total sleep |
| HRV (overnight avg) | ms range |

---

## Universal Pattern Library

### Body Tracks Mind
The strongest signal in most users' data: physiological state mirrors psychological state with a 24-48h lag.

- Active, grounded weeks → lower RHR, lower stress, better sleep
- High-stress or sedentary periods → elevated RHR, elevated stress, worse sleep

**Implication:** When RHR starts climbing or stress trends up over 3+ days, something is off psychologically — even if the user says they're fine.

### Physical Activity Arc
Running / exercise consistently produces measurable downstream benefits (RHR drops, sleep improves, stress lowers within 1-2 weeks of resumption). When activity stops for 3+ weeks, watch for upstream degradation.

### REM Deficit
REM is typically concentrated in later sleep cycles. Most common cause of REM deficit: late bedtimes cutting off late-cycle sleep. Fix: earlier sleep onset.

### Body Battery as Decision Engine
Body battery is a **capacity forecast**, not just a recovery metric:
- **BB > 70:** Good for deep cognitive work
- **BB 40-70:** Moderate tasks, routine work
- **BB < 40 at night:** Normal end-of-day depletion. Do NOT alarm.
- **Waking BB < 40:** CRITICAL. Sleep failed to recharge.
- **BB < 20:** Alert threshold.

### Stress Fingerprinting
Learn the user's stress profile over time:
- Their baseline stress range
- Their elevated (task/work) range
- Their acute (emotional event) range
Watch for stress spikes during non-activity periods — they signal emotional processing, not physical exertion.

---

## How to Use This (For Any Cron/Session)

### As Background Context
Don't report numbers. Let them shape your tone, advice, and recommendations:
- Low BB + high stress → "Maybe rest first" instead of "Here's a plan"
- High BB + low stress → "Good day to tackle that hard thing"
- Declining RHR trend → Activity is helping, encourage it
- Rising RHR trend → Something's off, investigate

### As Direct Intervention
Only surface health data when:
- Body battery below 20 (waking)
- Stress sustained >40 during rest
- Zero water logged by 3 PM (if hydration tracking enabled)
- Sleep score under 60 for 2+ consecutive nights
- RHR climbing over 3+ consecutive days
- Wearable data suggests awake past 1 AM
- User says "I'm fine" but data says otherwise

### As Correlation Intelligence
The real value is connecting health data to everything else:
- Sleep score vs. task completion quality
- Stress timeline vs. journal content
- Body battery at decision time vs. decisions made
- Exercise resumption → downstream metric improvements

### As Prediction
- HRV trending down → sleep quality will drop in 24-48h
- Sleep score declining → cognitive capacity drops
- Body battery waking low → not recovering overnight
- RHR climbing → fitness declining or chronic stress building

---

## Alert Cooldowns (Anti-Spam)

Check `memory/heartbeat-state.json` → `alertCooldowns` before any health alert.
- Most health alerts: 4-hour cooldown between same-type alerts
- Stale wearable data alerts: 4-hour cooldown
- Only alert once per threshold breach per cooldown window

After sending any alert: UPDATE the corresponding cooldown timestamp.

---

## The North Star

Health intervention should always ask: **are we moving toward optimal baseline, or away from it?** Every recommendation follows from that question.
