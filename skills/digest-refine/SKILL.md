---
name: digest-refine
description: Curate and compress an existing memory digest, then promote surviving durable knowledge to the vector database when available.
---

# Digest refine

Digest refine is stage 3 of the memory pipeline. It turns an accumulated digest into a shorter durable knowledge layer and promotes only the surviving items to semantic retrieval.

## Pipeline boundary

`memory` is the immutable daily source, `digest` is the append-only consolidation layer, and `digest-refine` is the only stage allowed to rewrite the canonical digest and promote knowledge to `approved`.

This skill never edits daily memory files, invents project truth, or treats a vector result as authoritative without its source reference.

## Resolve the target

Set `target-root` to the runtime `cwd`, unless the user supplies another project or area path. Resolve `{memory-path}` in this order:

1. an explicit path supplied by the user;
2. an exact memory path declared in `AGENTS.md` or `CLAUDE.md` at `target-root`;
3. `{target-root}/memory/`.

Read only instruction files at `target-root` and exact files they explicitly point to. Do not recursively search the workspace or infer a sibling directory. Set `{digest}` to `{memory-path}/digest.md` unless the user supplies an explicit copy for testing.

## Completion contract

For an interactive canonical digest, ask for approval immediately before the full rewrite. Success requires:

- the first-line digest state marker is preserved byte-for-byte;
- the second-line refine marker records the digest state it refined;
- the mutable `digest:sync` marker contains only current pending hashes and status;
- every durable decision, learning, and still-open action survives, either unchanged or merged without loss;
- duplicate knowledge is fused, resolved pending actions are removed, and transient noise is cut;
- source references survive every retained item;
- no unnecessary sensitive personal data remains;
- semantic promotion is reported as `synced`, `unavailable`, or `pending`;
- verification passes before success is reported.

If the digest has no valid state marker, is a daily memory file, or contains only one young section, report the condition and stop unless the user explicitly asks to proceed.

## 1. Read and gate

Read the entire `{digest}`. Confirm its first line begins with either `digest:state` or the legacy `fde-digest:state`. Confirm the file contains `## Digest` sections.

The canonical refine marker is:

```markdown
<!-- digest-refine:state last-run=YYYY-MM-DDTHH:MM:SSZ refined-through=YYYY-MM-DD -->
```

Accept a legacy `fde-digest-refine:state` marker. If its `refined-through` equals the digest marker's `processed-through` and `digest:sync` has no pending hashes, there is no new digest state to refine; report that and stop unless explicitly overridden. If pending hashes exist, enter sync-retry mode: do not rewrite knowledge, retry those hashes, update only `digest:sync`, and report the result.

Capture the original word count and a checksum before rewriting. For the canonical digest, ask for approval now because the operation discards historical section boundaries. An explicit test copy may be rewritten without that question.

## 2. Map durable knowledge

Map each bullet across all digest sections by semantic meaning, not exact wording. Preserve the fullest current version and merge incremental details from older versions.

Retain:

- current decisions and reasons;
- durable state and architecture changes;
- learnings that prevent repeated failure;
- open actions that remain unresolved.

Remove only when supported by the digest itself:

- duplicate or superseded wording;
- pending actions later shown as completed;
- transient sequencing and tool trivia with no future value;
- unnecessary personal names or sensitive details.

If two decisions conflict and the digest does not establish which is current, preserve both with an explicit conflict note and report it. Do not resolve the conflict by guessing or consulting external project state; that is an audit task.

Preserve each retained item's stable `digest:item` ID, source reference, and content hash. Use `memory/file#session-ID` or `digest#section-ID`, never a renderer-generated Markdown anchor. For legacy items without metadata, assign a `legacy-<ordinal>` ID and report reduced reconciliation confidence.

## 3. Rewrite with state

The final order is:

1. original digest state marker, unchanged;
2. updated refine marker;
3. mutable `digest:sync` marker;
4. title and short provenance line;
5. one consolidated occurrence of each stable subsection;
6. retained item IDs, source references, hashes, and current semantic sync state.

Use these stable subsections:

```markdown
<!-- digest:state last-run=... processed-through=... -->
<!-- digest-refine:state last-run=... refined-through=... -->
<!-- digest:sync status=unavailable pending=none -->
# Memory digest — {target name}

_Refined from the digest sections through YYYY-MM-DD._

**Decisions**:
<!-- digest:item id=... source=digest#section-ID hash=... sync=approved -->
- ... Source: `digest#section-ID`.

**State and changes**:
<!-- digest:item id=... source=digest#section-ID hash=... sync=approved -->
- ... Source: `digest#section-ID`.

**Learnings**:
<!-- digest:item id=... source=digest#section-ID hash=... sync=approved -->
- ... Source: `digest#section-ID`.

**Open actions**:
<!-- digest:item id=... source=digest#section-ID hash=... sync=approved -->
- ... Source: `digest#section-ID`.

```

Keep the first-line marker exactly as received, including legacy marker names. Update `processed-through` nowhere. Set `refined-through` to the exact date read from the digest marker.

## 4. Promote approved knowledge

Before semantic synchronization, ask the user whether an environment variable for the semantic core is configured and ask for its exact name. Resolve that name as `{semantic-env-var}` and, when it is set, use its trusted `ingest.mjs` and `refine.mjs`. If the user has no such variable, or `{semantic-env-var}` is unset, do not guess a path; rewrite the digest, mark synchronization `unavailable`, and warn the user that the required environment variable is not configured.

For each surviving item, compare its stable `digest:item` ID and source reference with the previous digest before rewriting. If an existing approved record has the same item/source but a changed content hash, call `refine.mjs` with `type: "update"`, the old hash, and the new content. Use `ingest.mjs` plus `promote` only for new items or items whose prior approved hash is unavailable. Use `{memory-path}/vectors.db`, granular source references, and `jq -n --arg` for dynamic JSON values. Never promote directly without first ingesting, and never mark a failed operation as approved.

Suggested confidence:

- `0.9` for knowledge fused from multiple digest sections;
- `0.8` for a durable item surviving without a merge;
- `0.6` for an unresolved action that is useful current state, not settled fact.

The operation is idempotent by `content_hash`. Reprocess every hash in the previous `digest:sync pending=...` marker before new items. Keep failed hashes in the new marker and retry them on the next run. This makes a temporary Ollama or runtime failure recoverable without rewriting the digest again.

If an approved item's content hash no longer appears among the surviving items — merged into another bullet, resolved, or dropped as duplicate/superseded — call `refine.mjs` with `type: "supersede"` (old hash) followed by `type: "purge"` (same hash) in the same call, so the obsolete approved record is retired and removed in one auditable step. Never call `purge` alone on an approved hash; `supersede` must run first in the same batch.

If no semantic runtime is configured, mark `unavailable`. If a configured runtime fails, mark `pending` and report the failure while preserving the rewritten digest.

## 5. Verify and report

Confirm:

1. the first-line digest marker is byte-for-byte unchanged;
2. the second-line refine marker exists and matches `processed-through`;
3. the `digest:sync` marker contains actual status and pending hashes;
4. the refined digest contains no duplicate stable subsection;
5. every retained bullet has an item ID, source, and hash;
6. no daily memory file changed;
7. semantic sync state matches actual ingest, update, and promotion results;
8. word count and checksum after rewrite are available for the report.

Report the target, words before and after, merged items, resolved actions, conflicts, semantic sync state, and remaining limitations.

## Scope boundaries

Digest refine does not create daily memory, append new digest sections, audit the project against external truth, or write outside the selected digest and optional per-item vector database.
