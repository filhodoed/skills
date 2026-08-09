---
name: mof
description: Map of Functions (MoF) — a living map of a system's functions, dependencies, and blast radius, consulted before any code change. Use when asked to create, update, or consult a MoF; to assess the blast radius of a change, refactor, or fix; to understand dependencies between functions or modules; to check a codebase for Single Responsibility violations; or to render the MoF as a diagram. Use proactively in any project that already has a docs/MOF.md.
---

# Map of Functions (MoF)

The MoF is a structured knowledge base that models a system's functions, their responsibilities, relationships, and impact rules, so humans and AI agents can plan and execute changes with safety and context. The central goal: before changing a function, know exactly **who depends on it and what can break**.

The artifact produced and maintained by this skill is `docs/MOF.md` at the project root (create `docs/` if it doesn't exist). If the project has a `CLAUDE.md`, add a line referencing the MoF as mandatory reading before structural changes — that line, not this description, is what reliably makes the map get consulted.

Don't confuse it with a navigation map (e.g. a `docs/MOC.md`, Map of Content): the MoF documents technical blast radius between functions; a navigation map documents project navigation. Keep the two decoupled — never merge one's content into the other.

## Non-negotiable principles

1. **Knowledge before documentation.** The MoF exists to support reasoning, not to fulfill formality.
2. **One reason to change, one Responsibility.** A `Responsibility` is the atomic unit — a single verb-object capability with a single reason to change ("Authorize invoice approval", not "Approve invoice" bundling authorization, notification, and audit logging). A `Function` groups the Responsibilities that share one code artifact (`code_ref`); it carries no behavior of its own.
3. **Incremental discovery.** Incomplete knowledge is acceptable; incorrect assumption is not. Mark uncertainty with `status: unverified`.
4. **Never invent business rules.** When the code doesn't answer, ask the human. Record the question in `open_questions`.
5. **Traceability.** Every item has a unique ID; before creating one, grep the MoF for the prefix and use the next free number — never reuse or guess the next one from memory. `Responsibility` (`RESP_<DOMAIN>_<NNN>`) and `Function` (`F_<DOMAIN>_<NNN>`) are domain-scoped so they don't collide across domains mapped in different sessions; other types (`R_`, `IR_`, `EVT_`, `W_`) use a simple sequential `<PREFIX>_<NNN>`.
6. **One fact, one home.** `relationships[]` is the source of truth for every edge, recorded between Responsibilities. `impact_index` and a Function's `srp_status` are projections of it, regenerated — never hand-edited alone.
7. **Every section has a reader.** Query names the consumer of every part of the template. Anything you add must earn one.
8. **Living document.** Every code change triggers a Map review (see Map § After a change lands).

## Operating modes

Identify the mode before acting:

| Situation                                                         | Mode          |
| ------------------------------------------------------------------ | ------------- |
| No MoF, an outdated one, or a code change just landed              | **Map**       |
| Task to create, modify, or refactor code in a project with a MoF   | **Query**     |
| User asks to see the MoF as a diagram, or for an SRP checkup       | **Visualize** |

---

## Map — discover and maintain

Never build the complete MoF in one pass, whether you're starting from zero or folding in a change that just landed. Follow the cycle: **discover → classify → validate → expand → repeat**.

### Discovery order

1. **Inventory — session scratch, never written to the file.** Walk the repository structure (directory tree, entry points, routes, handlers, workers, migrations, integration configs) and list every concept found — or, if a change just landed, the files it touched. It exists so nothing is dropped before step 3, and is fully superseded once classified. Concepts you cannot classify go to `open_questions` — there is no permanent inventory section.
2. **Domains.** Group the inventory into business capabilities. Each Responsibility belongs to exactly one primary domain.
3. **Responsibilities.** For each code artifact, decompose it into its distinct reasons to change: one `Responsibility` per side effect, business rule, or concern it carries. Fill the registry ([`mof-template.md`](mof-template.md)), starting from entry points and descending through the calls. Prioritize Responsibilities with side effects (database writes, events, external calls) — highest risk. A code artifact that only ever does one thing yields exactly one Responsibility; one that does several yields several, all sharing the same `code_ref`.
4. **Functions.** Group Responsibilities by shared `code_ref` into `Function` entries. Compute `srp_status`: `ok` when a Function groups exactly one Responsibility, `violation` when it groups two or more — the grouping itself is the Single Responsibility check, not a separate audit.
5. **Relationships.** For each Responsibility, trace in the code what it calls and what calls it. Use reference search, not memory. Record each edge once, in `relationships[]`, between Responsibility ids.
6. **Entities and events.** Record which Responsibilities read and which modify each entity, which publish and which consume each event. These are the impact paths the call graph cannot see — Query step 4 depends on them.
7. **Impact rules.** For every Responsibility with 2+ consumers, or with side effects, create an `IR_` rule.
8. **Cross-cutting rules.** Record auth, transactions, error handling, and retries affecting multiple Responsibilities.
9. **Generate `impact_index` last**, projected from everything above — it is only correct if built after the rest. Format: [`mof-template.md`](mof-template.md).

### Validation with the human

At the end of each cycle, present a summary of what was mapped and list the `open_questions`. Every human answer is incorporated and the item moves from `unverified` to `verified`. In large codebases, propose mapping one domain per session; after a landed change, propose reviewing just the Responsibilities and Functions it touched.

### Quality criteria per item

Every **Responsibility** must answer: why it exists; its single reason to change; which domain owns it; which entities it manipulates; which events it consumes and publishes; what breaks if it changes.
Every **Function** must answer: which Responsibilities it groups, and why its `srp_status` is what it is.
Every **Entity** must answer: who owns it; which Responsibilities read it; which modify it.
Every **Workflow** must answer: which Responsibilities compose it; where it starts; where it ends. Workflows never duplicate Responsibility descriptions — they only sequence them by ID.

### When to split by domain

A single `docs/MOF.md` is the default. Past ~800 lines, split by domain: `docs/mof/<domain>.md` holds that domain's Responsibilities, Functions, Entities, Events, and intra-domain Relationships; `docs/MOF.md` becomes an index — Metadata, a domain table linking to each file, cross-domain Relationships and Impact Rules, Cross-Cutting Rules, Open Questions, Revision History.

**`impact_index` never splits.** It stays whole in `docs/MOF.md` covering every domain, so a cross-domain traversal still costs one file read. Never duplicate a Responsibility across two files.

### After a change lands

Update in `docs/MOF.md`:

- Affected Responsibilities (their description, interfaces, side effects, state), and the `srp_status` of any Function whose Responsibility count changed
- `relationships[]` created, changed, or removed
- `entities[]` / `events[]` where the change altered who reads, writes, publishes, or consumes
- Impact rules the change invalidated or created
- **`impact_index` lines for every touched Responsibility**, regenerated from the sections above
- **`mof_meta.last_updated`**, and `version` when the change is structural — Query step 2 reads `last_updated`, so leaving it stale makes every future query distrust a current map
- Revision history (version, date, commit, summary)

The MoF is stale when it no longer reflects the system's behavior. Stale documentation is worse than none: it leads the agent to incorrect assumptions.

---

## Query — before changes

Mandatory before proposing any code change that touches logic, contracts, or behavior. Purely cosmetic changes (typos, formatting, comments, doc text) skip straight to the edit.

**Read `impact_index` and nothing else to start.** It carries every field this flow needs. Do not load the whole `docs/MOF.md`, and do not open any Responsibility's full block until it is already in the computed radius. This is the flow, not a size-dependent optimization.

1. **Locate the seeds.** Grep `impact_index` for the task's subject: capability name, `code_ref` path, or domain. A `Function` id resolves to every Responsibility it groups.
2. **Check freshness, scoped to the seeds.** With the seeds' `code_ref` paths known, run `git log -1 --format=%ad -- <those paths>` against `mof_meta.last_updated`. Run a mini Map cycle only for a seed whose code moved after the MoF. Never freshness-check the whole repo — a repo-wide `git log` reports stale after any commit anywhere.
3. **Traverse the call graph.** From each seed, follow `exp:` (downstream) to **depth 2**. Go deeper along an edge only when its `relationships[].criticality` is `critical`. Record the depth reached. If the radius swallows most of the map, that is a failed query — say so and narrow the change instead of reporting the whole system as affected.
4. **Fan out through state** — two paths the call graph cannot see:
   - **Entities.** For each in-radius Responsibility writing an entity (`ent:` marked `(w)`), add every Responsibility that reads it. A writer's behavior change breaks its readers with no call edge between them.
   - **Events.** For each in-radius Responsibility publishing an event (`evt:` marked `+`), add that event's `consumed_by`. Loose coupling still transmits breakage.
5. **Check shared-code exposure.** Look at `srp:` on each in-radius line. A `violation` means the Responsibility physically shares a code artifact with siblings that have no logical edge to it — changing one risks breaking the other with nothing in `relationships[]` to warn you. Pull in those siblings for review even though the graph is silent about them.
6. **Check workflows.** Any `workflows[]` whose `sequence` contains an in-radius Responsibility needs end-to-end review — a change can be locally correct and still break the flow's contract.
7. **Apply impact rules.** Take the `ir:` ids from each in-radius index line and read those rules. Their `recommended_actions` are required work, not suggestions.
8. **Apply cross-cutting rules.** Check `cross_cutting` for rules binding the in-radius Responsibilities. A change that satisfies its Responsibility and violates a cross-cutting rule is a defect.
9. **Only now read the details** — for the in-radius Responsibilities and only those: `responsibilities`, `non_responsibilities`, `interfaces`, `side_effects`, `state`, `notes`.
10. **Derive actions:** tests to update, contracts to review, documentation and ADRs to create.
11. **Only then** propose the code, respecting each Responsibility's `responsibilities` and `non_responsibilities`.

If the task touches code absent from the MoF, run a mini Map cycle for it first.

### Agent response pattern

Make the plan explicit:

- **Responsibilities involved:** `RESP_...`, grouped under their `F_...`
- **Blast radius:** downstream Responsibilities requiring review, and the **traversal depth reached**
- **Reached via state:** Responsibilities pulled in by entity or event fan-out, not by a call edge
- **Shared-code exposure:** sibling Responsibilities pulled in by a `srp_status: violation`, not by any edge
- **Workflows affected:** `W_...`
- **Impact rules triggered:** `IR_...`
- **Cross-cutting rules in play:** which, and how the change satisfies them
- **Intended actions:** tests, contracts, documentation

---

## Visualize

Only on explicit user request ("visualize the MoF", "generate a diagram", "check for SRP violations", "audit the map") — never automatically after Map. Generating the HTML on every code change would pop the browser open constantly.

Produces `docs/MOF.html`: a Mermaid graph by domain, each Function rendered as a subgraph holding its Responsibility nodes, a Function with `srp_status: violation` visually flagged; Functions and Impact Rules tables underneath; opened in the OS when done. A request framed as a checkup or audit gets the same output — the Functions table's `srp_status` column and each violating Function's flagged subgraph already are the audit, nothing separate to generate. The page shell is a fixed asset ([`mof-shell.html`](mof-shell.html)) that you copy and fill at five markers — never retype it. Translation rules, palette, and fill procedure: [`visualization.md`](visualization.md).

---

## `docs/MOF.md` document template

Full structure (Metadata, Impact Index, Responsibilities, Functions, Entities, Events, Workflows, Relationships, Impact Rules, Cross-Cutting Rules, Open Questions, Revision History): [`mof-template.md`](mof-template.md). Used by Map.

---

## Maturity criterion

The MoF is mature when it lets an agent **understand → reason → plan → implement → validate → document** a change with minimal additional context, when every Responsibility with side effects has at least one impact rule, when `exp:` in `impact_index` is verified against the real code, when every Function's `srp_status` reflects a deliberate choice rather than an accident of how the code grew, and when a Query resolves a blast radius **without reading a single Responsibility's full block outside that radius**.
