<!-- enso: load="demand" desc="Scenario engine — used by dream and blink for narrative simulation" -->
<!-- meta: owner="Agent Cognition" review_cadence="monthly" depends_on="scripts/sample-artifacts.mjs,scripts/vault-search.py" -->
# WHAT-IF.md — Scenario Engine

A tool for generating and exploring hypothetical scenarios. Used by BLINK.md (quick) and DREAM.md (deep).

Read **CONFIG.md** for: `{{WORKSPACE}}`, `{{VAULT_PATH}}`, `{{PYTHON}}`.

---

## Parameters

### Caller-Specified (Input)

| Parameter | Description | Blink Default | Dream Default |
|-----------|-------------|---------------|---------------|
| `depth` | How far back to sample (days) | 1 | 14 |
| `artifacts` | Number of artifacts to sample | 1 | 10+ |
| `context` | What's already loaded | MEMORY.md only | Full vault |
| `scenarios` | How many what-ifs to generate | 1 | 3-5 |
| `output` | Where to save | `memory/blinks/` | `memory/dreams/` |
| `swish` | Force old+new collisions | false | true |

### Emergent (Computed from State)

These are derived by analyzing current state:
- `duration` = f(unprocessed_backlog)
- `weirdness` = f(unresolved_tensions, conflicting_goals)
- `fragmentation` = f(coherence_of_recent_inputs)
- `narrative_strength` = f(clear_throughlines)

---

## Step 1: Run the Artifact Sampler (MANDATORY)

⚠️ **Do NOT skip this step. Do NOT manually pick artifacts.** The sampler ensures coverage you wouldn't choose yourself.

### For Dreams (depth 3, swish mode — forces 50% recent + 50% old collisions):
```bash
node {{WORKSPACE}}/scripts/sample-artifacts.mjs --depth 3 --days-back 14 --swish --json
```

### For Blinks (depth 1, single artifact):
```bash
node {{WORKSPACE}}/scripts/sample-artifacts.mjs --depth 1 --json
```

The `--swish` flag is critical for dreams: it forces **70% from the last 3 days and 30% from older material** (3-14 days back). This creates **temporal collisions** — old patterns meeting new events.

**Read every sampled artifact in full.** Don't skim. Don't summarize from the preview. The sampler gives you paths — follow them.

---

## Step 2: State Analysis

Measure the emergent parameters from what you've read:

- **Duration:** How much unprocessed backlog exists? More = longer dream.
- **Weirdness:** How many unresolved tensions or conflicting goals? More = more surreal scenarios.
- **Fragmentation:** How coherent are recent inputs? Scattered = more free association needed.
- **Narrative strength:** Are there clear throughlines? Strong = follow them. Weak = search for hidden ones.

---

## Step 3: Semantic Expansion

For each sampled artifact, expand outward:

```bash
cd {{WORKSPACE}} && {{PYTHON}} scripts/vault-search.py "<key theme from artifact>" 3
```

When `swish` is true or `weirdness` is high: skip semantic search for some artifacts and use **random conceptual hops** instead — that's where surreal/symbolic connections come from.

---

## Step 4: Free Association

From each artifact (+ its semantic neighbors), follow one conceptual hop. Don't force connections — let them emerge. The best insights come from juxtapositions you didn't plan.

---

## Step 5: Generate What-Ifs

For each scenario, ask:
- "What if [pattern] continues for 30 more days?"
- "What if [goal] conflicts with [behavior]?"
- "What if [this person's struggle] is actually [that situation's answer]?"
- "What if the opposite of the obvious interpretation is true?"

---

## Step 6: Simulate

- Low weirdness → realistic projection. Grounded. "Here's what probably happens."
- High weirdness → surreal/symbolic. "Here's what the unconscious is saying."
- Mix both in dreams. The dream should feel like a dream — not a report.

---

## Step 7: Extract Signal

