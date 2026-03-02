<!-- enso: load="always" desc="Local configuration — defines all workspace variables" -->
# CONFIG.md — Local Configuration

This file defines all the variables specific to your installation. Every `{{PLACEHOLDER}}` token in skills and cron files is resolved from here.

**Read this file first** whenever setting up a new session or integrating new skills.

---

## Paths

| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{WORKSPACE}}` | `/path/to/.openclaw/workspace` | Absolute path to your OpenClaw workspace |
| `{{VAULT_PATH}}` | `/path/to/your/vault` | Absolute path to your Obsidian vault (or notes directory) |
| `{{PYTHON}}` | `python3` | Python interpreter command |

**Example:**
```
WORKSPACE = /Users/yourname/.openclaw/workspace
VAULT_PATH = /Users/yourname/Documents/Notes
PYTHON = python3.13
```

---

## User Identity

| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{USER_NAME}}` | _(your name)_ | Primary user's name |
| `{{USER_DISCORD_ID}}` | _(Discord user ID)_ | Your Discord user ID (for direct message delivery) |
| `{{USER_LOCATION}}` | _(city, state/country)_ | Your location (used for weather, timezone) |
| `{{USER_TIMEZONE}}` | `EST` | Your timezone (e.g., EST, PST, UTC) |

---

## Integrations

### GitHub
| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{GITHUB_REPO}}` | `username/repo` | Your primary GitHub repository to monitor |

### Google Calendar
| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{PRIMARY_CALENDAR_ID}}` | `primary` | Primary Google Calendar ID |
| `{{WORK_CALENDAR_ID}}` | _(calendar ID)_ | Work/professional calendar ID (optional) |
| `{{ACADEMIC_CALENDAR_ID}}` | _(calendar ID)_ | School/academic calendar ID (optional) |

### Google Sheets (Daily Tracker)
| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{TRACKER_SHEET_ID}}` | _(sheet ID)_ | Google Sheets ID for daily habit tracker (optional) |

### LMS / Academic (Optional)
| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{LMS_PLATFORM}}` | `canvas` or `blackboard` etc. | Your LMS platform |
| `{{LMS_BASE_URL}}` | _(URL)_ | Base URL of your LMS |
| `{{LMS_COURSE_IDS}}` | `[id1, id2, id3]` | List of course IDs to track |

### Garmin Health (Optional)
| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{GARMIN_CREDENTIALS}}` | `{{WORKSPACE}}/.credentials/garmin.json` | Path to Garmin credentials file |

---

## Health Baselines

Fill these in after 30+ days of Garmin data collection, or set initial estimates and refine over time.

| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{BASELINE_RHR}}` | _(bpm)_ | Your resting heart rate baseline (e.g., `55 bpm`) |
| `{{BASELINE_SLEEP_SCORE}}` | _(0-100)_ | Your typical sleep score range (e.g., `65-80`) |
| `{{BASELINE_BODY_BATTERY}}` | _(0-100)_ | Typical waking body battery (e.g., `70-90`) |
| `{{BASELINE_STRESS}}` | _(0-100)_ | Typical daily stress range (e.g., `15-30`) |
| `{{BASELINE_HRV}}` | _(ms)_ | Overnight HRV baseline (e.g., `45-65ms`) |
| `{{SLEEP_TARGET}}` | `7.5h` | Target sleep duration |
| `{{BEDTIME_CEILING}}` | `midnight` | Never sleep later than this |
| `{{ALARM_CEILING}}` | `9:00 AM` | Never alarm later than this |

---

## Team Members (Optional)

If you are tracking multiple people (e.g., a co-founder team or household):

| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{TEAM_ENABLED}}` | `true` or `false` | Whether team/multi-user mode is active |
| `{{TEAM_MEMBER_2}}` | _(name)_ | Second person's name (optional) |
| `{{TEAM_MEMBER_3}}` | _(name)_ | Third person's name (optional) |

**Vault structure for team mode:**
```
{{VAULT_PATH}}/
├── 02_Journals/{{USER_NAME}}/
├── 02_Journals/{{TEAM_MEMBER_2}}/
├── 02_Journals/{{TEAM_MEMBER_3}}/
├── 04_Areas/{{USER_NAME}}/
...
```

---

## Vault Structure

This system uses a PARA-inspired vault layout. Customize as needed:

```
{{VAULT_PATH}}/
├── 01_Inbox/          # Unsorted items (routed during heartbeats)
├── 02_Journals/       # Journal entries by person
├── 03_Projects/       # Active projects
├── 04_Areas/          # Domain files (BODY, MIND, GROW, LIFE, PEOPLE)
├── 07_Reviews/        # Review snapshots (daily, weekly, existential)
├── 08_Vision/         # North star and long-term goals
└── 09_People/         # Relationship context
```

---

## Quiet Hours

| Variable | Your Value | Description |
|----------|-----------|-------------|
| `{{QUIET_HOURS_START}}` | `23:00` | No proactive alerts after this time |
| `{{QUIET_HOURS_END}}` | `08:00` | Resume proactive alerts at this time |

---

## How to Apply This Config

**Option A — Manual:** Find+replace each `{{VARIABLE}}` token in the skill and cron files with your values.

**Option B — Agent-assisted:** Tell your agent:
> "Read CONFIG.md, then find and replace all {{PLACEHOLDER}} tokens in workspace/*.md and crons/*.md with the values defined there."

**Option C — Script:**
```bash
# Example sed substitution
sed -i 's|{{WORKSPACE}}|/Users/yourname/.openclaw/workspace|g' workspace/*.md crons/*.md
sed -i 's|{{USER_NAME}}|YourName|g' workspace/*.md crons/*.md
# ... etc for each variable
```
