# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `mof`: evidence-based freshness metadata with commit and timestamp support, deterministic Query evidence states, explicit split-map ownership, and a native HTML technical report with domain-aware relationship tables, local search, and print styles.
- Documentation for Claude Code, Codex, and Gemini CLI usage of the portable Agent Skills core.

### Removed

- Mermaid and CDN loading from the optional HTML report.

## [0.5.0] - 2026-08-08

### Changed

- `mof` skill: **`Responsibility` (`RESP_<DOMAIN>_<NNN>`) replaces `Function` as the atomic unit.** A Responsibility is a single verb-object capability with one reason to change; a `Function` now only groups the Responsibilities sharing a `code_ref`, carrying a computed `srp_status: ok | violation` — one Responsibility per Function is healthy, two or more is a Single Responsibility Principle violation, visible without a separate audit step. `relationships[]`, `entities[]`, `events[]`, `workflows[].sequence`, and `impact_rules[].trigger` all key on Responsibility ids now, not Function ids.
- `mof` skill: **five operating modes collapsed into three** — Map (merges the former Bootstrap and Maintenance modes, since both did the same discover/update work at different scope), Query (unchanged in spirit, now traverses Responsibilities and additionally flags shared-code exposure from `srp_status: violation` siblings), Visualize (absorbs the SOLID checkup — the Functions table's `srp_status` column and each violating Function's dashed-red subgraph border already are the audit; there is no separate report to generate).
- `skills/mof/visualization.md`: the Mermaid diagram nests Responsibility nodes inside a subgraph per Function; a Function with `srp_status: violation` gets a `⚠` in its subgraph label plus a dashed red border — the label is what keeps it from being mistaken for the existing risk-colored node borders, which reuse the same red.
- `skills/mof/mof-shell.html`: Functions table gains an SRP column; legend gains the violation swatch.

### Breaking

- Every existing `docs/MOF.md` written against the previous template is out of date: `functions[]` no longer carries `side_effects` or `state` directly (they moved onto the new `responsibilities[]`), and every id-bearing field elsewhere in the document now expects `RESP_` ids in place of `F_` ids. Run Map to decompose existing Functions into Responsibilities before the next Query.

## [0.4.0] - 2026-08-05

Impact queries got cheaper, and three real bugs came out with them. The document format changed to make that possible.

### Added

- `mof` skill: **Impact Index** — a one-line-per-function projection at the top of `docs/MOF.md` carrying everything a blast-radius traversal needs (domain, `code_ref`, upstream/downstream ids, entities touched with read/write marks, events published/consumed, impact-rule ids). Mode B now reads the index alone and opens a function's full block only once that function is inside the computed radius. It never splits when the map splits by domain, so a cross-domain traversal still costs one file read.
- `mof` skill: `skills/mof/mof-shell.html` — the Mode D page is now a fixed asset, copied and filled at five markers, instead of a template retyped out of `visualization.md` on every run. Mermaid is pinned to an exact version, so a future release can't silently change already-generated pages.
- `mof` skill: Mode B fans out through shared state — a function that *writes* an entity pulls in that entity's readers, and a function that *publishes* an event pulls in its consumers. These are impact paths the call graph cannot see, and they were previously recorded but never consulted.
- `mof` skill: Mode B checks affected workflows and cross-cutting rules explicitly, and reports the traversal depth it reached.
- `skills/mof/README.md`: a "Make it fire automatically" section — the reliable trigger is a line in the project's own `CLAUDE.md`, not the skill description, which can only ever be a hint.

### Fixed

- `mof` skill: Mode B's freshness check was unexecutable in the order it was written — it compared `last_updated` against `git log` over "touched paths" that only become known a step later. In practice that meant either skipping the check or running `git log` repo-wide, which reports stale after any commit anywhere and triggers a Mode A rebuild the task doesn't need. Locating the functions now comes first, and the check is scoped to their `code_ref` paths.
- `mof` skill: Mode C never updated `mof_meta.last_updated` — the exact field Mode B's freshness check reads. Every query distrusted maps that were actually current. Mode C now updates it, and `version` when the change is structural, as an explicit step.
- `mof` skill: **diagram labels were unreadable in dark mode** in every `docs/MOF.html` generated since 0.2.0. Mermaid 11 wraps each label in a `<p>` inside a `foreignObject`, so the page's generic `p { color: var(--text-secondary) }` rule painted diagram text in dark-mode secondary ink over a card that deliberately stays light. The `.nodeLabel`/`.cluster-label` overrides never reached it, because the `<p>` sits inside them. Regenerate any existing `MOF.html` to pick up the fix.
- `mof` skill: blast-radius traversal had no stop rule beyond "until exhausted", which in a dense graph converges on "the whole system is affected" — expensive to read and useless as an answer. Traversal is now bounded at depth 2, extended only along edges marked `criticality: critical`, and a radius that swallows most of the map is reported as a query to narrow rather than a result.

### Changed

- `mof` skill: every section of the document template now has a named consumer in Mode B, and that is a stated principle. `entities[]`, `events[]`, `workflows[]`, and the cross-cutting rules were previously written by Mode A and read by nothing; they now drive real steps of the impact query. `cross_cutting` gained `kind` and `applies_to` so a query can tell which rules bind a function without parsing prose.
- `mof` skill: the discovery inventory is session scratch and is no longer written to `docs/MOF.md`. It used to be paid for three times — written, superseded by `functions[]`, then re-read by every future query forever. Concepts that resist classification go to `open_questions` instead.
- `mof` skill: an edge is stored once, in `relationships[]`. It previously lived in three places — each endpoint's `boundaries`, plus the relationship record — with nothing keeping them in sync. `boundaries` is gone from function blocks and reaches Mode B through the index.
- `mof` skill: dropped `functions[].type` and `mof_meta.owners` / `external_dependencies` — taxonomy and metadata with no consumer in any mode.
- `mof` skill: the domain-split threshold moved from ~500 to ~800 lines. At the old template's verbosity, 500 lines was about 20 functions, so any real project fragmented almost immediately and paid extra file reads for it.
- `mof` skill: grepping the map instead of loading it whole is no longer conditional on the file being "large" — a size judgment the agent had no reason to resolve in favor of the cheaper path. It is now simply the flow.
- `mof` skill: trimmed the description again; "map an existing project or codebase" restated the create/update/consult branch.
- `skills/mof/README.md`: the copy-without-installing snippet fetches `mof-shell.html` too, loops over the file list instead of repeating `curl`, and runs in a subshell so it no longer leaves your shell inside `.claude/skills/mof`.

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