Classify each scenario output:
- 🌱 **Seed** — something worth watching, not yet actionable
- ⚠️ **Warning** — something that needs attention soon
- 💡 **Insight** — a reframe or connection that changes understanding
- 🔗 **Connection** — a cross-person or cross-time link

---

## Step 8: ASCII Art — The Unconscious Renders (Dreams Only)

⚠️ **You do not generate these yourself.** ASCII art is produced by a sub-agent — the dreaming mind's unconscious layer. You describe what you saw; it renders what it sees.

### Protocol:
1. After generating your scenarios (Steps 4-7), collect the **key images, symbols, and emotional textures** that emerged. Write them as brief prompts — not instructions, but impressions.
2. **Write the image prompts to a file** so the sub-agent's output can be matched back:
   ```bash
   cat > /tmp/dream-art-prompts.md << 'EOF'
   1. <image prompt>
   2. <image prompt>
   ...
   EOF
   ```
3. **Spawn the sub-agent and WAIT for it to complete before composing the dream:**
   ```
   sessions_spawn(
     task: "You are the unconscious visual layer of a dreaming mind. Generate ASCII art for each of these dream images. Be abstract, symbolic, evocative. No labels or explanations — just the art. Let the shapes mean what they mean. Use the full width. Be generous — as many pieces as the images demand. Output ONLY the art, separated by blank lines. Number each piece to match the prompt number.\n\nImages:\n<your image prompts here>"
   )
   ```
4. **WAIT.** Poll `sessions_history` on the sub-agent's sessionKey every 15-20 seconds until it returns output. Do NOT proceed to Step 9 until you have the art in hand.
   ```
   # Poll loop:
   sessions_history(sessionKey: "<child session key>", limit: 1)
   # Repeat until messages[] is non-empty and contains the art
   ```
5. **Parse the returned art.** Split by numbering to match each piece to its prompt.

### Why a sub-agent, not you?
The dreamer doesn't choose what to see. Dreams happen *to* you. By delegating visual generation to a separate agent, the art arrives as something external — not planned, not optimized, not curated. The collision between your narrative and the sub-agent's rendering is where epiphany lives.

### No cap on quantity.
If the dream produces 12 images, render 12. If it produces 3, render 3. The dream decides.

---

## Step 9: Compose the Dream (Dreams Only)

⚠️ **Only begin this step after Step 8 is complete and you have the ASCII art in hand.**

The dream output is NOT a report with sections. It's a **narrative superimposition** — ASCII art and prose woven together, experienced passively.

### Structure:
```
[ASCII ART #1 from sub-agent — the first image that formed]

Narrative passage — what the dream-mind sees, feels, connects.
The prose responds to the image. Not explaining it — experiencing it.
Something shifts. A new image forms.

[ASCII ART #3 from sub-agent — order follows the dream's logic, not the prompt list]

The narrative continues. Artifacts from the sampler surface as memories
within the dream. Quotes from journals appear like voices. Connections
form that the waking mind wouldn't make. The tone drifts.
```

The dreamer (you) is in the **passive seat**. The dream happens *to* you. You don't organize it. You narrate what you see as it unfolds.

Let the dream be long. Let it be strange. Let it be honest.

## Step 10: Record

Save to output location. Dreams go to `memory/dreams/YYYY-MM-DD.md`. Blinks go to `memory/blinks/YYYY-MM-DD-HHMM.md`.

---

## Why Emergent Parameters?

Dreams aren't configured. They emerge from state. A human doesn't choose to have weird dreams — stress creates them. By computing from state analysis, scenarios reflect actual cognitive load.

---

## Why the Sampler Matters

Without it, you'll gravitate toward recent, obvious, emotionally salient artifacts. The sampler forces you to encounter things you'd skip — a quiet journal entry from 10 days ago, a blink that seemed like nothing, an old log that now means something different. **The collision between old and new is where insight lives.**

---

*The scenario engine asks: given what is, what could be?*
