---
name: mof
description: Map of Functions (MoF) — map the functions, responsibilities, relationships, and blast radius of a system, and consult that map before any code change. Use this skill whenever the user asks to create, update, or consult a MoF; map an existing project or codebase; assess the impact of a change, refactor, or fix; understand dependencies between functions, modules, or services; or mentions terms like "blast radius", "impact radius", "function map", "what breaks if I change this". Also use it proactively before implementing changes in projects that already have a MOF.md file.
---

# Map of Functions (MoF)

The MoF is a structured knowledge base that models a system's functions, their responsibilities, relationships, and impact rules, so humans and AI agents can plan and execute changes with safety and context. The central goal: before changing a function, know exactly **who depends on it and what can break**.

The artifact produced and maintained by this skill is the `docs/MOF.md` file at the project root (create `docs/` if it doesn't exist). If the project has a `CLAUDE.md`, add a line referencing the MoF as mandatory reading before structural changes.

## Non-negotiable principles

1. **Knowledge before documentation.** The MoF exists to support reasoning, not to fulfill formality.
2. **Business concepts before implementation.** Functions represent capabilities ("Approve Invoice"), not code artifacts (`InvoiceService.approve()`). The `interfaces` field connects the capability to the real code.
3. **Incremental discovery.** Incomplete knowledge is acceptable; incorrect assumption is not. Mark uncertainty with `status: unverified`.
4. **Never invent business rules.** When the code doesn't answer, ask the human. Record the question in the `open_questions` section.
5. **Traceability.** Every item has a unique ID (`F_`, `R_`, `IR_`, `EVT_`) and every relationship is explicit.
6. **Living document.** Every code change triggers a MoF review (see Mode C).

## Operating modes

Identify the mode before acting:

| Situation                                                        | Mode                          |
| ---------------------------------------------------------------- | ----------------------------- |
| Existing project without a MoF, or with an outdated MoF          | **A — Bootstrap / Discovery** |
| Task to create, modify, or refactor code in a project with a MoF | **B — Impact query**          |
| Code change completed                                            | **C — Maintenance**           |

---

## Mode A — Bootstrap on an existing project

Never try to build the complete MoF in one pass. Follow the cycle: **discover → classify → validate → expand → repeat**.

### Discovery order

1. **Inventory.** Walk the repository structure (directory tree, entry points, routes, handlers, workers, migrations, integration configs). List every concept found — functions, entities, events, integrations — in the MoF's `inventory` section, without classifying yet. Nothing is discarded.
2. **Domains.** Group the inventory into business capabilities. Each function belongs to exactly one primary domain.
3. **Functions.** Fill in the function registry (template below) starting from entry points and descending through the calls. Prioritize functions with side effects (database writes, events, external calls) — they carry the highest risk.
4. **Relationships.** For each function, trace in the code: what it calls (upstream) and what calls it (downstream). Use reference search, not memory.
5. **Impact rules.** Derive `IR_` rules from the relationships: for every function with 2 or more consumers, or with side effects, create an impact rule.
6. **Cross-cutting rules.** Record authentication, transactions, error handling, and retries that affect multiple functions.

### Validation with the human

At the end of each discovery cycle, present a summary of what was mapped and list the `open_questions`. Every human answer is incorporated and the item moves from `unverified` to `verified`. In large codebases, propose mapping one domain per session.

### Quality criteria per item

Every **Function** must answer: why it exists; which domain owns it; which workflows use it; which entities it manipulates; which events it consumes and publishes; what can break if it changes.
Every **Entity** must answer: who owns it; which functions read it; which modify it.
Every **Workflow** must answer: which functions compose it; where it starts; where it ends. Workflows never duplicate function descriptions — they only sequence them by ID.

---

## Mode B — Impact query before changes

Mandatory flow before proposing any code change:

1. **Identify** the MoF function(s) related to the task (`functions[].id`).
2. **List relationships**, direct and indirect (`relationships[]` filtered by `from` and `to`). Traverse the graph until the blast radius is exhausted — consumers of consumers count.
3. **Check impact rules** (`impact_rules[]` filtered by `trigger.function_id`).
4. **Derive actions**: tests to update, contracts to review, documentation and ADRs to create.
5. **Only then** propose the code, respecting the function's `responsibilities`, `non_responsibilities`, and `boundaries`.

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
- Revision history (version, date, summary)

The MoF is stale when it no longer reflects the system's behavior. Stale documentation is worse than none, because it leads the agent to incorrect assumptions.

---

## `docs/MOF.md` document template

Use exactly this structure. YAML blocks keep it readable by humans and parseable by agents.

````markdown
# Map of Functions — <SYSTEM_NAME>

> Consult this document before creating, modifying, or refactoring code.
> Always assess the blast radius: check `exposed_to` and `impact_rules`
> before changing any function.

## Metadata

```yaml
mof_meta:
  system_name: "<NAME>"
  purpose: "<1-2 sentences>"
  version: "0.1.0"
  last_updated: "YYYY-MM-DD"
  owners: ["<OWNER>"]
  domains: ["<DOMAIN_1>", "<DOMAIN_2>"]
  external_dependencies: ["<e.g. Stripe API, AWS S3, PostgreSQL>"]
```

## Inventory (pre-classification)

```yaml
inventory:
  - name: "<discovered concept>"
    kind: "function | entity | event | integration | unknown"
    status: "unverified | verified"
```

## Functions

```yaml
functions:
  - id: "F_<CODE>"
    name: "<Business capability, e.g. Approve Invoice>"
    type: "API | Domain Service | Infrastructure | UI Component | Worker | Library"
    domain: "<DOMAIN>"
    status: "unverified | verified"
    responsibilities:
      - "<VERB + OBJECT: what it does>"
    non_responsibilities:
      - "<What it explicitly does NOT do. E.g. validates the cart, but does NOT calculate shipping>"
    entities: ["<Business entities manipulated>"]
    interfaces:
      code_ref: "<real file/class/method, e.g. src/billing/approve.py:approve_invoice>"
      inputs:
        - "<param>: <type> — <description>"
      outputs:
        - "<return>: <type> — <success and error scenarios>"
    state: "stateless | stateful: <description>"
    side_effects:
      database: "<table/entity or null>"
      events_published: ["EVT_<CODE>"]
      events_consumed: ["EVT_<CODE>"]
      external_calls: ["<external service or null>"]
    boundaries:
      depends_on: ["F_<ID>"] # upstream: what this function calls
      exposed_to: ["F_<ID>"] # downstream: what calls this function (BLAST RADIUS)
    notes: ["<constraints, assumptions>"]
```

## Entities

```yaml
entities:
  - name: "<Entity, e.g. Invoice>"
    owner_domain: "<DOMAIN>"
    read_by: ["F_<ID>"]
    modified_by: ["F_<ID>"]
```

## Events

```yaml
# Events are facts in the past: "Invoice Approved", never "Approve Invoice".
events:
  - id: "EVT_<CODE>"
    name: "<Fact that happened>"
    published_by: ["F_<ID>"]
    consumed_by: ["F_<ID>"]
```

## Workflows

```yaml
workflows:
  - id: "W_<CODE>"
    name: "<Flow name>"
    starts_at: "F_<ID>"
    ends_at: "F_<ID>"
    sequence: ["F_<ID>", "F_<ID>", "F_<ID>"]
```

## Relationships

```yaml
relationships:
  - id: "R_<CODE>"
    from: "F_<SOURCE_ID>"
    to: "F_<TARGET_ID>"
    type: "calls | publishes | subscribes | reads_from | writes_to"
    coupling: "tight | loose"
    channel: "HTTP | RPC | Message Queue | Shared Database | File"
    criticality: "critical | degraded_ok | optional"
    description: "<what it represents>"
```

## Impact Rules

```yaml
impact_rules:
  - id: "IR_<CODE>"
    trigger:
      function_id: "F_<ID>"
      change: "<signature | behavior | contract | business rule>"
    affected_direct: ["F_<ID>"]
    affected_indirect: ["F_<ID>"]
    impact_type: "breaking | non_breaking | behavioral"
    risk: "high | medium | low"
    recommended_actions:
      - "<concrete action: update tests X, review contract Y, create ADR>"
```

## Cross-Cutting Rules

- **Security/Auth:** <e.g. every write function requires an admin token>
- **Error handling:** <e.g. network failure triggers exponential retry 3x>
- **Transactions:** <e.g. if F_A and F_B fail, rollback is mandatory>

## Open Questions

```yaml
open_questions:
  - question: "<doubt the code doesn't answer>"
    context: "related F_<ID> or W_<ID>"
```

## Revision History

| Version | Date       | Author | Changes          |
| ------- | ---------- | ------ | ---------------- |
| 0.1.0   | YYYY-MM-DD | <NAME> | Initial creation |
````

---

## Maturity criterion

The MoF is mature when it allows an agent to **understand → reason → plan → implement → validate → document** a change with minimal additional context, and when every function with side effects has at least one associated impact rule and `exposed_to` verified against the real code.
