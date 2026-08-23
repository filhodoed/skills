---
name: compass
description: Audits project documentation against available evidence and applies only approved changes. Use when project context, agent instructions, or public documentation may be stale.
---

# Compass

Compass keeps project documentation aligned with the current state of the project.

It audits documentation against evidence, proposes findings, applies only approved changes, and records audit history.

Compass does not create navigation maps, project structures, or undocumented project rules.

## When to run

Run Compass after a release, architecture change, meaningful implementation milestone, important decision, or whenever project documentation may be stale.

## Project files

Resolve the physical project directory from the runtime `cwd`.

Inspect only these exact paths:

- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `docs/project-context.md`
- `docs/compass-audit.md`

Do not recursively scan the project or `docs/`. Do not inspect other files unless the user provides an explicit absolute path.

The files have distinct roles:

- `CLAUDE.md` and `AGENTS.md` contain agent-specific instructions and should remain concise.
- `README.md` contains public project documentation.
- `docs/project-context.md` is the canonical source of truth for current project state, goals, relevant decisions, and next actions.
- `docs/compass-audit.md` is the append-only audit history for Compass.

If no recognized file exists in the `cwd`, ask the user for the absolute path and filename of the project documentation before continuing.

If `docs/project-context.md` does not exist, report that it is missing and explain that it is intended to hold the current project context.

If `docs/compass-audit.md` does not exist, report that it is missing and explain that it is intended to hold Compass audit history and provenance.

Ask for explicit approval before creating either file.

## Source of truth

Use `CLAUDE.md`, `AGENTS.md`, and `README.md` as evidence for building or updating `docs/project-context.md`.

Separate agent instructions, public documentation, current project context, and audit history.

If multiple allowed files contain conflicting general project context, present the conflict and ask which information should be trusted before proposing the context.

Once `docs/project-context.md` exists, write general project context only there. Do not duplicate current state, goals, or next actions in `CLAUDE.md`, `AGENTS.md`, or `README.md`.

Role-specific approved changes may still be made to those files:

- agent instructions in `CLAUDE.md` or `AGENTS.md`;
- public installation, usage, and status in `README.md`.

Never place Compass audit metadata in those files.

## Evidence

Collect evidence only from the allowed project files, Git state and history, local Git tags, and explicit evidence supplied by the user.

Inspect the working tree before Git history. Uncommitted changes are evidence and must not be ignored.

Never overwrite pre-existing user changes. If an approved edit overlaps a pre-existing change in the same section, stop and ask the user how to proceed. Apply approved edits only when they are disjoint from pre-existing changes. Do not copy secrets, credentials, personal data, private session content, or unrelated local paths into project documentation or the audit log.

## Audit process

### 1. Identify targets

1. Resolve `cwd`.
2. Inspect the five exact allowed paths.
3. Identify whether `docs/project-context.md` and `docs/compass-audit.md` exist.
4. Determine which files contain relevant evidence.
5. Confirm the target files and their roles before continuing.

If the project context cannot be identified, stop and ask for an absolute path.

If several files contain conflicting general context, do not choose one automatically.

### 2. Determine Git availability

Classify the project as one of:

- `git_available`: Git is installed and the project has a usable repository;
- `not_a_repository`: the project has no Git repository;
- `git_blocked`: Git exists but status, history, or repository access failed.

Only `not_a_repository` uses the no-Git workflow. A lock, permission error, malformed repository, or unexpected Git failure is a blocker and must be reported.

### 3. Gather evidence

For a Git project, inspect the current branch, working-tree state, staged and unstaged changes, relevant commits, local tags, and current file contents.

For a project without Git, inspect current file contents, filesystem timestamps as weak contextual signals, and explicit evidence supplied by the user. Filesystem timestamps are never proof of project evolution.

### 4. Produce findings

Identify only findings supported by evidence. Each finding must include:

- `finding_id`;
- file;
- current text or state;
- evidence;
- proposed change;
- reason;
- confidence, when uncertainty exists.

If no drift is found, report that explicitly.

### 5. Ask for approval

Do not edit files before approval. Present each finding with one of these decisions:

- `approve`;
- `reject`;
- `rewrite`;
- `pending`.

Approval of documentation changes does not automatically authorize commit, push, or pull request operations.

### 6. Apply approved changes

Update only approved sections. Never rewrite an entire file.

