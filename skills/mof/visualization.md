# MoF Visualization Contract

Visualize produces `docs/MOF.html`, a static technical workbench for human investigation. The Markdown MoF remains the only source of truth.

## Report contract

Copy [`mof-shell.html`](mof-shell.html) and replace every marker below with escaped values:

| Marker | Source |
| --- | --- |
| `{{TITLE}}` | `mof_meta.system_name` |
| `{{PURPOSE}}` | `mof_meta.purpose` |
| `{{META}}` | version, last update, and commit, plus a freshness state derived at generation time by Query step 2's rule — `mof_meta` stores no freshness verdict |
| `{{SUMMARY}}` | map counts and analytics cards |
| `{{FOCUS}}` | empty or active Function focus card |
| `{{DECISIONS}}` | B-screen decision cards, derived from the map — never sample text |
| `{{FOOTER}}` | complete EN-US identifier and status legend |
| `{{TABS}}` | C-screen evidence tab buttons, one per tab panel in the shell |
| `{{ROWS_DOMAINS}}` | domain projections |
| `{{ROWS_FUNCTIONS}}` | one Function row per `functions[]` entry |
| `{{ROWS_FUNCTIONS_CONTEXT}}` | informational Function rows for C, without selection controls |
| `{{ROWS_RELATIONSHIPS}}` | one relationship row per `relationships[]` entry |
| `{{ROWS_ENTITIES}}` | one row per entity |
| `{{ROWS_EVENTS}}` | one row per event |
| `{{ROWS_WORKFLOWS}}` | one row per workflow |
| `{{ROWS_IMPACT}}` | one row per impact rule, ordered by risk |
| `{{ROWS_CROSS_CUTTING}}` | one row per cross-cutting rule |
| `{{ROWS_RESPONSIBILITIES}}` | one row per `responsibilities[]` entry |
| `{{ROWS_QUESTIONS}}` | one row per `open_questions[]` entry |

## Row shape per table

Every row marker must emit exactly this many `<td>` cells, in this order — the shell's headers are fixed, and one missing cell shifts every value in the row under the wrong heading:

| Table | Cells | Order |
| --- | --- | --- |
| `functions` (`{{ROWS_FUNCTIONS}}`) | 7 | Action, Function, Domain, Responsibilities, SRP, OCP, Risk |
| `functions-context` (`{{ROWS_FUNCTIONS_CONTEXT}}`) | 8 | Function, Domain, Responsibilities, Role, Nature, SRP, OCP, Risk |
| `domains` (`{{ROWS_DOMAINS}}`) | 4 | Domain, Responsibilities, Functions, Maximum risk |
| `responsibilities` (`{{ROWS_RESPONSIBILITIES}}`) | 7 | ID, Responsibility, Domain, Function, Status, State, Side effects |
| `relationships` (`{{ROWS_RELATIONSHIPS}}`) | 11 | Source domain, Source, Relation, Target domain, Target, Target nature, Coupling, Channel, Criticality, Consumed interfaces, Details |
| `entities` (`{{ROWS_ENTITIES}}`) | 4 | Entity, Owner domain, Read by, Modified by |
| `events` (`{{ROWS_EVENTS}}`) | 4 | Event, Name, Published by, Consumed by |
| `workflows` (`{{ROWS_WORKFLOWS}}`) | 5 | ID, Workflow, Start, End, Sequence |
| `impact` (`{{ROWS_IMPACT}}`) | 7 | ID, Domain, Trigger, Change, Risk, Affected, Recommended action |
| `cross-cutting` (`{{ROWS_CROSS_CUTTING}}`) | 3 | Rule, Type, Applies to |
| `questions` (`{{ROWS_QUESTIONS}}`) | 2 | Question, Context |

Sorting on screen A reads cells by index, so a row with the wrong cell count also sorts the wrong column. `Action` is the selection-control cell.

Function rows must expose an explicit selection control with `data-function-focus`, `data-focus-id`, optional escaped `data-focus-label` and `data-focus-description`, and a space-separated `data-refs` value. `data-refs` is matched token by token, never as a substring, so every identifier in it must be whole and separated by spaces. Responsibilities, entities, events, workflows, relationships, impact rules, and shared rules are informational rows, not selection controls. Preserve unresolved identifiers and mark them as unresolved.

`{{DECISIONS}}` emits three `<article class="decision-card">` blocks describing the **selected context**, every value read from the map — the shell ships no fallback copy, so whatever is emitted here is what the reader believes:

| Card | Content | Drilldown |
| --- | --- | --- |
| Primary risk | highest `risk` and `impact_type` among the impact rules in context, and which rule carries it | `data-drill="impact"` |
| Reach | how many domains the context crosses, naming them | `data-drill="relationships"` |
| Artifact quality | `srp_status` and `ocp_status` of the Function in context, as two `.status` pills | `data-drill="cross-cutting"` |

Each card's drilldown is a `<button class="button" type="button" data-drill="<panel>">` whose `<panel>` is a `data-tab-panel` value; the shell wires it to open that tab on screen C. With no Function selected, describe the whole map rather than inventing a context.

Each `{{TABS}}` button must carry `type="button"`, `class="tab"`, `role="tab"`, `id="tab-<panel>"`, `data-tab="<panel>"`, and `aria-controls="<panel>"`, where `<panel>` is the `data-tab-panel` value of the shell section it reveals (`domains`, `relationships`, `entities`, `events`, `workflows`, `impact`, `cross-cutting`). The shell's panels already point back with `aria-labelledby="tab-<panel>"`, so a missing or misspelled `id` breaks the pairing. The shell's script owns `class="active"`, `aria-selected`, and `tabindex` on these buttons — emit them without those three and let it drive the state.

## A/B/C behavior

- **A — Select context** shows the Function catalog, four analytics cards, and the focus card. The table supports explicit Select/Deselect controls and sorting by visible columns. The shell fills the `#function-results` live region and the selected state of each control; leave both empty in generated markup.
- **B — Decision overview** shows the selected context, decision cards, and drilldown controls. It does not show a Functions selection chip.
- **C — Full context** shows domains, Responsibilities, technical relationships, entities, events, workflows, impact rules, shared rules, and open questions as tab panels, plus the Functions context table below them. An active Function filters rows through `data-refs`; no active Function shows the complete map.
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
- tables for Domains, Functions, Responsibilities, Relationships, Entities, Events, Workflows, Impact Rules, Shared Rules, and Open Questions;
- `scope="col"` in every table header;
- one `{{TABS}}` button per `data-tab-panel` section, each with a matching `data-tab` and `id="tab-<panel>"`;
- the complete footer legend for identifiers, evidence states, focus states, SRP, OCP, artifact nature (concrete/abstract), risk, change type, coupling, criticality, and relationship types (including `implements`/`extends`);
- no external `<script src>`, CDN, Mermaid, network URL, or unresolved `{{...}}` marker;
- all generated values escaped before insertion.

Run the structural shell regression:

```bash
node skills/mof/test-mof-shell.mjs
```

The report is an optional projection for people. It does not replace Query or the global `impact_index`.
