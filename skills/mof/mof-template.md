# `docs/MOF.md` document template

Disclosed from Mode A (Bootstrap) and Mode C (Maintenance) of the `mof` skill. Use exactly this structure — YAML blocks keep it readable by humans and parseable by agents.

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
  - id: "F_<DOMAIN>_<NNN>"
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
      events_published: ["EVT_<NNN>"]
      events_consumed: ["EVT_<NNN>"]
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
  - id: "EVT_<NNN>"
    name: "<Fact that happened>"
    published_by: ["F_<ID>"]
    consumed_by: ["F_<ID>"]
```

## Workflows

```yaml
workflows:
  - id: "W_<NNN>"
    name: "<Flow name>"
    starts_at: "F_<ID>"
    ends_at: "F_<ID>"
    sequence: ["F_<ID>", "F_<ID>", "F_<ID>"]
```

## Relationships

```yaml
relationships:
  - id: "R_<NNN>"
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

| Version | Date       | Commit   | Author | Changes          |
| ------- | ---------- | -------- | ------ | ---------------- |
| 0.1.0   | YYYY-MM-DD | `<sha7>` | <NAME> | Initial creation |
````
