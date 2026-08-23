# digest-refine — durable knowledge curation

Digest refine is stage 3 of the memory pipeline. It compresses an accumulated `memory/digest.md`, preserves durable knowledge and provenance, then promotes surviving items to `approved` semantic memory when the vector runtime is available.

## Pipeline

```text
memory/*.md  →  digest.md  →  digest-refine  →  memory/vectors.db
daily facts     durable view    curation          approved retrieval
```

Use it periodically, not after every session. It is valuable once the digest contains repeated decisions, resolved actions, or administrative noise.

## Complete cycle

`memory` records facts, `digest` consolidates them, and this skill curates the digest and promotes only the surviving durable items to approved semantic retrieval. Run it after `digest`, periodically rather than after every session.

## What it does

- fuses semantically repeated knowledge;
- removes actions demonstrably resolved by later digest evidence;
- cuts transient operational detail while preserving future value;
- keeps source references for retained knowledge;
- preserves stable item IDs and hashes, retrying pending hashes;
- rewrites the canonical digest only after interactive approval;
- updates an existing approved record when the same source changes, when its previous hash is available;
- retries semantic ingestion and promotion when a previous synchronization was pending.

## What it does not do

Digest refine does not create daily memory, append new digest sections, inspect daily files for correction, or audit the project's current truth. Use `memory`, `digest`, or `compass` for those responsibilities.

## Typical prompts

```text
Refine the memory digest.
```

```text
Compress the digest and remove resolved items.
```

```text
Curate the durable knowledge and update semantic memory.
```

## Safety

The canonical digest is rewritten as a whole document, so the skill asks for approval before that mutation. An explicit test copy can be refined directly. Daily memory files remain untouched.

Before semantic synchronization, ask whether the user has an environment variable for the semantic core and ask for its exact name, then read that variable at runtime. Never assume or suggest a machine-specific variable name or path. If none exists, the digest can still be refined, but the skill warns that vector synchronization is unavailable.

## Mounting the semantic core

The core is any trusted runtime directory exposed through the variable name supplied by the user, with `ingest.mjs` and `refine.mjs` implementing candidate ingestion plus approved promotion or update, and `query-semantic.mjs` serving approved retrieval. The skill uses `{memory-path}/vectors.db`, retries pending hashes, updates an existing approved record when the same source changed, and reports supersession when an approved item disappeared. This repository does not bundle, install, or hardcode a provider, model, endpoint, or filesystem path.

## Portability

The skill uses the target's documented `memory/` path and an optional configured semantic runtime. It does not depend on Claude Code commands, a workspace provider, or a personal directory layout.

## License

[MIT](../../LICENSE)
