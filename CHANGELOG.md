# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.0] - 2026-07-31

### Changed

- `mof` skill: trimmed the description's trigger list — several quoted phrases just restated branches already covered in plain language; collapsed to one mention per branch.
- `mof` skill: Mode D's translation rules, palette, and full HTML template moved out of `SKILL.md` into `visualization.md`; the `docs/MOF.md` document template moved into `mof-template.md`. Keeps `SKILL.md` short for the common case — Mode B (impact query, the skill's most frequent trigger) no longer pulls in ~300 lines of HTML/palette it never uses.
- `mof` skill: the color palette is now the skill's own, no longer sourced from the `dataviz` skill — drops an external dependency the skill had no reliable way to re-validate against.
- `skills/mof/README.md`: "Try it without installing the plugin" now fetches `mof-template.md` and `visualization.md` alongside `SKILL.md`, since the skill is no longer a single file.

## [0.2.0] - 2026-07-31

### Added

- Per-skill `README.md` (starting with `skills/mof/README.md`), so each skill documents itself in its own directory as more skills join the repo.
- `mof` skill: **Mode D — Visualization**, on request only. Turns the MoF's YAML into `docs/MOF.html`: a Mermaid graph grouped into one subgraph per domain, function nodes colored by risk where an impact rule triggers on them, and two reference tables (Impact Rules, Functions) below the diagram. Clicking a node scrolls to and highlights its table row; a fixed "↑ Diagram" button returns to the top. Opens automatically in the default browser once written.
  - Colors come from the `dataviz` skill's validated palette — categorical hues for domain identity, the status palette for risk — never picked by hand.
  - The diagram card is pinned to a fixed light surface regardless of the page's dark/light mode, since live-recoloring a Mermaid SVG via CSS variables isn't reliable across browsers.
  - Text color and weight are set through `mermaid.initialize`'s `theme`/`themeVariables`, not page CSS alone — Mermaid's own default theme otherwise wins with an `!important` page CSS can't beat.
  - All scrolling (click-to-table and the return button) is instant (`behavior: 'auto'`), not animated — smooth-scroll animations can silently stall in a throttled background tab.
  - Tables use `table-layout: fixed` and `overflow-wrap: anywhere` so a long unbroken string (an ID list, say) can't force the table wider than the rest of the page.

### Changed

- Root `README.md` is now a repo-purpose overview and skill index, linking out to each skill's own README instead of describing skills inline.
- `mof` skill:
  - Clarified that a MoF is not a navigation map (e.g. `docs/MOC.md`) — the two must stay decoupled.
  - Defined a collision-safe ID scheme: functions use `F_<DOMAIN>_<NNN>`, other item types use `<PREFIX>_<NNN>`; always grep for the next free number before assigning one.
  - Added a domain-split strategy for `docs/MOF.md` past ~500 lines (`docs/mof/<domain>.md` per domain, root file becomes an index).
  - Mode B now checks MoF freshness against the latest relevant commit before trusting it, skips the impact-query flow for purely cosmetic changes, and favors grepping the MoF over loading it whole when identifying a function.
  - Revision History template gained a `Commit` column.

## [0.1.0] - 2026-07-28

### Added

- `mof` skill: Map of Functions — models a system's functions, responsibilities, relationships, and blast radius so agents can plan changes with full context.
- Marketplace manifest (`.claude-plugin/plugin.json`) and repo scaffolding.
