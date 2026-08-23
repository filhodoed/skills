---
name: compass
description: Audits a project's documentation against real evidence (git log, decision records, session notes) and fixes drift in its context documentation, agent instruction file, and README. Use when asked to update project context, when a document seems stale, or after closing a significant chunk of work. Does not generate a navigation map or scaffold project structure — those are separate concerns.
---

# Compass

Audits: is what's written still true? Compass compares a project's context documentation against real evidence — git history, decision records, session notes — and fixes drift.

An outdated document is worse than no document: it makes an agent reason about a state that no longer exists. Compass exists to close that gap, never to add ceremony.

Out of scope: navigation maps (an index of where things live), folder structure, and project scaffolding. If the project has skills for those, defer to them instead of reproducing their work here.

## When to run

- "update the project context", "this doc is stale", "the project moved on, refresh the context"; or after closing a relevant chunk of work (a release, an architecture change, a new decision record) when the docs look behind.
- An ambiguous request ("review the project", "map the project") — ask whether the user wants a documentation audit (this skill) or a navigation map, or both.

## Step 1 — Find the project and the target files

1. If the project wasn't named in the conversation, ask.
2. Ask the user which file is this project's source of truth for context — never assume a filename by convention (e.g. don't guess `docs/context.md` vs `README.md` vs `CONTRIBUTING.md`). If the project already has an agent instruction file (`CLAUDE.md`, `AGENTS.md`, or equivalent) and it points to a document, follow that pointer instead of asking again.
3. Determine whether the project has a README and an agent instruction file worth auditing alongside the context document. Close the list of targets: context document, agent instruction file (if present), README (if present).

**Delegated source of truth**: if the agent instruction file states it has stopped being the technical source of truth and points to another document instead, include that document in the target list too — in addition to, not instead of, whatever the instruction file still owns (e.g. a status line, next action). Confirm with the user if it's unclear which document owns which part of the truth.

## Step 2 — Gather signals of real evolution

- **Anchor date**: an "Updated on DATE" header at the top of the document; if absent, the date of the last commit that touched the file, or its last-modified date.
- **Git log**: `git log --since="<anchor-date>" --oneline`, plus `git tag` and `git log -1 --format=%H`.
- **Decision records**: list `docs/adr-*.md` or the project's equivalent (design docs, RFCs) if any exist.
- **Session or work notes**: any directory the project uses to log findings/decisions that never made it into the target documents.

Arrive at a short list of findings, each backed by concrete evidence — never ask "is this still right?" without a suggestion in hand.

## Step 3 — Ask before touching anything

Never apply a change directly, even when it looks obvious. Group related questions together, one per statement — each question carries the current text, the evidence, and a suggestion:

> "The document says '{current text}'. {evidence} suggests it changed to '{suggestion}'. Keep it, update to the suggestion, or write it differently?"

If there's no drift, say so explicitly — silence is not a signal that everything is fine.

## Step 4 — Apply the approved changes

**Context document and agent instruction file**: edit directly, only the approved parts — never rewrite the whole file. If these files live outside version control, apply the edit with no branch/commit ceremony.

**Stamp the anchor date, always** — even when nothing was approved for change, even if the line never existed before. Update (or create, if missing) an "Updated on YYYY-MM-DD" header (today) at the top of every audited document. Some setups use this stamp to detect whether a fresh audit is needed — without it, that detection never recognizes the audit ran, even though it did.

**README.md** (only if the project has a repo and there's an approved change) — the default branch is typically protected:

0. **Check the repo is usable before anything else.** A failing `git status`/`git branch --show-current`, or a stray `*.lock` in `.git/` (common with cloud-synced folders like iCloud/OneDrive/Dropbox): the repo is locked by something outside this skill. **Never remove the lock on your own** — there's no way to know if it's orphaned. If locked, skip to "No-git fallback" below and report the block as an environment issue.
1. On the default/protected branch? Create a new branch, kebab-case, prefixed `docs/`.
2. Apply the approved edit.
3. Commit using the project's commit convention (Conventional Commits `docs:` type if the project uses that convention).
4. Push and open a PR with a short summary of what changed and why. Never merge it yourself.
5. If opening the PR fails (missing CLI/credentials) but the local commit worked: report it and leave the branch ready, noting that push/PR needs to happen manually.

**No-git fallback** (locked repo, or any other blocker): never work around it by force. Produce the change as a ready-to-apply text diff instead.

## Step 5 — Verify before reporting (mandatory)

Re-check every edit against the answer the user actually chose in Step 3 — not the original suggestion or the general intent. It's easy to apply the option that felt most natural instead of the one chosen. Skipping this check is this skill's most likely failure mode.

## Step 6 — Report

What was confirmed with no change; what was updated, file by file; the README PR (link) or the ready diff plus the reason it's blocked; anything left without a clear answer, flagged as pending. If the project has a navigation map and the audited evolution might have made it stale, suggest running whatever skill maintains it next — don't run it yourself.

## Rules

- Never invent a fact without evidence — an ambiguous signal is a question, not an assumption.
- Never create a context document from scratch if one doesn't exist — flag it and ask whether to create one now or leave it for later.
- Never push directly to a protected branch, never remove a `.git/` lock on your own — see Step 4.
- Out of scope: navigation maps, folder structure, and creating new projects.
