# Mode D — Visualization

Disclosed from Mode D of the `mof` skill. Produces `docs/MOF.html`, next to `docs/MOF.md` (if the MoF is split by domain — see § When to split by domain in `SKILL.md` — aggregate every `docs/mof/<domain>.md` into a single HTML; never generate one HTML per domain). There is no parser: you (the agent) already read the MoF's YAML, so you write the Mermaid graph and the HTML tables directly from what you read.

## YAML → diagram translation rules

1. **Domains → `subgraph`.** One `subgraph D<N>["<domain>"]` per unique value of `functions[].domain`, `N` = the domain's position in `mof_meta.domains` (1-based, stable order). Color each subgraph with the categorical slot matching its position — see § Palette below. Past 8 domains, the extras get no color tint (just the subgraph, no `style`) — the categorical palette covers up to 8 slots, don't invent color beyond that.
2. **Functions → nodes.** One node per function inside its domain's subgraph: `F_ID["<name>"]`. Never invent a function that isn't in the MoF.
3. **Relationships → edges.** For each `relationships[]`: `from -->|type| to` if `coupling: tight`, `from -.->|type| to` if `coupling: loose`. The edge label is the `type` (calls, publishes, ...); `channel` and `criticality` stay out of the diagram (would clutter it) — whoever wants that detail checks `docs/MOF.md`.
4. **Impact rules → trigger node color.** For each `impact_rules[]`, apply `class <trigger.function_id> highRisk` if `risk: high` (the "critical" color), `class <trigger.function_id> mediumRisk` if `risk: medium` (the "serious" color) — see § Palette. `risk: low` and functions with no impact rule stay unclassed (the node's default style). A function only gets colored by its own risk of being changed — the blast radius (who's affected) already shows up through the graph's edges, no need to duplicate it in color.
5. **Click → scroll.** For every function, generate `click F_ID call focusRow("F_ID")`, which scrolls to and highlights the matching row in the Functions table (the template's `focusRow` JS function). Use `scrollIntoView({ behavior: 'auto', ... })` (instant), never `'smooth'` — the smooth animation depends on frames that a throttled background tab may never deliver, making the click look stuck. For the same reason, the "↑ Diagram" footer link is a plain native anchor (`href="#diagram-top"`), with no `scroll-behavior: smooth` in the CSS.
6. Large graphs: the diagram sits inside a container with `overflow: auto` — don't try to fit everything on screen, let it scroll.
7. **Return to the diagram.** Every `docs/MOF.html` has a fixed link `<a href="#diagram-top" class="back-to-diagram">↑ Diagram</a>` (fixed position, bottom-right corner) and an `id="diagram-top"` on the `<h1>` — after clicking a node and landing in the table, the user always has a way back without scrolling manually.

## Palette

The `mof` skill's own palette, with no dependency on another skill — this table is the single source of truth. When extending past the 8 categorical slots: pick a hue visibly distinct from the 8 already in use (not a lightness variant of an existing hue) and keep the same lightness/saturation range as the table below (neither more pastel nor more saturated), so it doesn't clash with the neighboring slots.

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

## `docs/MOF.html` template

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

## Open it for the user

After writing the file, open it automatically. Detect the OS and run the native command: `open docs/MOF.html` (macOS), `xdg-open docs/MOF.html` (Linux), `start "" docs/MOF.html` (Windows).