`docs/project-context.md` is a mutable current-state document. Update its current sections in place, such as `Status`, `Objective`, `Current decisions`, `Next action`, and `Open questions`. Do not append a new copy of current status or next action.

`docs/compass-audit.md` is append-only. Add one audit entry for each completed audit, including audits with `result: no_drift`. Do not update `docs/project-context.md` when no change was approved.

### 7. Record audit metadata

Each audit entry must include:

- `audit_id`;
- `session_id`;
- `audited_at`;
- `timezone`;
- `canonical_context`;
- `audited_files`;
- `evidence_commits`;
- `before_commit`;
- `change_commit`;
- `merge_commit`;
- `before_sha256`;
- `after_sha256`;
- `changed_sections`;
- `decision_ids`;
- `result`;
- `rollback_reference`.

Use UTC exclusively for every audit:

```text
2026-08-22T15:04:05Z
```

If the runtime does not provide a session ID, record `session_id: unavailable`. Never invent a session ID.

When a field is unavailable, record `unavailable`. When a field does not apply to a no-drift audit, record `not_applicable`.

Do not write absolute local machine paths into a repository audit log. Use repository-relative paths whenever possible.

Use stable identifiers such as `AUD-2026-0001` and `DEC-2026-0001`.

Each decision must preserve a concise summary without copying document content:

```markdown
### Decision DEC-2026-0001

- Finding: documented next action was outdated
- Changed file: `docs/project-context.md`
- Changed sections: `Next action`
- Reason: evidence from commit `abc1234`
- Approved in session: `session-abc123`
- Rollback reference: `def5678`
```

The audit log records metadata, file paths, decisions, and references. It does not store the full content or diff of the audited files.

### 8. Git workflow

For tracked files:

1. Check repository status and lock state.
2. Preserve existing user changes.
3. Follow the repository's branch and review policy.
4. Apply only approved edits to target documents.
5. Record the commit and target-file hashes before the change.
6. If Git operations are not authorized, stop and report the working-tree changes.
7. Commit the approved document changes as the change commit.
8. Record the change commit and resulting target-file hashes in the audit entry.
9. Append the audit entry in a follow-up commit.

The change commit and audit-log commit are separate because the audit entry cannot know its own commit hash before the commit exists. Record the change commit in the audit entry; locate the audit-log commit with Git history. Record `merge_commit` only when a merge commit is known.

After applying approved document changes, stop before commit, push, or pull request operations unless the user has authorized the Git operation.

Never push directly to a protected branch.

If Git, credentials, or the remote repository block the workflow, report the blocker and provide a ready-to-apply diff.

### 9. No-Git workflow

For `not_a_repository`:

- continue the audit using the allowed files and explicit user evidence;
- set `before_commit`, `change_commit`, and `merge_commit` to `unavailable`;
- set `evidence_commits` to `unavailable`;
- calculate `before_sha256` and `after_sha256` for every edited file;
- use filesystem timestamps only as weak signals;
- report limited evidence confidence and rollback guarantees.

If `docs/compass-audit.md` does not exist, explain its purpose and ask for approval before creating it. Create it before recording the first audit entry. If the user does not approve its creation, do not edit the context file. Produce the approved diff instead.

For a `no_drift` audit, set `changed_sections` and file hashes to `not_applicable` when no file changed.

Without Git, the audit log does not contain enough information to restore previous content. Rollback is `unavailable` unless an external backup exists.

### 10. Verify

Before reporting completion:

- verify every edit against the approved decision;
- confirm no unapproved file changed;
- confirm the current context contains only current values;
- confirm the audit entry is append-only;
- confirm session ID and timestamp metadata;
- confirm rollback references, or confirm `rollback: unavailable` for no-Git projects;
- confirm Git status or no-Git status;
- confirm commit or pull request status when applicable.

### 11. Report

Report files inspected, files confirmed without change, Git availability, findings by decision, files updated, audit ID, session ID, evidence commits or no-Git limitation, before and after commits or hashes, rollback reference, commit or pull request, and remaining blockers.

Compass must never invent facts, silently choose between conflicting sources, create a context file without approval, or apply changes that were not approved.

## Out of scope

Compass does not create navigation maps, generate project structures, inspect arbitrary files, read private session or memory directories by convention, invent business or technical rules, rewrite complete documentation files, or bypass Git protection and repository locks.
