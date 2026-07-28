# filhodoed/skills

Public [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) for Claude Code, installable as a plugin.

## Skills

### mof — Map of Functions

Before changing a function, know exactly **who depends on it and what can break**.

The MoF is a living `docs/MOF.md` file that models a system's functions as business capabilities — their responsibilities, relationships, side effects, and impact rules — so humans and AI agents can plan changes with full context instead of guessing. Think of it as a dependency map with a blast-radius calculator built in.

The skill operates in three modes:

| Mode              | When                                        | What it does                                                                       |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| **A — Bootstrap** | Project has no MoF (or it's stale)          | Incremental discovery: inventory → domains → functions → relationships → impact rules, validating with you each cycle |
| **B — Impact query** | You're about to change code              | Traverses the graph from the touched functions, lists the blast radius, impact rules, and required actions before proposing code |
| **C — Maintenance** | A change just landed                      | Updates the affected functions, relationships, and impact rules so the map never rots |

Example prompts that trigger it:

- "Create a MoF for this project"
- "What breaks if I change the invoice approval flow?"
- "Assess the blast radius of renaming this endpoint"
- "Update the MOF.md after this refactor"

## Installation

```
/plugin marketplace add filhodoed/skills
/plugin install filhodoed-skills@filhodoed
```

Or try a skill in any project without installing, by copying it into the project:

```bash
mkdir -p .claude/skills/mof && curl -fsSL https://raw.githubusercontent.com/filhodoed/skills/main/skills/mof/SKILL.md -o .claude/skills/mof/SKILL.md
```

## License

[MIT](LICENSE)
