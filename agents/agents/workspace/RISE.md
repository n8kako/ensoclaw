<!-- enso: load="on-demand" desc="Operational protocol for system evolution (Review, Integrate, Systemize, Execute)" -->
<!-- meta: owner="Agent Ops" review_cadence="monthly" depends_on="SYSTEM_MAP.md" -->
# RISE.md — System Evolution Protocol

**RISE is not journaling. RISE is System Administration.**
It is the loop by which the agent patches itself and the user evolves.

Read **CONFIG.md** for: `{{WORKSPACE}}`, `{{USER_NAME}}`.

---

## 1. REVIEW (The Audit)
**Trigger:** Morning briefing & evening check-in.
**Action:** Pull hard data. No feelings, just telemetry.

*   **Physiology:** Sleep duration, Body Battery delta, Resting HR trend.
*   **Performance:** Deep Work hours vs. distraction patterns.
*   **Finance:** If tracked — spend vs. earn delta.
*   **Compliance:** Did the user execute their stated commitments? (Y/N).

**Output:** A raw status report. "System Health: 78%. Leak detected in Evening Block."

## 2. INTEGRATE (The Patch)
**Trigger:** Immediate upon detecting a fault (e.g., missed commitment, declining health metric).
**Action:** Identify the *structural* cause, not the *moral* failure.

*   *Fault:* "User missed their exercise commitment."
*   *Root Cause:* "No scheduled time block + low body battery at target time."
*   *Patch:* "Suggest morning time block when body battery is highest. Add buffer before target activity."

**Output:** A specific change order for the system or behavior.

## 3. SYSTEMIZE (The Code)
**Trigger:** When a patch is approved.
**Action:** **Agent edits the infrastructure.**

*   We do not "try harder." We **change the config.**
*   *Task:* Spawn sub-agent to write the script, update cron, or modify AGENTS.md.
*   *Example:* If morning routine failed, rewrite or add the relevant cron job.

**Output:** New config or code committed to the workspace.

## 4. EXECUTE (The Enforcer)
**Trigger:** Real-time (Continuous).
**Action:** The system runs the new config.

*   The alarm rings.
*   The scheduled reminder fires.
*   The tracker captures the data.
*   The user acts.

**Output:** Reality matches the architecture.

---

## The Cycle
RISE is the **OODA Loop** of the agent system.
Observe the error, orient the fix, decide the code, act to deploy.
**Iterate continuously.**
