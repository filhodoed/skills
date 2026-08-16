# `docs/MOF.md` document template

Disclosed from Map and consulted by Query of the `mof` skill. Use exactly this structure — YAML blocks keep it readable by humans and parseable by agents.

Every section below has a named consumer in Query. Nothing here is decorative; do not add a section without giving it one.

## The `impact_index` line format

The index is what Query reads instead of the whole document — one line per Responsibility, all of it projected from the sections further down. Regenerate a line whenever its source data changes; never edit it as if it were the source.

```
RESP_<ID> | fn:F_<ID> | <code_ref> | dom:<DOMAIN> | dep:<upstream ids> | exp:<downstream ids> | ent:<Entity(r|w)> | evt:+<published> -<consumed> | ir:<rule ids> | srp:<ok|violation>
```

| Field  | Projected from                                             | Read by Query                          |
| ------ | ------------------------------------------------------------ | ---------------------------------------- |
| `fn:`  | `functions[]` whose `responsibilities[]` contains this id   | step 1 (locate), step 5 (shared-code exposure) |
| `dom:` | `responsibilities[].domain`                                 | step 1 (locate)                         |
| `dep:` | `relationships[]` where `to` = this responsibility          | step 3 (upstream trace)                 |
| `exp:` | `relationships[]` where `from` = this responsibility        | step 3 (radius)                         |
| `ent:` | `entities[].read_by` / `.modified_by`                       | step 4 (state fan-out)                  |
| `evt:` | `events[].published_by` / `.consumed_by`                    | step 4 (state fan-out)                  |
| `ir:`  | `impact_rules[].trigger.responsibility_id`                   | step 7 (rules)                          |
| `srp:` | `functions[].srp_status` of `fn:`                            | step 5 (shared-code exposure)           |

Use `-` for an empty field. Keep every line on one physical line — the index is grepped, and a wrapped line breaks the match.

---

````markdown
# Map of Functions — <SYSTEM_NAME>

> Consult this document before creating, modifying, or refactoring code.
> Start at `impact_index` — it carries the whole blast-radius traversal.
> Open a Responsibility's full block only once it is inside the computed radius.

## Metadata

```yaml
mof_meta:
  system_name: "<NAME>"
  purpose: "<1-2 sentences>"
  version: "0.1.0"
  last_updated: "YYYY-MM-DDTHH:MM:SSZ" # Query compares commit timestamps; Map must update it
  last_commit: "<full-or-short-git-commit>" # Query compares this with the latest relevant code commit
  freshness: "fresh | stale | unverified" # Derived per seed during Query; never hand-edit as evidence
  domains: ["<DOMAIN_1>", "<DOMAIN_2>"] # stable display order
```

When the map is split, this root file is the global source for the complete `impact_index`, cross-domain relationships and impact rules, cross-cutting rules, open questions, and revision history. Domain files own their local Responsibilities, Functions, Entities, Events, and intra-domain Relationships. A Responsibility must appear in exactly one file.

## Impact Index

```yaml
# Derived projection — regenerate from the sections below, never hand-edit alone.
# Format and field sources: see mof-template.md § The impact_index line format.
impact_index:
  - "RESP_BILLING_004 | fn:F_BILLING_003 | src/billing/approve.py:approve_invoice | dom:BILLING | dep:RESP_BILLING_001 | exp:RESP_API_007,RESP_WORKER_002 | ent:Invoice(w),Customer(r) | evt:+EVT_004 -EVT_002 | ir:IR_004 | srp:violation"
```

## Responsibilities

```yaml
responsibilities:
  - id: "RESP_<DOMAIN>_<NNN>"
    name: "<VERB + OBJECT, one reason to change, e.g. Authorize invoice approval>"
    domain: "<DOMAIN>"
    status: "unverified | verified"
    non_responsibilities:
      - "<What it explicitly does NOT do. E.g. authorizes the approval, but does NOT send the notification>"
    interfaces:
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

Edges are not repeated here — they live in `relationships[]` and reach Query through `impact_index`. Events are not repeated here either; `events[]` owns them.

## Functions

```yaml
# Derived grouping — regenerate domain and srp_status from responsibilities[]
# below, never hand-edit either alone. domain must equal the domain shared by
# every listed Responsibility; if they disagree, the code artifact spans two
# domains and that disagreement belongs in open_questions, not a silent pick.
functions:
  - id: "F_<DOMAIN>_<NNN>"
    name: "<short label for the code artifact, e.g. approve_invoice>"
    domain: "<DOMAIN>"
    code_ref: "<real file/class/method, e.g. src/billing/approve.py:approve_invoice>"
    responsibilities: ["RESP_<ID>"] # one entry = srp_status ok, two or more = violation
    srp_status: "ok | violation"
```

## Entities

```yaml
# Query step 4 reads this: a writer's behavior change breaks its readers
# even with no call edge between them.
entities:
  - name: "<Entity, e.g. Invoice>"
    owner_domain: "<DOMAIN>"
    read_by: ["RESP_<ID>"]
    modified_by: ["RESP_<ID>"]
```

## Events

```yaml
# Events are facts in the past: "Invoice Approved", never "Approve Invoice".
# Query step 4 reads consumed_by: loose coupling still transmits breakage.
events:
  - id: "EVT_<NNN>"
    name: "<Fact that happened>"
    published_by: ["RESP_<ID>"]
    consumed_by: ["RESP_<ID>"]
```

## Workflows

```yaml
# Query step 6 reads this: a change can be locally correct and still
# break the end-to-end contract of a flow the Responsibility participates in.
workflows:
  - id: "W_<NNN>"
    name: "<Flow name>"
    starts_at: "RESP_<ID>"
    ends_at: "RESP_<ID>"
    sequence: ["RESP_<ID>", "RESP_<ID>", "RESP_<ID>"]
```

## Relationships

```yaml
# Source of truth for every edge. impact_index projects dep:/exp: from here.
relationships:
  - id: "R_<NNN>"
    from: "RESP_<SOURCE_ID>"
    to: "RESP_<TARGET_ID>"
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
      responsibility_id: "RESP_<ID>"
      change: "<signature | behavior | contract | business rule>"
    affected_direct: ["RESP_<ID>"]
    affected_indirect: ["RESP_<ID>"]
    impact_type: "breaking | non_breaking | behavioral"
    risk: "high | medium | low"
    recommended_actions:
      - "<concrete action: update tests X, review contract Y, create ADR>"
```

## Cross-Cutting Rules

```yaml
# Query step 8 reads this. Scope each rule to the Responsibilities it binds,
# so a query can tell which apply without reading the prose.
cross_cutting:
  - rule: "<e.g. every write Responsibility requires an admin token>"
    kind: "auth | transaction | error_handling | retry"
    applies_to: ["RESP_<ID>"] # or "<DOMAIN>" for a whole domain
```

## Open Questions

```yaml
# Also the home for concepts discovery could not classify — there is no
# permanent inventory section.
open_questions:
  - question: "<doubt the code doesn't answer>"
    context: "related RESP_<ID>, F_<ID> or W_<ID>"
```

## Revision History

| Version | Date       | Commit   | Author | Changes          |
| ------- | ---------- | -------- | ------ | ---------------- |
| 0.1.0   | YYYY-MM-DD | `<sha7>` | <NAME> | Initial creation |
````
