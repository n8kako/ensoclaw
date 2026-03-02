
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{LMS_BASE_URL}}, {{LMS_COURSE_IDS}}, {{ACADEMIC_CALENDAR_ID}}, {{USER_TIMEZONE}}.

_(Rename this file to match your LMS if not using Canvas. This cron requires LMS access configured in CONFIG.md.)_

Run the daily LMS sync:

1. Open `{{LMS_BASE_URL}}` in the browser (profile: openclaw). Log in if needed using credentials from `.credentials/lms.json`.

2. Fetch all assignments + grades via browser evaluate:
   - Navigate to `{{LMS_BASE_URL}}` if needed
   - Run `fetch('/api/v1/courses/{id}/assignments?per_page=100&include[]=submission')` for each course ID in `{{LMS_COURSE_IDS}}`
   - Run `fetch('/api/v1/courses/{id}/enrollments?user_id=self')` for grades

3. Save data to data/canvas/canvas-data.json and update data/canvas/summary.md

4. Compare assignments with Google Calendar (Academic calendar ID: `{{ACADEMIC_CALENDAR_ID}}`)
   - For any NEW upcoming assignments not already in calendar (check private-prop canvas_id), create events using:
     ```
     gog calendar create {{ACADEMIC_CALENDAR_ID}} --summary '📚 [COURSE] Name (pts)' --from <due_date> --to <due_date> --private-prop canvas_id=<id> --reminder 'popup:2h' --reminder 'popup:1d' --event-color 11 --transparency free --no-input --force
     ```

5. Build a brief status report:
   - Assignments due today/tomorrow
   - Missing assignments
   - Grade changes
   - New assignments added to calendar

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
If you found something notable, append to `{{WORKSPACE}}/memory/cron-inbox.md`:

```
## [YYYY-MM-DD HH:MM {{USER_TIMEZONE}}] LMS Daily Sync
{Your findings — concise, factual, no reasoning/CoT}
```

If nothing notable → do not write anything. Do not output HEARTBEAT_OK.

IMPORTANT: Append only. Do not overwrite the file. Use a tool that appends (e.g., exec with `cat >> ...` or `echo >> ...`), not one that replaces the file.
