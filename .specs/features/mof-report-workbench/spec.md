# MoF Report Workbench Specification

## Problem Statement

The current MoF report treats every linked identifier as a selectable focus, which makes a large report difficult to navigate and causes the focus field to select broad page content. The report also uses a split external-style shell and mixed-language labels, while the skill requires a portable EN-US artifact with no runtime dependency.

## Goals

- [ ] Make Function the only selectable investigation context.
- [ ] Provide a continuous A → B → C flow for selection, decision overview, and evidence drilldown.
- [ ] Keep the generated report as one self-contained HTML file with inline CSS and JavaScript.
- [ ] Define domain-split MoF ownership while keeping global projections in the root document.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Network loading, CDN assets, Mermaid, or server APIs | The report must work offline as one portable file. |
| Selecting Responsibilities, entities, events, workflows, or rules | Those records are evidence, not navigation context. |
| Automatic generation of domain files from arbitrary repositories | The skill documents the contract and split ownership; discovery remains evidence-driven. |
| Remote pull requests or pushes | This implementation is local only. |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Empty Function focus in screen C | Show the complete unfiltered map | It preserves discoverability and matches the approved flow. | yes |
| Screen B with no Function selected | Show global metrics and an explicit empty focus state | The report remains useful before selection. | yes |
| Search behavior | Filter on every input event and preserve focus | It fixes the reported focus loss and avoids an Enter-only flow. | yes |
| Status placement | Keep freshness status in the header metadata | It replaces the prototype-only chip without adding another control. | yes |
| Domain split threshold | Split by domain ownership, independently of line count | Ownership is the stable boundary; file size is only a supporting signal. | yes |

**Open questions:** none.

## User Stories

### P1: Select and persist a Function ⭐ MVP

**User Story**: As a developer, I want to select or deselect one Function so that its context remains stable while I move through the report.

**Acceptance Criteria**:

1. WHEN a Function selection control is activated THEN the report SHALL make that Function the active focus.
2. WHEN the active Function control is activated again THEN the report SHALL clear the active focus.
3. WHILE a Function is active THEN the report SHALL preserve that Function when moving between screens A, B, and C.
4. The report SHALL render non-Function identifiers as informational content without selection controls.

**Independent Test**: Select a Function in A, move to B and C, then deselect it from the Function table.

### P1: Navigate the A → B → C workbench ⭐ MVP

**User Story**: As a developer or manager, I want selection, overview, and drilldown screens so that I can move from context to decision to evidence.

**Acceptance Criteria**:

1. WHEN screen A is displayed THEN the report SHALL show the Function catalog, four analytics cards, and the focus card.
2. WHEN screen B is displayed THEN the report SHALL show decision cards and SHALL omit a Functions selection chip.
3. WHEN screen C is displayed with an active Function THEN the report SHALL filter domains, Functions, Responsibilities, technical relationships, entities, events, workflows, impact rules, and shared rules to the selected context.
4. WHEN screen C is displayed without an active Function THEN the report SHALL show all available records.
5. WHEN a decision drilldown control is activated THEN the report SHALL open screen C on the corresponding evidence tab without clearing the active Function.

**Independent Test**: Use the screen switcher and the three decision drilldowns with and without an active Function.

### P1: Search, sort, and explain the report ⭐ MVP

**User Story**: As a report reader, I want stable search, sortable Function columns, and a complete legend so that a large map remains understandable.

**Acceptance Criteria**:

1. WHEN text is entered in the global search THEN the report SHALL filter matching visible rows without removing focus from the search field.
2. WHEN the search clear control is activated THEN the report SHALL restore the current table rows and preserve the current screen and Function focus.
3. WHEN a Function table header is activated THEN the report SHALL sort by that column in ascending order, and a second activation SHALL reverse the order.
4. The report SHALL show a footer legend explaining identifiers, evidence states, focus states, SRP, risk, change type, coupling, criticality, and relationship types.
5. The generated report SHALL contain no external asset, third-party script, CDN reference, network call, or unresolved template marker.

**Independent Test**: Type, clear, sort, navigate, and inspect the final HTML for self-containment and legend coverage.

### P1: Preserve MoF source ownership ⭐ MVP

**User Story**: As a maintainer, I want a clear root/domain MoF contract so that global projections remain complete while domain facts have one home.

**Acceptance Criteria**:

1. The skill SHALL define domain files as the owners of local Responsibilities, Functions, Entities, Events, and intra-domain Relationships.
2. The skill SHALL define root `docs/MOF.md` as the owner of metadata, the complete `impact_index`, domain links, cross-domain relationships and rules, global rules, open questions, and revision history.
3. The skill SHALL require root and affected domain files to change together after a split-map change.
4. The skill SHALL define freshness evidence as scoped commit and timestamp evidence with `fresh`, `stale`, `unverified`, and `unresolved` meanings.

**Independent Test**: Inspect the template, operating instructions, visualization contract, and README for the same ownership and freshness rules.

## Edge Cases

- IF no Functions exist THEN the report SHALL show an explicit empty catalog and retain the global report structure.
- IF the search term matches no row THEN the report SHALL show zero visible matches without changing the active focus.
- IF a referenced record is unresolved THEN the report SHALL preserve its identifier and display its unresolved state.
- IF a generated value contains markup characters THEN the generator SHALL escape it before insertion into HTML.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| WORKBENCH-01 | P1: Select and persist a Function | PR2 | Verified |
| WORKBENCH-02 | P1: Navigate the A → B → C workbench | PR2 | Verified |
| WORKBENCH-03 | P1: Search, sort, and explain the report | PR2 | Verified |
| WORKBENCH-04 | P1: Preserve MoF source ownership | PR1 | Verified |

**Coverage:** 4 total, 4 mapped to tasks, 0 unmapped.

## Success Criteria

- [x] `node skills/mof/test-mof-shell.mjs` passes with the new interaction contract.
- [x] The shell is `lang="en-US"` and contains only inline CSS and JavaScript.
- [x] The MoF documentation consistently describes root ownership, domain ownership, and scoped freshness evidence.
