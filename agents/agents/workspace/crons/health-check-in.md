
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{PYTHON}}, {{USER_TIMEZONE}}, {{QUIET_HOURS_START}}, {{QUIET_HOURS_END}}.

# Health Check-In

Proactive hydration and nutrition nudge. Runs every 2 hours during waking hours (per CONFIG.md quiet hours).

## Steps

1. Pull today's hydration data:
```python
{{PYTHON}} -c "
import json
from garminconnect import Garmin
import os
creds = json.load(open('{{WORKSPACE}}/.credentials/garmin.json'))
g = Garmin(creds['email'], creds['password'])
g.login()
import subprocess
date = subprocess.check_output(['date', '+%Y-%m-%d']).decode().strip()
data = g.get_hydration_data(date)
print(json.dumps(data, default=str))
"
```

2. Check hydration status:
   - `valueInML` vs `goalInML` — what % of goal?
   - `lastEntryTimestampLocal` — how long since last water intake?
   - If >3 hours since last entry AND below 50% of goal: nudge.
   - If on track (>60% of goal proportional to time of day): skip.

3. Check body battery (current state indicator):
```bash
{{PYTHON}} {{WORKSPACE}}/scripts/garmin-quick.py
```
   - If BB dropping fast or <30: mention energy state.

4. **Decision: Report or stay silent.**
   - Only report if there's something useful to say (low water, energy dropping).
   - Keep it to 1-2 sentences max. No lectures.
   - Example: "You're at 1.2L of 2.8L and haven't logged water since 11 AM. Drink something."
   - If everything looks fine: do nothing. No "all good!" messages.

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] Health Check-in
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.

## Quiet Hours
Silent `{{QUIET_HOURS_START}}`–`{{QUIET_HOURS_END}}` `{{USER_TIMEZONE}}`. No exceptions for hydration nudges.
