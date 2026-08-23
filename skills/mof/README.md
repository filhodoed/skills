# mof — Map of Functions

Before changing a function, know exactly **who depends on it and what can break**.

The MoF is a portable Agent Skill for Claude Code, Codex, and Gemini CLI. It creates a living `docs/MOF.md` that maps responsibilities, functions, dependencies, impact paths, and technical relationships, so agents can plan changes with evidence instead of guessing.

It is not a navigation map such as `docs/MOC.md`. The MoF describes technical blast radius; navigation documentation remains separate.

## What it answers

The MoF helps answer questions such as:

- What depends on this responsibility?
- Which callers, entity readers, event consumers, or workflows can break?
- Which contracts and tests should be reviewed before the change?
- Is the map fresh, stale, or not verifiable?
- Which relationships cross domain boundaries?

## Operating modes

| Mode | Use when | Result |
| --- | --- | --- |
| **Map** | There is no MoF, the map is stale, or a change landed | Incrementally discovers domains, responsibilities, functions, relationships, entities, events, impact rules, and cross-cutting rules. |
| **Query** | A change touches logic, contracts, or behavior | Reads `mof_meta` and `impact_index` first, verifies freshness, calculates the impact radius, and reports evidence paths before details. |
| **Visualize** | A professional needs a quick human-readable report | Generates `docs/MOF.html`, a dependency-free technical report with domain-aware relationship tables, local search, and print styles. |

Cosmetic changes such as formatting, comments, or documentation typos can skip Query.

## Query behavior

Query is the reasoning layer of the skill. It does not stop at direct callers. Starting from the change's seed, it checks:

```text
metadata and Impact Index
→ freshness evidence
→ downstream calls
→ shared entities
→ published and consumed events
→ shared-code exposure and SRP
→ affected workflows
→ impact rules
→ cross-cutting rules
→ details inside the computed radius
```

The result must state the responsibilities involved, blast radius, traversal depth, paths reached through state or events, workflows, impact rules, cross-cutting rules, intended actions, and evidence status.

Freshness uses both commit and timestamp evidence:

```text
fresh       relevant code is covered by the recorded map commit and timestamp
stale       relevant code changed after the recorded map evidence
unverified  the path, commit, timestamp, or relationship cannot be proved
unresolved  a referenced item is missing from the map and must not be silently dropped
```

## MoF document

The source of truth is `docs/MOF.md`, structured as Markdown with YAML blocks:

- `mof_meta` — identity, version, update timestamp, commit, and domains;
- `impact_index` — compact traversal projection;
- `responsibilities` — atomic reasons to change;
- `functions` — code artifacts grouping responsibilities and exposing SRP status;
- `entities` and `events` — state paths invisible to a direct call graph;
- `workflows` — end-to-end sequences;
- `relationships` — the single source of truth for edges;
- `impact_rules` and `cross_cutting` — required review actions and shared constraints;
- `open_questions` and revision history — visible uncertainty and traceability.

When the map is split, `docs/MOF.md` owns the complete Impact Index, metadata, cross-domain relationships, global rules, open questions, and revision history. `docs/mof/<domain>.md` owns local domain content. A Responsibility has exactly one home.

## Example prompts

```text
Create a MoF for this project, starting with the billing domain.
```

```text
What is the blast radius of changing the invoice approval contract?
```

```text
Generate the MoF technical report.
```

## Installation

Install the MoF for Claude Code and Codex with one command:

```bash
npx skills add filhodoed/skills --skill mof --agent claude-code --agent codex --global
```

Use `--agent gemini-cli` when that target is available in the installed `skills` CLI. Use `--yes` for non-interactive installation.

To install the current development branch before it reaches the default branch:

```bash
npx skills add https://github.com/filhodoed/skills/tree/dev/skills/mof --skill mof --agent codex --global --yes
```

Manual fallback: copy or link this directory to the target agent's skills directory. The `npx skills` installer can support additional agents beyond the three documented here.

## Reliable activation

Skill descriptions help discovery, but project instructions make consultation consistent. Add this line to the instruction file used by the agent:

```markdown
Read `docs/MOF.md` before any change to logic, contracts, or behavior. Start at its Impact Index.
```

Use `CLAUDE.md` for Claude Code, `AGENTS.md` for Codex, and the project instruction mechanism supported by Gemini CLI.

## Technical report

`docs/MOF.html` is an optional projection for human technical review, not part of the agent's Query flow. It contains:

- metadata and summary counts;
- domains, functions, responsibilities, and SRP status;
- technical relationships with source domain, destination domain, relation, coupling, channel, criticality, and details;
- impact rules and open questions;
- local relationship search, responsive viewport layouts, abbreviation legend, and print-friendly CSS.

The report uses only HTML, CSS, and small local JavaScript. It does not require a database, server, Mermaid, CDN, or network access. `docs/MOF.md` remains the only source of truth.

Validate the report shell and its filter regressions with:

```bash
node skills/mof/test-mof-shell.mjs
```

## Principles

- Knowledge before documentation.
- One fact, one home.
- Uncertainty is visible.
- Query is bounded and evidence-based.
- Markdown/YAML and Git are enough.
- Human review remains part of the process.

## License

[MIT](../../LICENSE)
