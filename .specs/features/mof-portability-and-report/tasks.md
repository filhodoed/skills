# MoF Portability and Technical Report Tasks

## Execution Protocol

Implement these tasks with the `tlc-spec-driven` skill, one atomic task at a time, with structural validation and an atomic commit per task.

**Spec**: `.specs/features/mof-portability-and-report/spec.md`
**Status**: In Progress

## Test Coverage Matrix

> Generated from repository inspection. Guidelines found: `CLAUDE.md`, repository `README.md`; no automated test framework or test suite exists, so structural checks and offline artifact inspection are the gate.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Skill instructions and templates | structural | Every requirement and edge case checked by targeted text/structure assertions | `.specs/features/mof-portability-and-report/` plus `skills/mof/` | `python3 <tlc-skill>/scripts/validate_spec.py ...` and targeted shell checks |
| Generated HTML | offline artifact inspection | No Mermaid/CDN/network references, required sections/columns present, printable CSS and local search present | `skills/mof/mof-shell.html` and generated fixture | `rg` checks plus standalone HTML inspection |
| Repository configuration | none | Build gate only | `.claude-plugin/`, `README.md` | `git diff --check` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Documentation/instruction task | `git diff --check` plus targeted `rg` assertions |
| Full | HTML/report task | Quick checks plus standalone HTML inspection |
| Build | End of phase | `git diff --check` plus all targeted checks |

## Execution Plan

### Phase 1: Core contract

```text
T1 → T2 → T3
```

### Phase 2: Technical report

```text
T4 → T5
```

### Phase 3: Multi-agent documentation and closeout

```text
T6 → T7
```

### Global dependency chain

```text
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

## Task Breakdown

### T1: Define freshness metadata and Query sequence

**What**: Update the MoF instructions and template with commit/timestamp freshness, `fresh`/`stale`/`unverified` states, and the corrected Query opening sequence.
**Where**: `skills/mof/SKILL.md`, `skills/mof/mof-template.md`
**Depends on**: None
**Requirement**: MOF-01, MOF-02, MOF-03, MOF-05
**Tests**: Targeted structural assertions for metadata fields and Query sequence.
**Gate**: Quick

**Status**: Done — commit `68c3dbe`

### T2: Define split-map ownership and update protocol

**What**: Document root/domain ownership, cross-domain relationship placement, and synchronized updates after changes.
**Where**: `skills/mof/SKILL.md`, `skills/mof/mof-template.md`
**Depends on**: T1
**Requirement**: MOF-06, MOF-07, MOF-08
**Tests**: Targeted structural assertions for split-map rules and no-duplication rule.
**Gate**: Quick

**Status**: Done — commit pending

### T3: Add deterministic Query evidence rules

**What**: Make the Query response contract explicitly report evidence paths, traversal depth, unresolved identifiers, and uncertainty.
**Where**: `skills/mof/SKILL.md`
**Depends on**: T2
**Requirement**: MOF-04, MOF-05
**Tests**: Targeted structural assertions for all required response fields.
**Gate**: Quick

**Status**: Done — commit pending

### T4: Replace Mermaid shell with technical tables

**What**: Replace the visualization shell with native HTML/CSS/JavaScript showing metadata, summaries, domains, functions, responsibilities, relationships, impact rules, open questions, search, empty states, and print rules.
**Where**: `skills/mof/mof-shell.html`, `skills/mof/visualization.md`
**Depends on**: T3
**Requirement**: MOF-09, MOF-10, MOF-11, MOF-12, MOF-13
**Tests**: Offline standalone inspection, required-column checks, no-CDN/Mermaid checks, local-search and print-rule checks.
**Gate**: Full

**Status**: Done — commit pending

### T5: Define safe report generation rules

**What**: Document text escaping, unresolved relationship rendering, and the rule that `docs/MOF.md` remains the only source of truth.
**Where**: `skills/mof/visualization.md`, `skills/mof/mof-shell.html`
**Depends on**: T4
**Requirement**: MOF-14
**Tests**: Targeted checks for escaping guidance and safe text rendering APIs.
**Gate**: Quick

**Status**: Done — commit pending

### T6: Document Claude Code, Codex, and Gemini CLI usage

**What**: Update repository and skill documentation with portable-core guidance and per-agent installation/activation paths.
**Where**: `README.md`, `skills/mof/README.md`, `skills/mof/SKILL.md`
**Depends on**: T5
**Requirement**: MOF-15, MOF-16, MOF-17
**Tests**: Targeted documentation checks for all three agents and excluded dependencies.
**Gate**: Quick

**Status**: Done — commit pending

### T7: Final structural validation and release notes

**What**: Update changelog/release metadata and run the complete structural validation of the skill and generated report.
**Where**: `CHANGELOG.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
**Depends on**: T6
**Requirement**: MOF-01 through MOF-17
**Tests**: Full targeted validation and `git diff --check`.
**Gate**: Build

**Status**: Done — commit pending

## Closeout

All requirements are implemented in the current task sequence; the final validation report is pending the independent closeout check.

## Dependency Cross-Check

| Task | Declared dependency | Diagram match |
| --- | --- | --- |
| T1 | None | ✅ |
| T2 | T1 | ✅ |
| T3 | T2 | ✅ |
| T4 | T3 | ✅ |
| T5 | T4 | ✅ |
| T6 | T5 | ✅ |
| T7 | T6 | ✅ |

## Test Co-Location Validation

| Task | Tests field | Matrix match |
| --- | --- | --- |
| T1 | Structural assertions | ✅ |
| T2 | Structural assertions | ✅ |
| T3 | Structural assertions | ✅ |
| T4 | Offline artifact inspection | ✅ |
| T5 | Structural assertions | ✅ |
| T6 | Documentation checks | ✅ |
| T7 | Full targeted validation | ✅ |
