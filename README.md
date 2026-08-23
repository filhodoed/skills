# filhodoed/skills

[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-open%20standard-6d28d9)](https://agentskills.io/specification)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-supported-d97706)](https://code.claude.com/docs/en/slash-commands)
[![Codex](https://img.shields.io/badge/Codex-supported-111827)](https://developers.openai.com/codex/)
[![Gemini CLI](https://img.shields.io/badge/Gemini%20CLI-supported-2563eb)](https://github.com/google-gemini/gemini-cli)
[![License](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

Reusable skills for coding agents, built around clear reasoning, bounded impact analysis, and low-friction adoption in real repositories.

> Before changing a function, know who depends on it and what can break. Before trusting a document, know if it's still true.

## Why this exists

Agents can find files quickly, but two other problems keep costing real time: knowing the blast radius of a change before making it, and knowing whether the documentation guiding that change is still accurate. Each skill here targets one of those gaps with a versioned, human-readable artifact instead of guesswork.

## Included skills

| Skill | Purpose |
| --- | --- |
| [mof](skills/mof/README.md) | Map responsibilities, functions, dependencies, entities, events, workflows, impact rules, and technical relationships before a change. |
| [compass](skills/compass/README.md) | Audit a project's context documentation, agent instruction file, and README against real evidence, and fix drift with approval. |

The MoF has three operating modes:

- **Map** — discover and maintain `docs/MOF.md` incrementally;
- **Query** — calculate the relevant impact radius before a change;
- **Visualize** — generate an optional, printable `docs/MOF.html` technical report for human review.

The HTML report uses only HTML, CSS, and small local JavaScript. It has no database, server, Mermaid, CDN, or network requirement.

Compass audits a project's documentation in place: it finds the target files, gathers evidence (git log, decision records, session notes), asks before applying anything, and opens a PR instead of pushing directly to a protected branch.

## Supported agents

Every skill in this repository follows the portable `SKILL.md` format — one file, YAML frontmatter plus plain-language instructions, no agent-specific syntax. Installation and activation are platform-specific, but each skill's method and its contract (the artifact it maintains, or the flow it follows) remain the same everywhere.

| Agent | Target | Project instruction |
| --- | --- | --- |
| Claude Code | `.claude/skills/` | `CLAUDE.md` |
| Codex | `${CODEX_HOME:-$HOME/.codex}/skills/` | `AGENTS.md` |
| Gemini CLI | Agent Skills directory | Project instructions supported by Gemini CLI |

Skill descriptions help discovery, but a line in the project's own instruction file makes consultation reliable — a hint in `SKILL.md` alone is not. For `mof`:

```markdown
Read `docs/MOF.md` before any change to logic, contracts, or behavior. Start at its Impact Index.
```

`compass` has no equivalent artifact to point to — it runs on request or after a relevant chunk of work, not on every change.

## Installation

Install a skill for one or more supported agents:

```bash
npx skills add filhodoed/skills --skill mof --agent claude-code --agent codex --global
npx skills add filhodoed/skills --skill compass --agent claude-code --agent codex --global
```

Use `--agent gemini-cli` when that target is available in the installed `skills` CLI. Use `--yes` for non-interactive installation.

To test the development branch before it reaches the default branch:

```bash
npx skills add https://github.com/filhodoed/skills/tree/dev/skills/mof --skill mof --agent codex --global --yes
```

The manual fallback is to copy or link a skill's directory (`skills/mof/`, `skills/compass/`) into the target agent's skills directory. The `npx skills` installer is maintained separately from this repository and may support more agents than those listed here.

### Single-skill copy

For a project-local installation, copy the skill's directory to the agent's project skill directory and keep its supporting files beside `SKILL.md`.

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

To audit documentation against reality:

```text
Update the project context, it feels stale.
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
│   ├── mof/
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── mof-template.md
│   │   ├── visualization.md
│   │   └── mof-shell.html
│   └── compass/
│       ├── SKILL.md
│       └── README.md
├── .claude-plugin/
├── CHANGELOG.md
└── LICENSE
```

## Status

`mof` is the original skill in this repository, with evidence-based freshness checks, deterministic Query evidence states, split-map ownership rules, and a dependency-free technical HTML report. `compass` is the second, auditing a project's documentation against real evidence instead of its code's blast radius.

See [CHANGELOG.md](CHANGELOG.md) for the release history, [skills/mof/README.md](skills/mof/README.md) and [skills/compass/README.md](skills/compass/README.md) for the complete skill guides.

## License

[MIT](LICENSE)
