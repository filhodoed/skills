# filhodoed/skills

Public [Agent Skills](https://agentskills.io/specification) for Claude Code, Codex, and Gemini CLI, with a Claude Code plugin package for distribution.

## Skills

| Skill | What it does |
| --- | --- |
| [mof](skills/mof/README.md) — Map of Functions | Models a system's functions, dependencies, and blast radius so agents plan changes with full context instead of guessing — and can turn the map into a searchable technical HTML report on request. |

## Installation

Install the whole plugin (every skill in this repo):

```
/plugin marketplace add filhodoed/skills
/plugin install filhodoed-skills@filhodoed
```

The `skills/mof/` directory is the portable Agent Skills core. Codex can install it under `$CODEX_HOME/skills/mof` (or `~/.codex/skills/mof`), and Gemini CLI can link the same directory with `gemini skills link ./skills/mof`. Claude Code can use the plugin above or `.claude/skills/mof/`.

The MoF core requires no database, server, Mermaid, CDN, or network access. The optional `docs/MOF.html` report is generated from `docs/MOF.md` and is intended for human technical review.

Or try a single skill without installing it — see that skill's own README for the copy command.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

[MIT](LICENSE)
