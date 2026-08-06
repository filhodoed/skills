# Mode D — Visualization

Disclosed from Mode D of the `mof` skill. Produces `docs/MOF.html` next to `docs/MOF.md`. If the MoF is split by domain (see § When to split by domain in `SKILL.md`), aggregate every `docs/mof/<domain>.md` into a single HTML — never one HTML per domain.

There is no parser: you already read the MoF's YAML, so you write the Mermaid body and table rows directly from what you read.

## The page is a fixed asset

The page shell lives in [`mof-shell.html`](mof-shell.html). **Copy that file to `docs/MOF.html` and replace its five markers.** Do not retype the shell, do not restyle it per project, and do not inline your own CSS — the shell's choices (fixed light diagram card, `themeVariables` over page CSS, `table-layout: fixed`, instant scrolling) each fix a real failure and are documented at the point of use inside it.

| Marker              | Replace with                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `{{TITLE}}`         | `mof_meta.system_name` (appears twice — `<title>` and `<h1>`)       |
| `{{PURPOSE}}`       | `mof_meta.purpose`                                                  |
| `{{MERMAID}}`       | the graph body built by the rules below                             |
| `{{ROWS_IMPACT}}`   | one `<tr>` per `impact_rules[]`, ordered by risk descending          |
| `{{ROWS_FUNCTIONS}}`| one `<tr id="row-F_ID">` per `functions[]`                          |

The shell already carries `graph LR`, the `classDef` lines, and `linkStyle default` — `{{MERMAID}}` is only the body: subgraphs with their nodes, then the `class` assignments, then the `style` lines, then the `click` handlers.

**Row shapes.** Functions table: ID, name, domain, risk, responsibilities joined with `"; "`. Risk cell is `<span class="dot" style="background:var(--risk-critical|--risk-serious|--risk-warning|--text-muted)"></span>` plus the word `high|medium|low|—`, taken from the highest `risk` among the `impact_rules[]` whose `trigger.function_id` is this function (none → `—`). Status never appears as color alone — the word always sits beside the dot, in tables and in the legend.

**Pinned dependency.** The shell loads Mermaid from jsDelivr at an exact version, not a floating major. Keep it pinned: a floating `@11` means a future Mermaid release can silently change every already-generated `MOF.html`. The page therefore needs network access on first load — that is the one external dependency, and it is deliberate: vendoring ~3 MB of JavaScript into a skills repo would tax every install to serve the offline case.

## YAML → diagram translation rules

1. **Domains → `subgraph`.** One `subgraph D<N>["<domain>"]` per unique `functions[].domain`, where `N` is the domain's position in `mof_meta.domains` (1-based, stable order). Tint each subgraph with the categorical slot matching its position — see § Palette. Past 8 domains, the extras get no tint (just the subgraph, no `style`) — the categorical palette covers 8 slots; do not invent a 9th color.
2. **Functions → nodes.** One node per function inside its domain's subgraph: `F_ID["<name>"]`. Never invent a function that is not in the MoF.
3. **Relationships → edges.** For each `relationships[]`: `from -->|type| to` when `coupling: tight`, `from -.->|type| to` when `coupling: loose`. The edge label is the `type` (calls, publishes, …); `channel` and `criticality` stay out of the diagram — it would clutter, and anyone needing that detail reads `docs/MOF.md`.
4. **Impact rules → trigger node color.** For each `impact_rules[]`, emit `class <trigger.function_id> highRisk` when `risk: high`, `class <trigger.function_id> mediumRisk` when `risk: medium`. `risk: low` and functions with no impact rule get no class (the node's default style). A node is colored by the risk of changing it — the blast radius is already visible in the edges, so don't duplicate it in color.
5. **Click → scroll.** For each function, emit `click F_ID call focusRow("F_ID")`; `focusRow` is defined in the shell and scrolls to and highlights the matching Functions row.
6. **Large graphs** scroll inside the diagram's `overflow: auto` container — do not try to fit everything on screen.

## Palette

This skill's own palette; this table is the single source. Extending past the 8 categorical slots: pick a hue visibly distinct from the 8 in use (not a lightness variation of an existing hue) and keep the same luminosity/saturation range as the table below — neither more pastel nor more saturated — so it doesn't clash with its neighbors.

Domain = identity → categorical palette, first slots in fixed order (never cycle, never skip):

| N   | hue     | light     | dark      |
| --- | ------- | --------- | --------- |
| 1   | blue    | `#2a78d6` | `#3987e5` |
| 2   | orange  | `#eb6834` | `#d95926` |
| 3   | aqua    | `#1baf7a` | `#199e70` |
| 4   | yellow  | `#eda100` | `#c98500` |
| 5   | magenta | `#e87ba4` | `#d55181` |
| 6   | green   | `#008300` | `#008300` |
| 7   | violet  | `#4a3aa7` | `#9085e9` |
| 8   | red     | `#e34948` | `#e66767` |

Risk = state → status palette (same hex in both modes): high = critical `#d03b3b`, medium = serious `#ec835a`, low = warning `#fab219`.

**Every `classDef` / `style` / `linkStyle` in the Mermaid body uses literal light-mode hex, never `var(--...)`** — the diagram card is a fixed light surface, so CSS variables there would resolve against the wrong theme.

**Subgraph tint: ~28% alpha (hex suffix `47`), never paler.** A paler tint (e.g. `1f` ≈ 12%) makes the domain color nearly invisible against the light card, so domain boundaries blur. Node borders and links use `#52514e` (secondary ink), not `#898781` (muted) — muted is too light to outline a box sitting on a colored tint.

Per-domain style line: `style D<N> fill:<light hex + 47>,stroke:<light hex>,color:#0b0b0b`.

## Open it for the user

After writing the file, open it automatically. Detect the OS and run the native command: `open docs/MOF.html` (macOS), `xdg-open docs/MOF.html` (Linux), `start "" docs/MOF.html` (Windows).
