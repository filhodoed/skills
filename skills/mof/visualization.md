# MoF Visualization Contract

Visualize produces `docs/MOF.html`, a static technical workbench for human investigation. The Markdown MoF remains the only source of truth.

## Report contract

Copy [`mof-shell.html`](mof-shell.html) and replace every marker below with escaped values:

| Marker | Source |
| --- | --- |
| `{{TITLE}}` | `mof_meta.system_name` |
| `{{PURPOSE}}` | `mof_meta.purpose` |
| `{{META}}` | version, freshness, last update, and commit |
| `{{SUMMARY}}` | map counts and analytics cards |
| `{{FOCUS}}` | empty or active Function focus card |
| `{{FOOTER}}` | complete EN-US identifier and status legend |
| `{{TABS}}` | C-screen evidence tab buttons |
| `{{ROWS_DOMAINS}}` | domain projections |
| `{{ROWS_FUNCTIONS}}` | one Function row per `functions[]` entry |
| `{{ROWS_FUNCTIONS_CONTEXT}}` | informational Function rows for C, without selection controls |
| `{{ROWS_RELATIONSHIPS}}` | one relationship row per `relationships[]` entry |
| `{{ROWS_ENTITIES}}` | one row per entity |
| `{{ROWS_EVENTS}}` | one row per event |
| `{{ROWS_WORKFLOWS}}` | one row per workflow |
| `{{ROWS_IMPACT}}` | one row per impact rule, ordered by risk |
| `{{ROWS_CROSS_CUTTING}}` | one row per cross-cutting rule |
| `{{ROWS_QUESTIONS}}` | one row per open question, if exposed by the generator |

Function rows must expose an explicit selection control with `data-function-focus`, `data-focus-id`, optional escaped `data-focus-label` and `data-focus-description`, and a space-separated `data-refs` value. Responsibilities, entities, events, workflows, relationships, impact rules, and shared rules are informational rows, not selection controls. Preserve unresolved identifiers and mark them as unresolved.

## A/B/C behavior

- **A — Select context** shows the Function catalog, four analytics cards, and the focus card. The table supports explicit Select/Deselect controls and sorting by visible columns.
- **B — Decision overview** shows the selected context, decision cards, and drilldown controls. It does not show a Functions selection chip.
- **C — Full context** shows domains, Functions, Responsibilities, technical relationships, entities, events, workflows, impact rules, and shared rules. An active Function filters rows through `data-refs`; no active Function shows the complete map.
- Function focus persists across A, B, and C. `Clear Selection` is the only selection-reset control and appears in each screen header.
- Global search filters on each input event without replacing the input or losing focus. Clearing the native search control restores rows without clearing Function focus or screen state.

## Safety and portability

- Use one HTML file with inline CSS and JavaScript only.
- Do not load Mermaid, a CDN, a remote font, a server, or any network resource.
- Escape every MoF value before inserting it into markup or attributes.
- Do not insert untrusted MoF values into executable JavaScript.
- Empty collections render an explicit `—` or `No items recorded` row.
- Freshness, stale, verified, unverified, and unresolved states remain textual as well as visual.

## Generation validation

After writing `docs/MOF.html`, verify that the generated file contains:

- `lang="en-US"`, the A/B/C screen markers, `global-search`, `focus-context`, and `data-function-focus`;
- tables for Domains, Functions, Relationships, Entities, Events, Workflows, Impact Rules, and Shared Rules;
- `scope="col"` in every table header;
- the complete footer legend for identifiers, evidence states, focus states, SRP, risk, change type, coupling, criticality, and relationship types;
- no external `<script src>`, CDN, Mermaid, network URL, or unresolved `{{...}}` marker;
- all generated values escaped before insertion.

Run the structural shell regression:

```bash
node skills/mof/test-mof-shell.mjs
```

The report is an optional projection for people. It does not replace Query or the global `impact_index`.
