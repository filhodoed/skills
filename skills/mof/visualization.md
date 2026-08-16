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
| `{{ROWS_FUNCTIONS}}` | one row per `functions[]` entry |
| `{{ROWS_RELATIONSHIPS}}` | one row per `relationships[]` entry, including both domains |
| `{{ROWS_IMPACT}}` | one row per `impact_rules[]` entry, ordered by risk |
| `{{ROWS_QUESTIONS}}` | one row per `open_questions[]` entry |

## Relationship table

The relationship table is the primary technical view. It must show source domain, source Responsibility, relationship type, destination domain, destination Responsibility, coupling, channel, criticality, and description. Preserve unresolved identifiers and mark them as unresolved; never silently omit an edge.

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
- no unresolved `{{...}}` markers remain.

If any check fails, the report was not regenerated from the current `mof-shell.html`; regenerate it before reporting success.

## Human-oriented behavior

The report is optimized for quick technical consultation, local search, filter chips, responsive viewport use, and printing to PDF. The Functions table supports risk, SRP, repeated-file, and domain filters; the Relationships table supports domain, direction, coupling, channel, and criticality filters; the Impact Rules table supports risk, impact type, and domain filters. Tables wrap on medium viewports and become labeled stacked cards on narrow viewports, while the footer explains the MoF abbreviations used in the report. It is not part of the agent's Query flow and does not replace the Impact Index.
