---
name: digest
description: Consolidate new daily memory records into an incremental digest. Use when asked to digest, consolidate, or update project memory.
---

# Digest

Digest is stage 2 of the memory pipeline. It reads append-only daily records, keeps durable knowledge, and appends one consolidated section to `digest.md`.

## Pipeline boundary

1. `memory` writes daily factual records;
2. `digest` consolidates new records and may create semantic candidates;
3. `digest-refine` curates the digest and promotes approved knowledge to the vector database.

Digest never edits or deletes daily memory files, promotes knowledge to `approved`, or rewrites previous digest sections. If semantic ingestion is unavailable, the digest artifact remains the source of truth and the limitation must be reported.

## Resolve the target

Set `target-root` to the runtime `cwd`, unless the user supplies another project or area path. Resolve `{memory-path}` in this order:

1. an explicit path supplied by the user;
2. an exact memory path declared in `AGENTS.md` or `CLAUDE.md` at `target-root`;
3. `{target-root}/memory/`.

Read only instruction files at `target-root` and exact files they explicitly point to. Do not recursively search the workspace or infer a sibling directory. If multiple allowed sources conflict, ask which path is canonical.

Set `{digest}` to `{memory-path}/digest.md`. If `{memory-path}` does not exist or contains no `*-memory.md`, report that there is nothing to digest and do not create an empty digest.

## Completion contract

Success requires:

- `{digest}` exists with one new `## Digest YYYY-MM-DD HH:MM` section, unless there is no new source and the run only retries pending semantic hashes;
- the first-line state marker records the execution and the newest source date considered;
- daily memory files remain byte-for-byte unchanged;
- previous digest sections remain unchanged;
- every durable bullet has a stable item ID, content hash, and source reference to a daily memory file and session when available;
- semantic candidate synchronization is reported as `synced`, `unavailable`, or `pending`, never implied;
- verification passes before success is reported.

## 1. Resolve source state

Capture `TODAY=$(date +%F)` once. Daily source filenames use `YYYY-MM-DD-*-memory.md`.

The canonical state marker is:

```markdown
<!-- digest:state last-run=YYYY-MM-DDTHH:MM:SSZ processed-through=YYYY-MM-DD -->
```

For compatibility, accept an existing legacy marker beginning with `fde-digest:state`, preserve its fields, and do not rewrite the marker name during an unrelated digest run. New files use `digest:state`.

Maintain a separate mutable synchronization marker in the header metadata, immediately after the state marker for an unrefined digest and immediately after the refine marker when one exists:

```markdown
<!-- digest:sync status=synced|unavailable|pending pending=hash1,hash2 -->
```

`pending` contains content hashes whose candidate ingestion must be retried. It is metadata, not historical digest content.

- No digest: all daily files are new;
- digest with marker: process source files dated on or after `processed-through`, because the current day's file may receive later appends;
- digest without a valid marker: do not guess silently; infer from existing `## Digest` sections only when unambiguous, otherwise ask before writing.

Never treat `digest.md` as a daily source.

## 2. Select durable knowledge

Read source files in chronological order. Use every existing `memory:session` ID and `digest:item` source reference to decide whether a session is already represented; the date marker only bounds the search. This prevents duplicate work when one daily file receives many appends.

Keep:

- decisions and reasons;
- durable state changes;
- learnings and failure-avoidance rules;
- unresolved actions that remain open.

Omit command minutiae, superseded actions, transient narration, and proposals that were not applied. If a later source closes an earlier pending action, keep only the current state.

Every retained bullet must include machine-readable metadata and human-readable provenance in compact form, for example:

