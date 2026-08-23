# memory — daily session record

Memory records factual project-session outcomes in one append-only daily file, the first stage of a pipeline that later consolidates and curates durable knowledge.

## What it does

- creates one `YYYY-MM-DD-<slug>-memory.md` file for the day, or appends to the existing file;
- separates completed work, decisions, and open actions, while keeping unapplied discussion out;
- gives every session a stable ID for digest provenance and semantic retry;
- includes relevant commits made that day when a Git repository is available;
- verifies the file, entry count, daily uniqueness, and append-only behavior;
- writes only to the target's documented or explicitly supplied memory directory.

## Staged pipeline

1. `memory` records daily facts, decisions, evidence, and open actions;
2. `digest` consolidates daily records into a compact digest;
3. `digest-refine` curates the digest and promotes approved knowledge to the vector database.

Memory does not perform the later stages, and it does not write to the digest or vector database.

## Complete cycle and semantic core

The complete cycle is `memory` → `digest` → `digest-refine`: daily facts become a sourced digest, then durable knowledge is curated and promoted to approved semantic retrieval. `memory` only records the first stage, so run `digest` after new daily records and `digest-refine` periodically after consolidation has accumulated.

The semantic core is optional to this stage and is mounted by the downstream skills through a user-configured environment variable. The user must provide the variable name; the public skills do not assume a name, provider, model, endpoint, or filesystem path.

## What it does not do

Memory does not generate a digest, update project documentation, or perform Git operations. A digest is a separate workflow that consumes daily memory files.

## Typical prompts

```text
Save the memory for this session.
```

```text
Record what we decided and leave the next action for the next session.
```

```text
Consolidate today's work into the project's daily memory.
```

## Portability

The skill uses the runtime context and the target project's documented paths. It does not depend on Claude Code commands, a specific workspace provider, a personal PARA layout, or a model-specific tool.

## Status

Memory is a portable daily-session record skill for Claude Code, Codex, and Gemini CLI.

## License

[MIT](../../LICENSE)
