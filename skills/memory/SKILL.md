---
name: memory
description: Record factual project-session outcomes in one append-only daily memory file. Use for explicit save-memory requests or session closeout.
---

# Memory

Memory is stage 1 of a staged knowledge pipeline. It preserves session facts so later stages can consolidate and curate them without treating conversation context as permanent memory.

## Pipeline boundary

The stages have separate ownership:

1. **Memory** writes daily `YYYY-MM-DD-<slug>-memory.md` records;
2. **Digest** reads daily records and appends a consolidated `digest.md` section;
3. **Digest refinement** curates the digest, separates durable knowledge from noise, and promotes approved knowledge to the vector database.

Memory never writes `digest.md`, performs embedding or vector ingestion, promotes knowledge, or edits previous daily records. A downstream stage may consume this file; it must not be asked to repair missing facts that were omitted here.

## Resolve the target

Set `target-root` to the runtime `cwd`, unless the user supplies another project or area path. Identify the target from the request and current context. If more than one target is plausible, ask before writing.

Resolve `{memory-path}` in this order:

1. an explicit path supplied by the user;
2. an exact memory path declared in `AGENTS.md` or `CLAUDE.md` at `target-root`;
3. `{target-root}/memory/`.

Read only the instruction files at `target-root` and an exact file they explicitly point to. Do not recursively search the workspace, infer a cloud provider, or select a sibling directory by convention. If the allowed sources conflict, stop and ask which path is canonical.

When the target is software, resolve `{git-path}` from an explicit user path or an exact instruction at `target-root`. If none exists, treat Git evidence as unavailable. If `{memory-path}` does not exist, create it and report that the minimum structure was created.

## Completion contract

Success requires all of these conditions:

- exactly one `YYYY-MM-DD-<slug>-memory.md` exists in `{memory-path}` for `TODAY`;
- that file was created or received exactly one new session section;
- previous entries remain in their original order and bytes;
- every recorded item is a session fact, a decision supported by the session, or an explicitly open action;
- every `Done`, `Decisions`, and `Open` bullet has `Evidence: ...`, using a file, test, command result, commit, or `Evidence: session`;
- every session has a stable `memory:session` ID for downstream provenance;
- secrets and sensitive personal data were excluded;
- verification passed before reporting success.

Daily files are append-only historical records. This skill never rewrites, reorders, renames, or deletes an earlier entry.

## 1. Collect and classify facts

Read the conversation and classify material before writing:

- **Done**: work, tests, findings, resolutions, and decisions actually completed, with evidence;
- **Decisions**: choices made, with reason and evidence or constraint;
- **Open**: unresolved item, blocker, and next physical action, with evidence or `Evidence: session`;
- **Discussed**: proposals not applied, which stay out of the record unless a rejected alternative explains a recorded decision.

Never turn a proposal, intention, or assistant plan into a completed fact. Prefer one concise fact with its evidence over a narrative of attempts.

If `{git-path}` is available, capture the local date once and collect today's commits with a read-only command:

```bash
TODAY=$(date +%F)
git -C "{git-path}" log --since="$TODAY 00:00" --pretty=format:'%h %ad %s' --date=format:'%H:%M'
```

For a repository dedicated to the target, include the commits from that date. For a monorepo, include only commits demonstrably in the target scope or explicitly discussed; if scope cannot be established, omit the commit list and report the limitation. Never invent Git evidence.

## 2. Resolve today's file

Use the captured `TODAY` value and inspect only `{memory-path}` for `TODAY-*-memory.md`.

- **No file**: choose a 2–5 word kebab-case slug from the first session topic, then create the file;
- **One file**: append to it and preserve its original slug;
- **More than one file**: stop before writing and ask which file is canonical. Never merge, rename, or choose by age.

Do not create a second daily file. Do not run two memory writes concurrently for the same target; this skill does not provide a cross-runtime writer lock.

## 3. Write the record

Use these stable markers and headings so `digest` can consume records across languages. Keep markers and headings unchanged; write the prose in the target project's established language.

For a new file:

```markdown
# Memory — {target name} — YYYY-MM-DD

<!-- memory:session id=YYYY-MM-DDTHH:MM:SSZ[-n] -->
## Session HH:MM — {short topic}

**Context**: Why the work happened.

**Done**:
- Factual result. Evidence: `path`, test, command result, commit, or `session`.

**Decisions**:
- Decision. Reason. Evidence: `path`, test, command result, commit, constraint, or `session`.

**Commits today**:
- `hash` HH:MM message.

**Open / next action**:
- Unresolved item, blocker, and next physical action. Evidence: `path`, test, command result, commit, or `session`.
```

For an existing file, append only one new `memory:session` marker and one `## Session HH:MM — ...` section. Capture the timestamp once in UTC using the Compass convention, `YYYY-MM-DDTHH:MM:SSZ`, and derive the ID from it; if that ID already exists, add the next numeric suffix. Never reuse an existing ID. Omit empty sections, including `Commits today` when no relevant commit exists. Do not add a `Discussed` section. Keep facts compact enough for the digest stage to distinguish durable decisions, state changes, learnings, and open actions.

Before writing, scan the proposed content for secrets and sensitive personal data. Do not copy, echo, or paraphrase credentials, tokens, private keys, passwords, health data, financial data, or identity data. Replace a necessary reference with a generic label such as `[redacted credential]`. Prefer repository-relative paths and omit unrelated machine paths.

## 4. Verify

Before appending, capture a checksum of the existing daily file with a checksum utility available in the runtime. After writing, verify:

1. the target file exists;
2. its new `memory:session` ID and `## Session` heading appear exactly once;
3. the session-heading count increased by one when appending;
4. exactly one file for `TODAY` exists in `{memory-path}`;
5. the old file checksum and byte prefix are unchanged when appending;
6. only the intended file in `{memory-path}` was intentionally modified.

For a new file, verify the required title and new session heading. If any check fails, do not report success. Explain the failure and leave the target in the safest recoverable state.

Report the file path, creation or append result, recorded next action, and any Git, concurrency, or verification limitation.

## Scope boundaries

Memory writes only the target daily file inside `{memory-path}`. It does not update a digest, project context, agent instructions, navigation map, changelog, vector database, or Git history, and it does not commit, push, pull, checkout, or stash.
