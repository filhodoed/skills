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

## Supported agents

Every skill in this repository follows the portable `SKILL.md` format — one file, YAML frontmatter plus plain-language instructions, no agent-specific syntax. Installation and activation are platform-specific, but each skill's method and its contract (the artifact it maintains, or the flow it follows) remain the same everywhere.

| Agent | Target | Project instruction |
| --- | --- | --- |
| Claude Code | `.claude/skills/` | `CLAUDE.md` |
| Codex | `${CODEX_HOME:-$HOME/.codex}/skills/` | `AGENTS.md` |
| Gemini CLI | Agent Skills directory | Project instructions supported by Gemini CLI |

## Installation

Install a skill for one or more supported agents:

```bash
npx skills add filhodoed/skills --skill mof --agent claude-code --agent codex --global
npx skills add filhodoed/skills --skill compass --agent claude-code --agent codex --global
```

Use `--agent gemini-cli` when that target is available in the installed `skills` CLI. Use `--yes` for non-interactive installation.

The manual fallback is to copy or link a skill's directory (`skills/mof/`, `skills/compass/`) into the target agent's skills directory. The `npx skills` installer is maintained separately from this repository and may support more agents than those listed here.

### Single-skill copy

For a project-local installation, copy the skill's directory to the agent's project skill directory and keep its supporting files beside `SKILL.md`.

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

See [CHANGELOG.md](CHANGELOG.md) for the release history and the [skill guides](skills/).

## License

[MIT](LICENSE)
