# filhodoed/skills

[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-open%20standard-6d28d9)](https://agentskills.io/specification)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-supported-d97706)](https://code.claude.com/docs/en/slash-commands)
[![Codex](https://img.shields.io/badge/Codex-supported-111827)](https://developers.openai.com/codex/)
[![Gemini CLI](https://img.shields.io/badge/Gemini%20CLI-supported-2563eb)](https://github.com/google-gemini/gemini-cli)
[![License](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

Reusable skills for coding agents, built around clear reasoning, bounded impact analysis, and low-friction adoption in real repositories.

The first skill is the **Map of Functions (MoF)**, a living technical map that helps an agent understand what depends on a responsibility before changing logic, contracts, or behavior.

> Before changing a function, know who depends on it and what can break.

## Why this exists

Agents can find files quickly, but finding the right blast radius requires more than text search. A change can affect direct callers, shared entities, published events, workflows, shared code, cross-cutting rules, and contracts that are not visible in a simple call graph.

The MoF records those relationships in a versioned Markdown document, then gives the agent a focused Query flow before a change. The result is less guesswork, clearer review, and a technical trail that remains readable by people.

## Included skill

| Skill | Purpose |
| --- | --- |
| [mof](skills/mof/README.md) | Map responsibilities, functions, dependencies, entities, events, workflows, impact rules, and technical relationships before a change. |

The MoF has three operating modes:

- **Map** — discover and maintain `docs/MOF.md` incrementally;
- **Query** — calculate the relevant impact radius before a change;
- **Visualize** — generate an optional, printable `docs/MOF.html` technical report for human review.

The HTML report uses only HTML, CSS, and small local JavaScript. It has no database, server, Mermaid, CDN, or network requirement.

## Supported agents

The skill core follows the portable `SKILL.md` format. Installation and activation are platform-specific, but the MoF method and `docs/MOF.md` contract remain the same.

| Agent | Installation | Project instruction |
| --- | --- | --- |
| Claude Code | Plugin or `.claude/skills/mof/` | `CLAUDE.md` |
| Codex | `$CODEX_HOME/skills/mof/` or `~/.codex/skills/mof/` | `AGENTS.md` |
| Gemini CLI | `gemini skills link ./skills/mof` | Project instructions supported by Gemini CLI |

Add this line to the project's instruction file so the map is consulted consistently:

```markdown
Read `docs/MOF.md` before any change to logic, contracts, or behavior. Start at its Impact Index.
```

## Installation

### Claude Code plugin

```text
/plugin marketplace add filhodoed/skills
/plugin install filhodoed-skills@filhodoed
```

### Codex

Inside Codex, install the skill directly from this repository:

```text
$skill-installer install https://github.com/filhodoed/skills/tree/dev/skills/mof
```

Restart Codex if the skill does not appear immediately. The installer places it under `${CODEX_HOME:-$HOME/.codex}/skills/mof/`.

For a manual installation, copy or link `skills/mof/` into that same directory.

### Gemini CLI

```bash
gemini skills link ./skills/mof
```

### Single-skill copy

For a project-local installation, copy `skills/mof/` to the agent's project skill directory and keep its supporting files beside `SKILL.md`.

## Typical usage

Ask the agent to create or consult the map:

```text
Create a MoF for this project, starting with the billing domain.
```

Before a change:

```text
What is the blast radius of changing the invoice approval contract?
```

For a human-readable report:

```text
Generate the MoF technical report.
```

## Design principles

- **Knowledge before documentation** — the map exists to support reasoning, not formality.
- **One fact, one home** — `relationships[]` is the source of truth for edges; the Impact Index is a projection.
- **Uncertainty is visible** — incomplete knowledge is marked `unverified` or `unresolved`, never silently invented.
- **Bounded analysis** — Query starts from the Impact Index and expands the radius deliberately.
- **File-first and dependency-free** — Markdown, YAML, Git, and native agent capabilities are enough.
- **Human-readable by default** — the source is reviewable in pull requests and usable in restricted environments.

## Repository structure

```text
.
├── skills/
│   └── mof/
│       ├── SKILL.md
│       ├── README.md
│       ├── mof-template.md
│       ├── visualization.md
│       └── mof-shell.html
├── .claude-plugin/
├── CHANGELOG.md
└── LICENSE
```

## Status

The MoF is the initial skill in this repository. The current development line includes evidence-based freshness checks, deterministic Query evidence states, split-map ownership rules, and a dependency-free technical HTML report.

See [CHANGELOG.md](CHANGELOG.md) for the release history and [skills/mof/README.md](skills/mof/README.md) for the complete skill guide.

## License

[MIT](LICENSE)
