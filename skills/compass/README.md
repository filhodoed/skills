# compass — documentation audit

An outdated document is worse than no document: it makes an agent reason about a state that no longer exists.

Compass is a portable Agent Skill for Claude Code, Codex, and Gemini CLI. It audits project documentation against available evidence, applies only approved changes, and records audit history.

It is not a navigation map or a scaffolding tool. Compass does not create documentation files without the user's approval.

## What it checks

- Does the context document still describe the project's actual state, goal, and next action?
- Does the agent instruction file's scope section still match what the project does?
- Does the README still describe the current installation, usage, and status?

## How it works

1. **Find the target files.** Compass inspects `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/project-context.md`, and `docs/compass-audit.md` in the project `cwd`.
2. **Gather evidence.** Compass compares those files with Git state and history, local tags, and explicit evidence supplied by the user.
3. **Ask before touching anything.** Each finding is presented with the current text, the evidence, and a suggestion — never applied without approval.
4. **Apply only the approved edits**, update the mutable project context, append the audit record, and follow the repository's Git policy.
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

## Daily use

Compass is designed to run at meaningful project checkpoints, such as after a release, architecture change, implementation milestone, or important decision.

In environments with an end-of-session hook, users can define the keywords or phrases that signal the end of a work session. When one of those triggers is detected, the hook can start Compass and run the following workflow:

1. Compass identifies the allowed project files and their roles.
2. Compass compares those files with Git state and history, local tags, and explicit evidence supplied by the user.
3. Compass presents its findings and proposed changes for approval, applies only the approved edits, verifies the result, and reports what was updated or remains pending.

This creates a practical cycle: work during the session, signal its conclusion, review the project's documentation against what actually changed, and leave the project ready for the next session.

Other workflows are possible. Compass can also be run directly whenever documentation may have become stale:

```text
Is the project documentation still accurate?
```

```text
Audit the project documentation against the work completed in this session.
```

The end-of-session hook is an optional environment integration. It is not required to install or use the portable Compass skill manually.

If `docs/project-context.md` or `docs/compass-audit.md` is missing, Compass explains the purpose of the file and asks for approval before creating it.

## Installation

Install Compass for Claude Code and Codex with one command:

```bash
npx skills add filhodoed/skills --skill compass --agent claude-code --agent codex --global
```

Use `--agent gemini-cli` when that target is available in the installed `skills` CLI. Use `--yes` for non-interactive installation.

Manual fallback: copy or link this directory to the target agent's skills directory.

## Principles

- An outdated document is worse than none.
- Never invent a fact without evidence.
- Every change is proposed, never applied silently.
- A locked or protected repository is a signal to stop, not to work around.
- Audit history records metadata and file paths, not full document contents.

## Status

Compass is maintained as a portable skill that audits project documentation against real evidence and applies only approved changes. See the repository [CHANGELOG.md](../../CHANGELOG.md) for release history.

## License

[MIT](../../LICENSE)
