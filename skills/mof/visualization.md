# Visualize

Visualize produces `docs/MOF.html`, a static technical report for human review. It is an optional projection of `docs/MOF.md`; the Markdown MoF remains the only source of truth.

## Output sections

Fill the shell [`mof-shell.html`](mof-shell.html) by replacing these markers:

| Marker | Source |
| --- | --- |
| `{{TITLE}}` | `mof_meta.system_name` |
| `{{PURPOSE}}` | `mof_meta.purpose` |
| `{{META}}` | version, freshness, last update, and commit |
| `{{SUMMARY}}` | counts of domains, responsibilities, impact rules, and SRP violations |
| `{{ROWS_DOMAINS}}` | domain projections from responsibilities and functions |
| `{{ROWS_FUNCTIONS}}` | one `<tr data-file-ref="…">` per `functions[]` entry, with separate Function and File cells; `data-file-ref` is the escaped physical file path from `code_ref`, without class, method, or line suffixes, and drives the repeated-file filter |
| `{{ROWS_RELATIONSHIPS}}` | one row per `relationships[]` entry, including both domains; render Coupling and Criticality as `<span class="status">…</span>` chips, adding `critical`, `medium`, or `ok` when the value maps to those states |
| `{{ROWS_IMPACT}}` | one row per `impact_rules[]` entry, ordered by risk; render `impact_type` in the Change cell and `risk` in its own `<span class="status">…</span>` Risk cell (`high` = `critical`, `medium` = `medium`, `low` = `ok`) |
| `{{ROWS_QUESTIONS}}` | one row per `open_questions[]` entry |

## Relationship table

The relationship table is the primary technical view. It must show source domain, source Responsibility, relationship type, destination domain, destination Responsibility, coupling, channel, criticality, and description. Coupling and criticality use the shared `status` chip; criticality adds the matching semantic color class when available. Preserve unresolved identifiers and mark them as unresolved; never silently omit an edge.

## Safety and portability

- The generated report uses only HTML, CSS, and small local JavaScript.
- Do not load Mermaid, a CDN, a remote font, a server, or any network resource.
- Escape every value from `docs/MOF.md` before inserting it into HTML attributes or markup.
- Prefer text nodes or escaped strings; never insert untrusted MoF values as executable JavaScript.
- Keep `docs/MOF.md` as the source of truth and regenerate the report when the map changes.
- Empty collections render an explicit `—` or `No items recorded` row.

## Generation validation

After writing `docs/MOF.html`, verify that the generated file contains the current shell contract before presenting it to the professional:

- `id="function-filters"`, `id="relationship-filters"`, and `id="impact-filters"`;
- `class="legend"` and the abbreviation entries `SRP`, `F_`, `RESP_`, and `IR_`;
- the responsive media rules, including `max-width:700px` and the stacked-card selectors;
- `data-file-ref` in each Functions-table row;
- `status` chips in the Coupling and Criticality cells of each Relationships-table row;
- a dedicated Risk cell, after Change, in each Impact Rules-table row;
- `scope="col"` in every table header and live result-status elements for every filtered table;
- no unresolved `{{...}}` markers remain.

If any check fails, the report was not regenerated from the current `mof-shell.html`; regenerate it before reporting success.

## Human-oriented behavior

The report occupies the available viewport, with horizontal table scrolling only when required before the narrow-screen card layout. Filter, status, coupling, criticality, and risk chips remain on one line. Status chips are rounded. In Impact Rules, ID and Change values do not wrap. The table separates change type from risk, while retaining filters for both values. Relationship search and filtering compose, every filter reads only its dedicated table column, and result counts are announced after interaction. The Functions table supports risk, SRP, repeated-file, and domain filters; the Relationships table supports domain, direction, type, and criticality filters. The repeated-file filter compares the generated physical-file `data-file-ref`, never rendered text. The footer explains the MoF abbreviations used in the report. It is not part of the agent's Query flow and does not replace the Impact Index.
