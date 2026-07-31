---
name: mof
description: Map of Functions (MoF) — map the functions, responsibilities, relationships, and blast radius of a system, and consult that map before any code change. Use this skill whenever the user asks to create, update, or consult a MoF; map an existing project or codebase; assess the impact of a change, refactor, or fix; understand dependencies between functions, modules, or services; generate a diagram, visual map, or HTML view of the MoF; or mentions terms like "blast radius", "impact radius", "function map", "what breaks if I change this", "MoF diagram", "visualize the MoF". Also use it proactively before implementing changes in projects that already have a MOF.md file.
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

Produces `docs/MOF.html`, next to `docs/MOF.md` (if the MoF is split by domain — see § When to split by domain — aggregate every `docs/mof/<domain>.md` into a single HTML; never generate one HTML per domain). There is no parser: you (the agent) already read the MoF's YAML, so you write the Mermaid graph and the HTML tables directly from what you read.

### YAML → diagram translation rules

1. **Domains → `subgraph`.** One `subgraph D<N>["<domain>"]` per unique value of `functions[].domain`, `N` = the domain's position in `mof_meta.domains` (1-based, stable order). Color each subgraph with the categorical slot matching its position — see § Palette below. Past 8 domains, the extras get no color tint (just the subgraph, no `style`) — the categorical palette validates up to 8 slots, don't invent color beyond that.
2. **Functions → nodes.** One node per function inside its domain's subgraph: `F_ID["<name>"]`. Never invent a function that isn't in the MoF.
3. **Relationships → edges.** For each `relationships[]`: `from -->|type| to` if `coupling: tight`, `from -.->|type| to` if `coupling: loose`. The edge label is the `type` (calls, publishes, ...); `channel` and `criticality` stay out of the diagram (would clutter it) — whoever wants that detail checks `docs/MOF.md`.
4. **Impact rules → trigger node color.** For each `impact_rules[]`, apply `class <trigger.function_id> highRisk` if `risk: high` (the "critical" color), `class <trigger.function_id> mediumRisk` if `risk: medium` (the "serious" color) — see § Palette. `risk: low` and functions with no impact rule stay unclassed (the node's default style). A function only gets colored by its own risk of being changed — the blast radius (who's affected) already shows up through the graph's edges, no need to duplicate it in color.
5. **Click → scroll.** For every function, generate `click F_ID call focusRow("F_ID")`, which scrolls to and highlights the matching row in the Functions table (the template's `focusRow` JS function). Use `scrollIntoView({ behavior: 'auto', ... })` (instant), never `'smooth'` — the smooth animation depends on frames that a throttled background tab may never deliver, making the click look stuck. For the same reason, the "↑ Diagram" footer link is a plain native anchor (`href="#diagram-top"`), with no `scroll-behavior: smooth` in the CSS.
6. Large graphs: the diagram sits inside a container with `overflow: auto` — don't try to fit everything on screen, let it scroll.
7. **Return to the diagram.** Every `docs/MOF.html` has a fixed link `<a href="#diagram-top" class="back-to-diagram">↑ Diagram</a>` (fixed position, bottom-right corner) and an `id="diagram-top"` on the `<h1>` — after clicking a node and landing in the table, the user always has a way back without scrolling manually.

### Palette

Colors come from the `dataviz` skill's validated palette (categorical for domain identity, status for risk) — never pick hex off the top of your head; if you swap reference skills, run its validator before using new colors.

Domain = identity → categorical palette, the first slots in fixed order (never cycle, never skip):

| N | hue | light | dark |
|---|-----|-------|------|
| 1 | blue | `#2a78d6` | `#3987e5` |
| 2 | orange | `#eb6834` | `#d95926` |
| 3 | aqua | `#1baf7a` | `#199e70` |
| 4 | yellow | `#eda100` | `#c98500` |
| 5 | magenta | `#e87ba4` | `#d55181` |
| 6 | green | `#008300` | `#008300` |
| 7 | violet | `#4a3aa7` | `#9085e9` |
| 8 | red | `#e34948` | `#e66767` |

Risk = state → status palette (same hex in both modes): high = critical `#d03b3b`, medium = serious `#ec835a`, low = warning `#fab219`. Status never appears by color alone — always with the text ("high"/"medium"/"low"/"—") next to the dot, in tables and in the legend.

**The diagram card (`.diagram`) always stays on a fixed light surface** (`#fcfcfb`), even with the page in dark mode — recoloring the Mermaid SVG live via CSS vars isn't reliable across browsers; a fixed-contrast card is the standard for embedded diagrams. That's why every `classDef`/`style`/`linkStyle` in the Mermaid block uses a literal (light) hex, never `var(--...)`. Only the rest of the page (background, headings, tables, legend) responds to `prefers-color-scheme` via CSS custom properties.

**Diagram text: `theme: 'base'` + `themeVariables` in `mermaid.initialize`, not just CSS.** Page CSS trying to override `.nodeLabel`/`.edgeLabel`/`.cluster-label` loses to Mermaid's default theme (which already ships with `!important` baked in) — the reliable way to guarantee dark text is to pass the colors via `themeVariables` (`primaryTextColor`, `textColor`, `lineColor`, `edgeLabelBackground`, `clusterBkg`, `clusterBorder`), which Mermaid itself applies with guaranteed priority. Keep the CSS rules as reinforcement, but don't depend on them alone. Add `font-weight: 500` on the labels — small text at weight 400 reads as "gray" even when the hex is genuinely dark.

**Subgraph tint: ~28% alpha (hex suffix `47`), never paler.** A too-light tint (e.g. `1f` ≈ 12%) leaves the domain color almost invisible against the light card — a "pastel effect" that makes it hard to tell where one domain ends and another begins. Node border and line (`classDef default` / `linkStyle default`) use `#52514e` (secondary ink), not `#898781` (muted) — muted is too light to outline a box sitting on top of a colored tint.

### `docs/MOF.html` template

````markdown
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Map of Functions — <SYSTEM_NAME></title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<style>
  :root {
    color-scheme: light;
    --surface-page: #f9f9f7; --surface-1: #fcfcfb;
    --text-primary: #0b0b0b; --text-secondary: #52514e; --text-muted: #898781;
    --border: rgba(11,11,11,0.10); --gridline: #e1e0d9;
    --risk-critical: #d03b3b; --risk-serious: #ec835a; --risk-warning: #fab219;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
      --surface-page: #0d0d0d; --surface-1: #1a1a19;
      --text-primary: #ffffff; --text-secondary: #c3c2b7; --text-muted: #898781;
      --border: rgba(255,255,255,0.10); --gridline: #2c2c2a;
    }
  }
  body { font-family: system-ui, sans-serif; margin: 2rem; max-width: 1300px; margin-inline: auto; background: var(--surface-page); color: var(--text-primary); }
  h1, h2 { color: var(--text-primary); }
  p { color: var(--text-secondary); }
  /* Diagram card always stays light — see § Palette above. */
  .diagram { overflow: auto; border: 1px solid rgba(11,11,11,0.10); background: #fcfcfb; border-radius: 8px; padding: 1rem; margin-block: 1.5rem; }
  /* table-layout:fixed + overflow-wrap are mandatory: without them, a cell with a long
     unbreakable string (an ID list, say) forces the table past 100% and wider than the
     rest of the document — table-layout:auto (HTML's default) honors each column's
     minimum content width before the declared width. */
  table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-block: 1rem; background: var(--surface-1); }
  th, td { text-align: left; padding: .4rem .6rem; border-bottom: 1px solid var(--gridline); font-size: .9rem; vertical-align: top; color: var(--text-primary); overflow-wrap: anywhere; }
  th { position: sticky; top: 0; background: var(--surface-1); color: var(--text-secondary); }
  tr.highlight { outline: 2px solid #2a78d6; }
  .legend span { display: inline-flex; align-items: center; gap: .3rem; margin-right: 1rem; font-size: .85rem; color: var(--text-secondary); }
  .dot { width: .7rem; height: .7rem; border-radius: 50%; display: inline-block; }
  .mermaid .edgeLabel { color: #0b0b0b; fill: #0b0b0b; background: #fcfcfb; font-weight: 500; }
  .mermaid .cluster-label, .mermaid .nodeLabel { color: #0b0b0b; fill: #0b0b0b; font-weight: 500; }
  .mermaid text { fill: #0b0b0b; }
  .back-to-diagram {
    position: fixed; bottom: 1.5rem; right: 1.5rem;
    background: var(--surface-1); color: var(--text-primary);
    border: 1px solid var(--border); border-radius: 999px;
    padding: .55rem 1.1rem; font-size: .85rem; text-decoration: none;
    box-shadow: 0 2px 10px rgba(0,0,0,.2);
  }
</style>
</head>
<body>
  <h1 id="diagram-top">Map of Functions — <SYSTEM_NAME></h1>
  <p><SYSTEM_PURPOSE></p>
  <div class="legend">
    <span><span class="dot" style="background:var(--risk-critical)"></span> high risk</span>
    <span><span class="dot" style="background:var(--risk-serious)"></span> medium risk</span>
    <span><span class="dot" style="background:var(--risk-warning)"></span> low risk</span>
    <span><span class="dot" style="background:var(--text-muted)"></span> no impact rule</span>
  </div>
  <a href="#diagram-top" class="back-to-diagram">↑ Diagram</a>
  <div class="diagram">
    <pre class="mermaid">
graph LR
  classDef default fill:#fcfcfb,stroke:#52514e,stroke-width:1.25px,color:#0b0b0b;
  classDef highRisk stroke:#d03b3b,stroke-width:3px;
  classDef mediumRisk stroke:#ec835a,stroke-width:2.5px;
  linkStyle default stroke:#52514e,stroke-width:1px;

<MERMAID_GRAPH_GENERATED_BY_THE_RULES_ABOVE>
<!-- subgraphs D1..Dn with the nodes; then class .../highRisk,mediumRisk; then style D1 fill:<light+suffix 47 (~28% alpha)>,stroke:<light>,color:#0b0b0b (one per domain, hex from the slot table — never paler than 47, turns pastel and disappears against the light card); then the click ...call focusRow(...) lines -->
    </pre>
  </div>

  <h2>Impact Rules</h2>
  <table id="impact-rules">
    <thead><tr><th>ID</th><th>Trigger</th><th>Change</th><th>Direct affected</th><th>Indirect affected</th><th>Risk</th><th>Recommended actions</th></tr></thead>
    <tbody>
      <!-- one <tr> per impact_rules[], sorted by risk desc -->
    </tbody>
  </table>

  <h2>Functions</h2>
  <table id="functions">
    <thead><tr><th>ID</th><th>Name</th><th>Domain</th><th>Risk</th><th>Responsibilities</th></tr></thead>
    <tbody>
      <!-- one <tr id="row-F_ID"> per functions[], responsibilities joined with "; ".
           Risk: <span class="dot" style="background:var(--risk-critical|--risk-serious|--risk-warning|--text-muted)"></span> high|medium|low|—
           based on the highest risk among impact_rules[] whose trigger.function_id is this function (none = "—"). -->
    </tbody>
  </table>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      theme: 'base',
      themeVariables: {
        fontFamily: 'system-ui, sans-serif',
        primaryColor: '#fcfcfb',
        primaryTextColor: '#0b0b0b',
        primaryBorderColor: '#52514e',
        lineColor: '#52514e',
        textColor: '#0b0b0b',
        edgeLabelBackground: '#fcfcfb',
        clusterBkg: '#fcfcfb',
        clusterBorder: '#52514e'
      }
    });
    function focusRow(id) {
      document.querySelectorAll('tr.highlight').forEach(el => el.classList.remove('highlight'));
      const row = document.getElementById('row-' + id);
      if (row) { row.classList.add('highlight'); row.scrollIntoView({ behavior: 'auto', block: 'center' }); }
    }
  </script>
</body>
</html>
```
````

### Open it for the user

After writing the file, open it automatically — never make the user go hunting for the path. Detect the OS and run the native command: `open docs/MOF.html` (macOS), `xdg-open docs/MOF.html` (Linux), `start "" docs/MOF.html` (Windows).

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

---

## Maturity criterion

The MoF is mature when it allows an agent to **understand → reason → plan → implement → validate → document** a change with minimal additional context, and when every function with side effects has at least one associated impact rule and `exposed_to` verified against the real code.
