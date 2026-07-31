# mof — Map of Functions

Before changing a function, know exactly **who depends on it and what can break**.

The MoF is a living `docs/MOF.md` file that models a system's functions as business capabilities — their responsibilities, relationships, side effects, and impact rules — so humans and AI agents can plan changes with full context instead of guessing. Think of it as a dependency map with a blast-radius calculator built in. It is not a navigation map (e.g. a `docs/MOC.md`) — the two stay decoupled.

## How it works

The skill moves through four modes, picked automatically based on what you're asking for:

| Mode | When | What it does |
| --- | --- | --- |
| **A — Bootstrap** | Project has no MoF, or it's stale | Incremental discovery: inventory → domains → functions → relationships → impact rules, validating with you each cycle. Past ~500 lines, the map splits by domain — `docs/mof/<domain>.md` per domain, `docs/MOF.md` becomes an index. |
| **B — Impact query** | You're about to change code that touches logic, contracts, or behavior | First checks the MoF is still fresh — compares `last_updated` against the latest relevant commit; if code moved on without it, a mini Mode A cycle runs first. Then traverses the graph from the touched functions, lists the blast radius, impact rules, and required actions before proposing code. Purely cosmetic changes (typos, formatting, comments) skip straight to the edit. |
| **C — Maintenance** | A change just landed | Updates the affected functions, relationships, and impact rules, and logs a Revision History entry (with the commit) — so the map never rots. |
| **D — Visualization** | You ask to see the MoF as a diagram | Turns the same YAML into `docs/MOF.html`: a Mermaid graph grouped by domain (each domain gets its own color), function nodes colored by risk where an impact rule triggers on them, and two reference tables (Impact Rules, Functions) underneath. Click a node to jump to its table row; a fixed "↑ Diagram" button brings you back. Opens automatically in your browser when it's done. |

Every item gets a collision-safe ID: functions use `F_<DOMAIN>_<NNN>` (e.g. `F_BILLING_003`) so two sessions mapping different domains never collide; everything else uses a simple `<PREFIX>_<NNN>` — always the next free number, never reused.

## Example prompts

- "Create a MoF for this project"
- "What breaks if I change the invoice approval flow?"
- "Assess the blast radius of renaming this endpoint"
- "Update the MOF.md after this refactor"
- "Show me the MoF as a diagram"

## Try it without installing the plugin

```bash
mkdir -p .claude/skills/mof && cd .claude/skills/mof \
  && curl -fsSLO https://raw.githubusercontent.com/filhodoed/skills/main/skills/mof/SKILL.md \
  && curl -fsSLO https://raw.githubusercontent.com/filhodoed/skills/main/skills/mof/mof-template.md \
  && curl -fsSLO https://raw.githubusercontent.com/filhodoed/skills/main/skills/mof/visualization.md
```
