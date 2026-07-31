---
name: mof
description: Map of Functions (MoF) — map the functions, responsibilities, relationships, and blast radius of a system, and consult that map before any code change. Use this skill whenever the user asks to create, update, or consult a MoF; map an existing project or codebase; assess the impact (blast radius) of a change, refactor, or fix; understand dependencies between functions, modules, or services; or generate a diagram/HTML view of the MoF. Also use it proactively before implementing changes in projects that already have a MOF.md file.
---

# Map of Functions (MoF)

The MoF is a structured knowledge base that models a system's functions, their responsibilities, relationships, and impact rules, so humans and AI agents can plan and execute changes with safety and context. The central goal: before changing a function, know exactly **who depends on it and what can break**.

The artifact produced and maintained by this skill is the `docs/MOF.md` file at the project root (create `docs/` if it doesn't exist). If the project has a `CLAUDE.md`, add a line referencing the MoF as mandatory reading before structural changes.

Don't confuse it with a navigation map (e.g. a `docs/MOC.md`, Map of Content): the MoF documents technical blast radius between functions; a navigation map documents project navigation. Keep the two decoupled — never merge one's content into the other.

## Non-negotiable principles

1. **Knowledge before documentation.** The MoF exists to support reasoning, not to fulfill formality.
2. **Business concepts before implementation.** Functions represent capabilities ("Approve Invoice"), not code artifacts (`InvoiceService.approve()`). The `interfaces` field connects the capability to the real code.
3. **Incremental discovery.** Incomplete knowledge is acceptable; incorrect assumption is not. Mark uncertainty with `status: unverified`.
4. **Never invent business rules.** When the code doesn't answer, ask the human. Record the question in the `open_questions` section.
5. **Traceability.** Every item has a unique ID; before creating one, grep the MoF for the prefix and use the next free number — never reuse or guess the next one from memory. Functions use `F_<DOMAIN>_<NNN>` (e.g. `F_BILLING_003`) so they don't collide across domains mapped in different sessions; the other types (`R_`, `IR_`, `EVT_`, `W_`) use a simple sequential `<PREFIX>_<NNN>`. Every relationship is explicit.
6. **Living document.** Every code change triggers a MoF review (see Mode C).

## Operating modes

Identify the mode before acting:

| Situation                                                        | Mode                          |
| ----------------------------------------------------------------- | ------------------------------ |
| Existing project without a MoF, or with an outdated MoF          | **A — Bootstrap / Discovery** |
| Task to create, modify, or refactor code in a project with a MoF | **B — Impact query**          |
| Code change completed                                            | **C — Maintenance**           |
| User asks for a visual diagram/map of the MoF                    | **D — Visualization**         |

---

## Mode A — Bootstrap on an existing project

Never try to build the complete MoF in one pass. Follow the cycle: **discover → classify → validate → expand → repeat**.

### Discovery order

1. **Inventory.** Walk the repository structure (directory tree, entry points, routes, handlers, workers, migrations, integration configs). List every concept found — functions, entities, events, integrations — in the MoF's `inventory` section, without classifying yet. Nothing is discarded.
2. **Domains.** Group the inventory into business capabilities. Each function belongs to exactly one primary domain.
3. **Functions.** Fill in the function registry (template in [`mof-template.md`](mof-template.md)) starting from entry points and descending through the calls. Prioritize functions with side effects (database writes, events, external calls) — they carry the highest risk.
4. **Relationships.** For each function, trace in the code: what it calls (upstream) and what calls it (downstream). Use reference search, not memory.
5. **Impact rules.** Derive `IR_` rules from the relationships: for every function with 2 or more consumers, or with side effects, create an impact rule.
6. **Cross-cutting rules.** Record authentication, transactions, error handling, and retries that affect multiple functions.

### Validation with the human

At the end of each discovery cycle, present a summary of what was mapped and list the `open_questions`. Every human answer is incorporated and the item moves from `unverified` to `verified`. In large codebases, propose mapping one domain per session.

### Quality criteria per item

Every **Function** must answer: why it exists; which domain owns it; which workflows use it; which entities it manipulates; which events it consumes and publishes; what can break if it changes.
Every **Entity** must answer: who owns it; which functions read it; which modify it.
Every **Workflow** must answer: which functions compose it; where it starts; where it ends. Workflows never duplicate function descriptions — they only sequence them by ID.

### When to split by domain

A single `docs/MOF.md` is the default. Past ~500 lines (the same file-size guideline used elsewhere in the project), split by domain: `docs/mof/<domain>.md` holds the Functions, Entities, Events, and intra-domain Relationships sections for that domain; `docs/MOF.md` becomes an index — Metadata, a domain table linking to each file, cross-domain Relationships and Impact Rules, Cross-Cutting Rules, Open Questions, and Revision History. Never duplicate a function across two files.

---

## Mode B — Impact query before changes

Mandatory flow before proposing any code change that touches logic, contracts, or behavior. Purely cosmetic changes (typos, formatting, comments, doc text) skip straight to implementation:

1. **Check freshness.** Compare `mof_meta.last_updated` (or the latest Revision History entry) against the date of the last relevant commit (`git log -1 --format=%ad -- <touched paths>`). If the code changed after the MoF without a matching entry, treat it as stale and run a mini Mode A cycle on the affected area before proceeding.
2. **Identify** the MoF function(s) related to the task (`functions[].id`) — grep `docs/MOF.md` for the name/ID instead of loading the whole file when it's large.
3. **List relationships**, direct and indirect (`relationships[]` filtered by `from` and `to`). Traverse the graph until the blast radius is exhausted — consumers of consumers count.
4. **Check impact rules** (`impact_rules[]` filtered by `trigger.function_id`).
5. **Derive actions**: tests to update, contracts to review, documentation and ADRs to create.
6. **Only then** propose the code, respecting the function's `responsibilities`, `non_responsibilities`, and `boundaries`.

### Agent response pattern

While working on the task, make the plan explicit:

- **Functions involved:** `F_...`
- **Relationships affected:** `R_...`
- **Impact rules triggered:** `IR_...`
- **Blast radius:** list of downstream functions requiring review
- **Intended actions:** tests, contracts, documentation

If the task touches functions absent from the MoF, run a mini Mode A cycle for them before proceeding.

---

## Mode C — Maintenance after changes

After completing a code change, update in `docs/MOF.md`:

- Affected functions (responsibilities, interfaces, side effects)
- Relationships created, changed, or removed
- Impact rules the change invalidated or created
- Revision history (version, date, commit, summary)

The MoF is stale when it no longer reflects the system's behavior. Stale documentation is worse than none, because it leads the agent to incorrect assumptions.

---

## Mode D — Visualization

Only runs on explicit user request ("visualize the MoF", "generate a diagram", "show me the map") — never automatically at the end of Mode C. Generating the HTML on every code change would pop the browser open constantly, more noise than help.

Produces `docs/MOF.html` from the MoF's YAML you already read: a Mermaid graph by domain/function/relationship/risk, Functions and Impact Rules reference tables, its own palette, automatic file opening in the OS. Translation rules, palette, and the full HTML template: see [`visualization.md`](visualization.md).

---

## `docs/MOF.md` document template

Full structure (Metadata, Inventory, Functions, Entities, Events, Workflows, Relationships, Impact Rules, Cross-Cutting Rules, Open Questions, Revision History): see [`mof-template.md`](mof-template.md). Used by Modes A and C.

---

## Maturity criterion

The MoF is mature when it allows an agent to **understand → reason → plan → implement → validate → document** a change with minimal additional context, and when every function with side effects has at least one associated impact rule and `exposed_to` verified against the real code.
