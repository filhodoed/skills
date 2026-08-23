# compass — documentation audit

An outdated document is worse than no document: it makes an agent reason about a state that no longer exists.

Compass is a portable Agent Skill for Claude Code, Codex, and Gemini CLI. It audits a project's context documentation — its context doc, agent instruction file, and README — against real evidence, and fixes drift with the user's approval, never silently.

It is not a navigation map or a scaffolding tool. Compass only checks whether existing prose still matches reality.

## What it checks

- Does the context document still describe the project's actual state, goal, and next action?
- Does the agent instruction file's scope section still match what the project does?
- Does the README still describe the current installation, usage, and status?

## How it works

1. **Find the target files.** Compass never assumes a filename by convention — it asks which document is the project's source of truth, unless an agent instruction file already points to one.
2. **Gather evidence.** Git log since the document's last "Updated on" date, tags, decision records (ADRs, RFCs), and any session/work notes that hold findings never promoted to the target documents.
3. **Ask before touching anything.** Each finding is presented with the current text, the evidence, and a suggestion — never applied without approval.
4. **Apply only the approved edits**, stamp the audit date, and — for a README on a protected branch — open a PR instead of pushing directly.
5. **Verify** every edit against what was actually approved, not the original suggestion.
6. **Report** what was confirmed, what changed, and what's still pending.

## Example prompts

```text
Update the project context, it feels stale.
```

```text
We just shipped the v2 release — audit the docs against what actually changed.
```

```text
Is the README still accurate?
```

## Installation

Install Compass for Claude Code and Codex with one command:

```bash
npx skills add filhodoed/skills --skill compass --agent claude-code --agent codex --global
```

Use `--agent gemini-cli` when that target is available in the installed `skills` CLI. Use `--yes` for non-interactive installation.

To install the current development branch before it reaches the default branch:

```bash
npx skills add https://github.com/filhodoed/skills/tree/dev/skills/compass --skill compass --agent codex --global --yes
```

Manual fallback: copy or link this directory to the target agent's skills directory.

## Principles

- An outdated document is worse than none.
- Never invent a fact without evidence.
- Every change is proposed, never applied silently.
- A locked or protected repository is a signal to stop, not to work around.

## Status

Compass is maintained as a portable skill that audits project documentation against real evidence and applies only approved changes. See the repository [CHANGELOG.md](../../CHANGELOG.md) for release history.

## License

[MIT](../../LICENSE)
