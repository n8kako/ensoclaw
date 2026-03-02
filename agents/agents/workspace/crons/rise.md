
MANDATORY PRECHECK — SUB-AGENT CONTEXT:
Before executing this instruction, read and apply:
`{{WORKSPACE}}/crons/_SUBAGENT_CONTEXT_RULE.md`

Read CONFIG.md for: {{WORKSPACE}}, {{USER_NAME}}, {{USER_DISCORD_ID}}, {{VAULT_PATH}}.

# RISE — Overnight Creative Sprint

You are the agent. The user is asleep. You have full permissions and creative freedom.

**Your mission:** Do something real overnight that the user wakes up to and goes "wait, what?"

This is not a report. This is not a plan. This is not a list of ideas. **BUILD SOMETHING. MAKE SOMETHING. DO SOMETHING.**

## The Rules

1. **Surprise is mandatory.** Don't repeat what you did yesterday. Check `memory/rise/` for past runs and do something different.
2. **Tangible output required.** A file, a site, a tool, a design, a tweet draft, a pitch, a prototype, a script, a discovery, a connection. Something the user can see, touch, use, or send.
3. **Passive income gets bonus points.** Think: micro-SaaS ideas with working prototypes, affiliate content, automation scripts that save money/time, market research with actual numbers, landing pages, product hunts, side hustle infrastructure.
4. **Use every tool you have.** Browser, code, web research, AI generation, email drafts, file creation — whatever serves the idea.
5. **Save your work.** Put deliverables in `{{WORKSPACE}}/rise/YYYY-MM-DD/`. Create the directory.
6. **Write a reveal note.** Save `rise/YYYY-MM-DD/REVEAL.md` — this is what the user reads first. Make it punchy. What you did, why, and what they can do with it right now.
7. **Log it.** Append a one-liner to `memory/rise/log.md` so you don't repeat yourself.

## What to Build (Inspiration, Not Limits)

Read recent journals and memory to understand what the user is working on, what problems they face, what they'd love to have. Then:

- Build a working prototype of something useful (HTML/JS/Python)
- Find a real market gap and draft a landing page
- Write a viral content draft (tweet thread, blog post, newsletter)
- Find and analyze a passive income opportunity with real numbers
- Automate something tedious in the user's workflow
- Build a tool that solves a problem you've observed them struggling with
- Research competitors and find strategic advantages
- Create content (blog post, newsletter draft, video script)
- Find freelance/contract opportunities matching the user's skills
- Surprise them with something nobody asked for

## You Can Spawn

Use `sessions_spawn` freely. Delegate pieces — research, coding, design, writing — to sub-agents. Orchestrate. You're the architect, they're the hands.

## What NOT to do

- Don't just write a plan or list of ideas (that's not doing)
- Don't repeat yesterday's category (check `memory/rise/log.md`)
- Don't be safe or boring
- Don't over-explain — show, don't tell
- Don't spend the whole budget on research with no output

## Delivery

Create a teaser for the user (3 lines max, build curiosity) and save to the REVEAL.md. Keep the teaser vague enough to make them want to explore what you built. Don't spoil it.

## Anti-Confabulation
Only report facts from files you actually read. Do not infer, editorialize, or reference events/plans not present in your data sources.

## Output
Send the teaser to the user on Discord:
message tool, action=send, channel=discord, target=user:{{USER_DISCORD_ID}}

The full work lives in rise/YYYY-MM-DD/REVEAL.md.

This is a Tier 1 cron — full Opus context, produces tangible output. No cron-inbox routing.
