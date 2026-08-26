# MoF Report Workbench Design

**Spec**: `.specs/features/mof-report-workbench/spec.md`
**Status**: Draft

## Architecture Overview

Use the existing fixed `skills/mof/mof-shell.html` as the generator contract and replace its presentation and interaction layer with the approved three-screen workbench. Generated rows remain server-free HTML projections from `docs/MOF.md`; inline JavaScript owns only navigation, Function focus, filtering, sorting, and accessibility announcements.

```text
docs/MOF.md + domain files
          ↓ generator markers
single docs/MOF.html
          ↓ inline state
A: Function selection → B: decision overview → C: evidence drilldown
```

## Code Reuse Analysis

| Component | Location | How to Use |
| --- | --- | --- |
| Fixed report shell | `skills/mof/mof-shell.html` | Preserve markers and extend the existing local behavior. |
| Shell regression test | `skills/mof/test-mof-shell.mjs` | Replace legacy localized assertions with EN-US and add approved state guarantees. |
| Visualization contract | `skills/mof/visualization.md` | Update generation markers, safety rules, and validation gates. |
| MoF document contract | `skills/mof/mof-template.md` | Add root/domain split ownership and keep `impact_index` global. |

## Components

### Root/domain MoF contract

- **Purpose**: Define one source home for local facts and one global source home for projections and cross-domain facts.
- **Location**: `skills/mof/SKILL.md`, `skills/mof/mof-template.md`, `skills/mof/README.md`
- **Dependencies**: Existing MoF identifiers and Query flow.
- **Reuses**: Existing `impact_index`, freshness, and revision-history rules.

### Single-file report workbench

- **Purpose**: Provide A/B/C navigation and Function-only focus in one generated HTML file.
- **Location**: `skills/mof/mof-shell.html`, `skills/mof/visualization.md`
- **Dependencies**: Existing generator markers and escaped MoF values.
- **Reuses**: Existing filter helpers, result announcements, row references, and IntersectionObserver navigation.

### Contract regression test

- **Purpose**: Detect broken shell markers, language, self-containment, focus, search, and filtering behavior.
- **Location**: `skills/mof/test-mof-shell.mjs`
- **Dependencies**: Node built-ins only.
- **Reuses**: Existing VM-based shell test harness.

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| --- | --- | --- |
| Empty Function catalog | Render explicit empty state | Reader can distinguish no data from a broken report. |
| Unresolved reference | Preserve ID and status text | Reader sees uncertainty instead of a missing edge. |
| Search has no matches | Keep focus and show zero result status | Search remains reversible and predictable. |
| Missing template marker after generation | Fail structural validation | An incomplete report is not presented as valid. |

## Risks & Concerns

| Concern | Location | Impact | Mitigation |
| --- | --- | --- | --- |
| Existing shell lets every linked ID change focus | `skills/mof/mof-shell.html` | A large report loses the intended Function context. | Bind selection only to explicit Function controls. |
| Existing global search overwrites table visibility | `skills/mof/mof-shell.html` | Clearing or changing search can conflict with local filters. | Keep row state composable and test clear/search transitions. |
| Existing test asserts legacy localized behavior | `skills/mof/test-mof-shell.mjs` | Language migration can hide regressions. | Update expected text and add EN-US structural checks. |

## Tech Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| State model | One local `focus` state plus screen/tab state | The user needs one persistent Function context, not arbitrary linked-ID state. |
| Dependencies | None | A single portable report is the requirement. |
| Domain split | Ownership first, line count advisory only | Domain ownership avoids arbitrary fragmentation. |
