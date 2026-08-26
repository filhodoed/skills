# MoF Report Workbench Tasks

## Execution Protocol

Implement these tasks locally with the `tlc-spec-driven` Execute flow. Do not open or push a remote pull request.

**Design**: `.specs/features/mof-report-workbench/design.md`
**Status**: Done

## Test Coverage Matrix

> Guidelines: `AGENTS.md`, `skills/mof/test-mof-shell.mjs`; Node built-ins only.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Static HTML/inline behavior | unit-style VM regression | Every approved interaction and listed edge case | `skills/mof/test-mof-shell.mjs` | `node skills/mof/test-mof-shell.mjs` |
| Documentation/template | none | Build/structural checks | `skills/mof/*.md` | `git diff --check` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Shell behavior task | `node skills/mof/test-mof-shell.mjs` |
| Build | End of each PR phase | `node skills/mof/test-mof-shell.mjs` and `git diff --check` |

## Execution Plan

### Phase 1: PR1 — MoF contract

```text
T1 → T2 → T3 → T4
```

### Phase 2: PR2 — Report workbench

```text
T4 → T5 → T6
```

### Phase 3: Verification

```text
T6 → T7
```

## Task Breakdown

### T1: Update domain ownership contract

**What**: Update `SKILL.md` and `mof-template.md` with ownership-first domain splitting and global root responsibilities.
**Where**: `skills/mof/SKILL.md`, `skills/mof/mof-template.md`
**Depends on**: None
**Requirement**: WORKBENCH-04
**Tests**: none
**Gate**: build

### T2: Update visualization contract

**What**: Define the EN-US single-file A/B/C report, Function-only selection, empty C behavior, footer legend, and generator validation.
**Where**: `skills/mof/visualization.md`
**Depends on**: T1
**Requirement**: WORKBENCH-02, WORKBENCH-03
**Tests**: none
**Gate**: build

### T3: Update public MoF documentation

**What**: Align the skill README and changelog entry with the approved contract.
**Where**: `skills/mof/README.md`, `CHANGELOG.md`
**Depends on**: T2
**Requirement**: WORKBENCH-04
**Tests**: none
**Gate**: build

### T4: Replace shell structure and language

**What**: Replace the old report shell content with the EN-US A/B/C layout while preserving all generator markers and inline-only execution.
**Where**: `skills/mof/mof-shell.html`
**Depends on**: T3
**Requirement**: WORKBENCH-02, WORKBENCH-03
**Tests**: unit-style VM regression
**Gate**: quick

### T5: Implement Function focus and table interactions

**What**: Make Function the only selector, support select/deselect, persistent focus, search without focus loss, clear restoration, and sortable Function columns.
**Where**: `skills/mof/mof-shell.html`, `skills/mof/test-mof-shell.mjs`
**Depends on**: T4
**Requirement**: WORKBENCH-01, WORKBENCH-03
**Tests**: unit-style VM regression
**Gate**: quick

### T6: Implement drilldown, legend, and empty states

**What**: Add B decision drilldowns, C tabs and full-map empty focus behavior, non-selectable evidence links, and the complete footer legend.
**Where**: `skills/mof/mof-shell.html`, `skills/mof/visualization.md`, `skills/mof/test-mof-shell.mjs`
**Depends on**: T5
**Requirement**: WORKBENCH-01, WORKBENCH-02, WORKBENCH-03
**Tests**: unit-style VM regression
**Gate**: quick

### T7: Final verification and release metadata

**What**: Run the complete local gates, update requirement traceability, and verify no external dependencies or unresolved markers remain.
**Where**: `.specs/features/mof-report-workbench/spec.md`, `.specs/features/mof-report-workbench/tasks.md`, `.claude-plugin/plugin.json`
**Depends on**: T6
**Requirement**: WORKBENCH-01, WORKBENCH-02, WORKBENCH-03, WORKBENCH-04
**Tests**: unit-style VM regression
**Gate**: build
