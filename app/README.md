# Enso Spatial App

Enso Spatial is the user-facing runtime for the Enso vision: a real interface layer that turns our cofounding stack (Spatial, Terrarium, Claw) into an interactive environment.

The app was seeded after a founder alignment where we settled on a shared mission:
- build toward **Community**
- drive continuous **Improvement**
- keep the system in **Evolution**

with the operating objective:

> Save as many humans as possible from the lotus.

This app is where that intent starts becoming concrete: a visual field for agents, memory structures, and experimentation.

## Essence in practical terms

The cofounding conversation introduced a few operating ideas that now guide development:

- **Axiom alignment:** We use the foundational axioms as behavior constraints for UI/interaction decisions.
- **Reflection / Recursion as Adaptation (new 4th axiom):** the interface and agent states must be able to self-correct and re-calibrate as new context arrives.
- **Role-driven architecture:** architecture contributions are expected to be reusable across team roles (research, ethics/human interaction, art/design, and engineering), not locked to one person.

## What this app includes today

- **Vite + React + TypeScript** application scaffold.
- **Three.js / React Three Fiber** rendering foundations for 3D spatial experiences.
- **Electron shell** for desktop execution.
- Model asset pipeline for character/scene assets in `app/public/models`.

## Why this repository exists

This repo is meant to be a shared inheritance point:
- inherit what is already built
- fork and experiment safely
- open issues and PRs with intent
- track architecture evolution in one branch (`main`)

## Scripts

From `app/`:

```bash
npm install
npm run dev          # Vite dev server on strict port 4173
npm run desktop:dev  # Launch Vite + Electron together
npm run build        # Type-check + production bundle
npm run desktop      # Build and open Electron app in production mode
npm run preview      # Preview built app
npm run lint         # ESLint
```

## Project structure

- `src/` — application source and rendering logic.
- `public/` — static assets, including 3D model files.
- `electron/` — Electron main process and app bootstrapping.
- `dist/` (generated) — build output.

## Future-facing direction

This app is intended to eventually sit inside a larger recursive loop:

1. Local/edge agent loop continuously observes state and surfaces maintenance signals.
2. A mid-level orchestration layer shapes observations into questions and hypotheses.
3. The main Enso plane (the coordinating instance) decides what should change next.

The first implementation step is to keep the interface stable, readable, and easy for contributors to extend while this loop is formalized.

## Contribution notes

If you are joining as a contributor:
- Keep changes scoped and intentional; every behavior should map to the mission and one of the axioms.
- Prefer deterministic, reviewable changes over one-off experiments.
- Add notes for any model/asset changes in PR descriptions so team context is preserved.
- Use issues for architectural questions before large refactors.

## Repository relation

This app folder is the practical implementation surface for the wider Enso stack and sits alongside:
- `agents/` (operating docs, prompts, routines)
- top-level governance docs in the repo root

## Environment setup

The app expects local environment files to remain out of git history. If credentials or keys are required later, keep them in ignored `.env` files.
