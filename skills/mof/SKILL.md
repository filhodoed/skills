---
name: mof
description: Map of Functions (MoF) — a living map of a system's functions, dependencies, and blast radius, consulted before any code change. Use when asked to create, update, or consult a MoF; to assess the blast radius of a change, refactor, or fix; to understand dependencies between functions or modules; or to render the MoF as a diagram. Use proactively in any project that already has a docs/MOF.md.
---

# Map of Functions (MoF)

The MoF is a structured knowledge base that models a system's functions, their responsibilities, relationships, and impact rules, so humans and AI agents can plan and execute changes with safety and context. The central goal: before changing a function, know exactly **who depends on it and what can break**.

The artifact produced and maintained by this skill is `docs/MOF.md` at the project root (create `docs/` if it doesn't exist). If the project has a `CLAUDE.md`, add a line referencing the MoF as mandatory reading before structural changes — that line, not this description, is what reliably makes the map get consulted.

Don't confuse it with a navigation map (e.g. a `docs/MOC.md`, Map of Content): the MoF documents technical blast radius between functions; a navigation map documents project navigation. Keep the two decoupled — never merge one's content into the other.

## Non-negotiable principles

1. **Knowledge before documentation.** The MoF exists to support reasoning, not to fulfill formality.
2. **Business concepts before implementation.** Functions represent capabilities ("Approve Invoice"), not code artifacts (`InvoiceService.approve()`). The `interfaces` field connects the capability to the real code.
3. **Incremental discovery.** Incomplete knowledge is acceptable; incorrect assumption is not. Mark uncertainty with `status: unverified`.
4. **Never invent business rules.** When the code doesn't answer, ask the human. Record the question in `open_questions`.
5. **Traceability.** Every item has a unique ID; before creating one, grep the MoF for the prefix and use the next free number — never reuse or guess the next one from memory. Functions use `F_<DOMAIN>_<NNN>` (e.g. `F_BILLING_003`) so they don't collide across domains mapped in different sessions; other types (`R_`, `IR_`, `EVT_`, `W_`) use a simple sequential `<PREFIX>_<NNN>`.
6. **One fact, one home.** `relationships[]` is the source of truth for every edge. `impact_index` is a projection of it, regenerated — never hand-edited alone. No third copy of an edge exists.
7. **Every section has a reader.** Mode B names the consumer of every part of the template. Anything you add must earn one.
8. **Living document.** Every code change triggers a MoF review (see Mode C).

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

Never build the complete MoF in one pass. Follow the cycle: **discover → classify → validate → expand → repeat**.

### Discovery order

1. **Inventory — session scratch, never written to the file.** Walk the repository structure (directory tree, entry points, routes, handlers, workers, migrations, integration configs) and list every concept found. It exists so nothing is dropped before step 3, and is fully superseded once classified. Concepts you cannot classify go to `open_questions` — there is no permanent inventory section.
2. **Domains.** Group the inventory into business capabilities. Each function belongs to exactly one primary domain.
3. **Functions.** Fill the function registry ([`mof-template.md`](mof-template.md)) starting from entry points and descending through the calls. Prioritize functions with side effects (database writes, events, external calls) — highest risk.
4. **Relationships.** For each function, trace in the code what it calls and what calls it. Use reference search, not memory. Record each edge once, in `relationships[]`.
5. **Entities and events.** Record which functions read and which modify each entity, which publish and which consume each event. These are the impact paths the call graph cannot see — Mode B step 4 depends on them.
6. **Impact rules.** For every function with 2+ consumers, or with side effects, create an `IR_` rule.
7. **Cross-cutting rules.** Record auth, transactions, error handling, and retries affecting multiple functions.
8. **Generate `impact_index` last**, projected from everything above — it is only correct if built after the rest. Format: [`mof-template.md`](mof-template.md).

### Validation with the human

At the end of each cycle, present a summary of what was mapped and list the `open_questions`. Every human answer is incorporated and the item moves from `unverified` to `verified`. In large codebases, propose mapping one domain per session.

### Quality criteria per item

Every **Function** must answer: why it exists; which domain owns it; which entities it manipulates; which events it consumes and publishes; what breaks if it changes.
Every **Entity** must answer: who owns it; which functions read it; which modify it.
Every **Workflow** must answer: which functions compose it; where it starts; where it ends. Workflows never duplicate function descriptions — they only sequence them by ID.

### When to split by domain

A single `docs/MOF.md` is the default. Past ~800 lines, split by domain: `docs/mof/<domain>.md` holds that domain's Functions, Entities, Events, and intra-domain Relationships; `docs/MOF.md` becomes an index — Metadata, a domain table linking to each file, cross-domain Relationships and Impact Rules, Cross-Cutting Rules, Open Questions, Revision History.

**`impact_index` never splits.** It stays whole in `docs/MOF.md` covering every domain, so a cross-domain traversal still costs one file read. Never duplicate a function across two files.

---

## Mode B — Impact query before changes

Mandatory before proposing any code change that touches logic, contracts, or behavior. Purely cosmetic changes (typos, formatting, comments, doc text) skip straight to the edit.

**Read `impact_index` and nothing else to start.** It carries every field this flow needs. Do not load the whole `docs/MOF.md`, and do not open any function's full block until that function is already in the computed radius. This is the flow, not a size-dependent optimization.

1. **Locate the seeds.** Grep `impact_index` for the task's subject: capability name, `code_ref` path, or domain.
2. **Check freshness, scoped to the seeds.** With the seeds' `code_ref` paths known, run `git log -1 --format=%ad -- <those paths>` against `mof_meta.last_updated`. Run a mini Mode A cycle only for a seed whose code moved after the MoF. Never freshness-check the whole repo — a repo-wide `git log` reports stale after any commit anywhere.
3. **Traverse the call graph.** From each seed, follow `exp:` (downstream) to **depth 2**. Go deeper along an edge only when its `relationships[].criticality` is `critical`. Record the depth reached. If the radius swallows most of the map, that is a failed query — say so and narrow the change instead of reporting the whole system as affected.
4. **Fan out through state** — two paths the call graph cannot see:
   - **Entities.** For each in-radius function writing an entity (`ent:` marked `(w)`), add every function that reads it. A writer's behavior change breaks its readers with no call edge between them.
   - **Events.** For each in-radius function publishing an event (`evt:` marked `+`), add that event's `consumed_by`. Loose coupling still transmits breakage.
5. **Check workflows.** Any `workflows[]` whose `sequence` contains an in-radius function needs end-to-end review — a change can be locally correct and still break the flow's contract.
6. **Apply impact rules.** Take the `ir:` ids from each in-radius index line and read those rules. Their `recommended_actions` are required work, not suggestions.
7. **Apply cross-cutting rules.** Check `cross_cutting` for rules binding the in-radius functions. A change that satisfies its function and violates a cross-cutting rule is a defect.
8. **Only now read the details** — for the in-radius functions and only those: `responsibilities`, `non_responsibilities`, `interfaces`, `side_effects`, `state`, `notes`.
9. **Derive actions:** tests to update, contracts to review, documentation and ADRs to create.
10. **Only then** propose the code, respecting each function's `responsibilities` and `non_responsibilities`.

If the task touches functions absent from the MoF, run a mini Mode A cycle for them first.

### Agent response pattern

Make the plan explicit:

- **Functions involved:** `F_...`
- **Blast radius:** downstream functions requiring review, and the **traversal depth reached**
- **Reached via state:** functions pulled in by entity or event fan-out, not by a call edge
- **Workflows affected:** `W_...`
- **Impact rules triggered:** `IR_...`
- **Cross-cutting rules in play:** which, and how the change satisfies them
- **Intended actions:** tests, contracts, documentation

---

## Mode C — Maintenance after changes

After completing a code change, update in `docs/MOF.md`:

- Affected functions (responsibilities, interfaces, side effects, state)
- `relationships[]` created, changed, or removed
- `entities[]` / `events[]` where the change altered who reads, writes, publishes, or consumes
- Impact rules the change invalidated or created
- **`impact_index` lines for every touched function**, regenerated from the sections above
- **`mof_meta.last_updated`**, and `version` when the change is structural — Mode B step 2 reads `last_updated`, so leaving it stale makes every future query distrust a current map
- Revision history (version, date, commit, summary)

The MoF is stale when it no longer reflects the system's behavior. Stale documentation is worse than none: it leads the agent to incorrect assumptions.

---

## Mode D — Visualization

Only on explicit user request ("visualize the MoF", "generate a diagram", "show me the map") — never automatically at the end of Mode C. Generating the HTML on every code change would pop the browser open constantly.

Produces `docs/MOF.html`: a Mermaid graph by domain/function/relationship/risk, Functions and Impact Rules tables, opened in the OS when done. The page shell is a fixed asset ([`mof-shell.html`](mof-shell.html)) that you copy and fill at five markers — never retype it. Translation rules, palette, and fill procedure: [`visualization.md`](visualization.md).

---

## `docs/MOF.md` document template

Full structure (Metadata, Impact Index, Functions, Entities, Events, Workflows, Relationships, Impact Rules, Cross-Cutting Rules, Open Questions, Revision History): [`mof-template.md`](mof-template.md). Used by Modes A and C.

---

## Maturity criterion

The MoF is mature when it lets an agent **understand → reason → plan → implement → validate → document** a change with minimal additional context, when every function with side effects has at least one impact rule, when `exp:` in `impact_index` is verified against the real code, and when a Mode B query resolves a blast radius **without reading a single function's full block outside that radius**.
