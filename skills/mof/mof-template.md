# `docs/MOF.md` document template

Disclosed from Mode A (Bootstrap) and Mode C (Maintenance) of the `mof` skill. Use exactly this structure — YAML blocks keep it readable by humans and parseable by agents.

Every section below has a named consumer in Mode B. Nothing here is decorative; do not add a section without giving it one.

## The `impact_index` line format

The index is what Mode B reads instead of the whole document — one line per function, all of it projected from the sections further down. Regenerate a line whenever its source data changes; never edit it as if it were the source.

```
F_<ID> | <code_ref> | dom:<DOMAIN> | dep:<upstream ids> | exp:<downstream ids> | ent:<Entity(r|w)> | evt:+<published> -<consumed> | ir:<rule ids>
```

| Field  | Projected from                          | Read by Mode B          |
| ------ | --------------------------------------- | ----------------------- |
| `dom:` | `functions[].domain`                    | step 1 (locate)         |
| `dep:` | `relationships[]` where `to` = this fn   | step 3 (upstream trace) |
| `exp:` | `relationships[]` where `from` = this fn | step 3 (radius)         |
| `ent:` | `entities[].read_by` / `.modified_by`   | step 4 (state fan-out)  |
| `evt:` | `events[].published_by` / `.consumed_by` | step 4 (state fan-out)  |
| `ir:`  | `impact_rules[].trigger.function_id`    | step 6 (rules)          |

Use `-` for an empty field. Keep every line on one physical line — the index is grepped, and a wrapped line breaks the match.

---

````markdown
# Map of Functions — <SYSTEM_NAME>

> Consult this document before creating, modifying, or refactoring code.
> Start at `impact_index` — it carries the whole blast-radius traversal.
> Open a function's full block only once it is inside the computed radius.

## Metadata

```yaml
mof_meta:
  system_name: "<NAME>"
  purpose: "<1-2 sentences>"
  version: "0.1.0"
  last_updated: "YYYY-MM-DD" # Mode B step 2 trusts this; Mode C must update it
  domains: ["<DOMAIN_1>", "<DOMAIN_2>"] # order fixes the diagram's color slots
```

## Impact Index

```yaml
# Derived projection — regenerate from the sections below, never hand-edit alone.
# Format and field sources: see mof-template.md § The impact_index line format.
impact_index:
  - "F_BILLING_003 | src/billing/approve.py:approve_invoice | dom:BILLING | dep:F_BILLING_001 | exp:F_API_007,F_WORKER_002 | ent:Invoice(w),Customer(r) | evt:+EVT_004 -EVT_002 | ir:IR_004"
```

## Functions

```yaml
functions:
  - id: "F_<DOMAIN>_<NNN>"
    name: "<Business capability, e.g. Approve Invoice>"
    domain: "<DOMAIN>"
    status: "unverified | verified"
    responsibilities:
      - "<VERB + OBJECT: what it does>"
    non_responsibilities:
      - "<What it explicitly does NOT do. E.g. validates the cart, but does NOT calculate shipping>"
    interfaces:
      code_ref: "<real file/class/method, e.g. src/billing/approve.py:approve_invoice>"
      inputs:
        - "<param>: <type> — <description>"
      outputs:
        - "<return>: <type> — <success and error scenarios>"
    state: "stateless | stateful: <description>"
    side_effects:
      database: "<table/entity or null>"
      external_calls: ["<external service or null>"]
    notes: ["<constraints, assumptions>"]
```

Edges are not repeated here — they live in `relationships[]` and reach Mode B through `impact_index`. Events are not repeated here either; `events[]` owns them.

## Entities

```yaml
# Mode B step 4 reads this: a writer's behavior change breaks its readers
# even with no call edge between them.
entities:
  - name: "<Entity, e.g. Invoice>"
    owner_domain: "<DOMAIN>"
    read_by: ["F_<ID>"]
    modified_by: ["F_<ID>"]
```

## Events

```yaml
# Events are facts in the past: "Invoice Approved", never "Approve Invoice".
# Mode B step 4 reads consumed_by: loose coupling still transmits breakage.
events:
  - id: "EVT_<NNN>"
    name: "<Fact that happened>"
    published_by: ["F_<ID>"]
    consumed_by: ["F_<ID>"]
```

## Workflows

```yaml
# Mode B step 5 reads this: a change can be locally correct and still
# break the end-to-end contract of a flow the function participates in.
workflows:
  - id: "W_<NNN>"
    name: "<Flow name>"
    starts_at: "F_<ID>"
    ends_at: "F_<ID>"
    sequence: ["F_<ID>", "F_<ID>", "F_<ID>"]
```

## Relationships

```yaml
# Source of truth for every edge. impact_index projects dep:/exp: from here.
relationships:
  - id: "R_<NNN>"
    from: "F_<SOURCE_ID>"
    to: "F_<TARGET_ID>"
    type: "calls | publishes | subscribes | reads_from | writes_to"
    coupling: "tight | loose"
    channel: "HTTP | RPC | Message Queue | Shared Database | File"
    criticality: "critical | degraded_ok | optional" # critical extends traversal past depth 2
    description: "<what it represents>"
```

## Impact Rules

```yaml
impact_rules:
  - id: "IR_<NNN>"
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

```yaml
# Mode B step 7 reads this. Scope each rule to the functions it binds,
# so a query can tell which apply without reading the prose.
cross_cutting:
  - rule: "<e.g. every write function requires an admin token>"
    kind: "auth | transaction | error_handling | retry"
    applies_to: ["F_<ID>"] # or "<DOMAIN>" for a whole domain
```

## Open Questions

```yaml
# Also the home for concepts discovery could not classify — there is no
# permanent inventory section.
open_questions:
  - question: "<doubt the code doesn't answer>"
    context: "related F_<ID> or W_<ID>"
```

## Revision History

| Version | Date       | Commit   | Author | Changes          |
| ------- | ---------- | -------- | ------ | ---------------- |
| 0.1.0   | YYYY-MM-DD | `<sha7>` | <NAME> | Initial creation |
````
