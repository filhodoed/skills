# digest — incremental consolidation

Digest is stage 2 of the memory pipeline. It reads append-only daily memory files and appends a compact, sourced section to `memory/digest.md`.

## Pipeline

```text
memory/*.md  →  digest.md  →  digest-refine  →  memory/vectors.db
daily facts     durable view    curation          approved retrieval
```

Use `memory` first, run `digest` when new daily records exist, and run `digest-refine` periodically when repeated sections have accumulated. Digest can submit new bullets as semantic `candidate` records, but it never promotes them.

## Complete cycle

`memory` records facts, `digest` consolidates them with stable source IDs and hashes, and `digest-refine` curates the result and promotes only approved durable knowledge. Run this skill after `memory` and before `digest-refine`.

## What it does

- processes only new or updated daily memory dates;
- keeps decisions, durable state, learnings, and open actions;
- appends one section without rewriting previous digest history;
- keeps source references down to the daily file and session;
- assigns stable session, section, and item IDs plus content hashes for deduplication and retry;
- reports whether optional semantic candidate synchronization succeeded, was unavailable, or is pending.

## What it does not do

Digest does not create daily records, rewrite or compress the digest, audit project truth, or promote vector records to `approved`. Those responsibilities belong to `memory`, `digest-refine`, and `compass`, respectively.

## Typical prompts

```text
Digest the new memory for this project.
```

```text
Update the project memory digest.
```

```text
Consolidate the daily records since the last digest.
```

## Portability

The skill resolves `memory/` from the runtime target or an explicit project instruction. It does not depend on Claude Code commands, a workspace provider, or a personal directory layout. Before semantic synchronization, ask whether the user has an environment variable for the semantic core and ask for its exact name, then read that variable at runtime. Never assume or suggest a machine-specific variable name or path; if none exists, warn that candidate synchronization is unavailable and continue with the digest.

## Mounting the semantic core

The core is any trusted runtime directory exposed through the variable name supplied by the user, with the CLI contract `ingest.mjs` for `candidate` records, `refine.mjs` for promotion or update to `approved`, and `query-semantic.mjs` for approved retrieval. The target database is `{memory-path}/vectors.db`; embedding or runtime failures remain `pending` for retry. This repository does not bundle, install, or hardcode a provider, model, endpoint, or filesystem path.

## License

[MIT](../../LICENSE)