```markdown
<!-- digest:item id=decision-shared-adapter source=memory/2026-08-23-topic-memory.md#session-2026-08-23T14-20 hash=... sync=candidate -->
- Decision: use the shared adapter, because both runtimes consume the same contract. Source: `memory/2026-08-23-topic-memory.md#session-2026-08-23T14-20`.
```

The `hash` is the SHA-256 content hash used by the semantic runtime. Do not invent a source reference. If only the session supports a fact, use the daily file and its stable session ID.

Item IDs are stable within the digest: preserve an existing ID when its knowledge survives with updated wording, and create a new collision-free ID for new knowledge. A changed item keeps its ID and receives a new content hash.

## 3. Write the digest

For a new file:

```markdown
<!-- digest:state last-run=YYYY-MM-DDTHH:MM:SSZ processed-through=YYYY-MM-DD -->
<!-- digest:sync status=unavailable pending=hash1,hash2 -->
# Memory digest — {target name}

Daily memory is the source; this file is the compact reading layer.
```

Append exactly one section:

```markdown
<!-- digest:section id=YYYY-MM-DDTHH:MM:SSZ[-n] -->
## Digest YYYY-MM-DD HH:MM

_Sources: `memory/YYYY-MM-DD-topic-memory.md#session-ID`_

**Decisions**:
<!-- digest:item id=... source=memory/file#session-ID hash=... sync=candidate -->
- ... Source: `memory/file#session-ID`.

**State and changes**:
<!-- digest:item id=... source=memory/file#session-ID hash=... sync=candidate -->
- ... Source: `memory/file#session-ID`.

**Learnings**:
<!-- digest:item id=... source=memory/file#session-ID hash=... sync=candidate -->
- ... Source: `memory/file#session-ID`.

**Open actions**:
<!-- digest:item id=... source=memory/file#session-ID hash=... sync=candidate -->
- ... Source: `memory/file#session-ID`.

```

Keep these headings and metadata markers stable for `digest-refine`. Omit empty knowledge sections. Do not put synchronization state inside historical sections; the top-level `digest:sync` marker is the current state. If no durable knowledge exists, append one honest line stating that nothing durable was found and list the source files.

Update only the state and `digest:sync` markers, preserving any existing refine marker, and append the new section. Do not rewrite existing sections.

## 4. Optional semantic candidate sync

Before semantic synchronization, ask the user whether an environment variable for the semantic core is configured and ask for its exact name. Resolve that name as `{semantic-env-var}` and, when it is set, send each new knowledge bullet to its trusted `ingest.mjs` as `candidate`. Use `jq -n --arg` for every dynamic value; never interpolate bullet text into a JSON literal. Use `{memory-path}/vectors.db` as `dbPath`, and use a granular `sourceRef` such as `memory/file#session-ID`.

If the user has no such variable, or `{semantic-env-var}` is unset, do not guess a path or execute a local default. Complete the digest and warn that semantic synchronization was unavailable because the required environment variable is not configured. Keep locally computed hashes in `digest:sync pending=...` so a later configured run can retry them. The semantic step is best-effort. A configured runtime failure, missing Ollama, timeout, malformed response, or failed insert must never erase the digest result. Keep returned hashes in the same marker and retry them on the next run, even when no new daily source exists. Set `synced` only when every submitted bullet returned a successful result.

Candidate ingestion is not approval. `digest-refine` owns promotion to `approved`.

## 5. Verify

Before reporting success, confirm:

1. the digest exists;
2. the state marker is first and contains this run's timestamp and processed-through date;
3. the `digest:sync` marker contains the actual current status and pending hashes;
4. the number of `## Digest` sections increased by one when new source existed;
5. every new section has a stable ID and every knowledge bullet has an item ID, hash, and source provenance;
6. the new section is the final section;
7. daily memory files were not modified;
8. semantic sync state matches the actual result.

Report source count, date range, durable decisions, open actions, semantic sync state, and any limitation.

## Scope boundaries

Digest does not create daily memory, refine or compress prior digest sections, audit project truth, promote vector records, or perform Git operations. It writes only `{memory-path}/digest.md` and the optional per-item vector database through the documented semantic CLI.
