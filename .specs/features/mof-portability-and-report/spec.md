# MoF Portability and Technical Report Specification

## Problem Statement

The MoF core is useful across agents, but its freshness rules are date-based and its HTML visualization depends on Mermaid. The skill needs deterministic impact-query behavior and a dependency-free, human-oriented technical report while preserving Markdown/YAML as the source of truth.

## Goals

- [ ] Make MoF freshness verifiable by commit and timestamp.
- [ ] Define consistent updates when a map is split by domain.
- [ ] Make Query's initial context and uncertainty handling deterministic.
- [ ] Replace the Mermaid visualization with native HTML, CSS, and JavaScript tables.
- [ ] Document Claude Code, Codex, and Gemini CLI usage without adding runtime dependencies.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Database-backed MoF | Preserves file-first, auditable, dependency-free operation. |
| Separate graph artifact | The technical relationship table is more useful and avoids duplicated projections. |
| Cursor adapter | Explicitly deferred. |
| Parser or server | Not required for the current scope. |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Freshness evidence | Store ISO timestamp and latest mapped commit in `mof_meta`. | Same-day commits must be distinguishable. | yes |
| Split-map ownership | Domain files own local sections; root file owns global index and cross-domain sections. | Prevents stale local or global projections. | yes |
| HTML source | Generate from MoF sections; never edit HTML as source. | Maintains one fact, one home. | yes |
| Visualization dependency | No Mermaid or CDN in generated HTML. | Supports restricted corporate environments. | yes |
| Test mechanism | Structural validation and repository checks; no new test framework. | Repository is documentation/skill focused. | yes |

**Open questions:** none - all resolved or logged above.

## User Stories

### P1: Reliable freshness and Query radius ⭐ MVP

**User Story**: As an agent, I want to verify MoF freshness and traverse all relevant relationship paths so that I can identify what must be reviewed before changing behavior.

**Acceptance Criteria**:

1. WHEN a mapped code reference has a commit newer than `mof_meta.last_commit` THEN the Query SHALL classify the affected seed as `stale`.
2. WHEN freshness evidence is incomplete or a referenced path is ambiguous THEN the Query SHALL classify the affected seed as `unverified` and report the missing evidence.
3. The Query SHALL read `mof_meta` and `impact_index` before reading responsibility details.
4. The Query SHALL report direct call paths, entity fan-out, event fan-out, shared-code exposure, workflows, impact rules, and cross-cutting rules that enter the computed radius.
5. The Query SHALL report the traversal depth and distinguish verified relationships from unverified assumptions.

**Independent Test**: Inspect the instructions and template against same-day commit, missing-path, entity, event, SRP, workflow, and impact-rule examples.

### P1: Consistent split-map maintenance ⭐ MVP

**User Story**: As a maintainer, I want clear ownership between the root MoF and domain files so that a change cannot leave one projection stale.

**Acceptance Criteria**:

1. WHEN the MoF is split by domain THEN the root file SHALL own global metadata, the complete impact index, cross-domain relationships, global impact rules, cross-cutting rules, open questions, and revision history.
2. WHEN a domain responsibility changes THEN the corresponding domain file and the root impact index SHALL be updated together.
3. The MoF SHALL NOT duplicate a responsibility across domain files.

**Independent Test**: Review the documented split-map procedure against a two-domain example.

### P1: Dependency-free technical HTML report ⭐ MVP

**User Story**: As a technical professional, I want a quick printable report of the MoF so that I can review relationships without reading the entire Markdown file.

**Acceptance Criteria**:

1. WHEN the HTML is generated THEN it SHALL show metadata, summary counts, domains, functions, responsibilities, technical relationships, impact rules, and open questions.
2. WHEN technical relationships are shown THEN the table SHALL include source domain, source responsibility, relation type, destination domain, destination responsibility, coupling, channel, criticality, and details.
3. The HTML SHALL function without Mermaid, CDN resources, network requests, or a server.
4. WHEN a user enters a search term THEN the report SHALL filter relationship rows using local browser logic only.
5. WHEN the report is printed THEN the report SHALL hide interactive-only controls and preserve readable tables.
6. IF a MoF value contains HTML-sensitive characters THEN the generated report SHALL render the value as text without breaking the document structure.

**Independent Test**: Open the standalone report offline, search a relationship, print it, and inspect special-character fixtures.

### P2: Multi-agent documentation

**User Story**: As a team using different coding agents, I want installation and activation guidance for Claude Code, Codex, and Gemini CLI so that the same MoF method can be reused without platform-specific dependencies.

**Acceptance Criteria**:

1. The skill documentation SHALL identify `SKILL.md` as the portable core.
2. The documentation SHALL provide separate installation/activation guidance for Claude Code, Codex, and Gemini CLI.
3. The portable core SHALL NOT require Cursor, a database, a server, Mermaid, or a network connection.

**Independent Test**: Search the documentation for each supported agent and verify that the out-of-scope platforms and dependencies are not presented as requirements.

## Edge Cases

- IF `last_commit` is absent THEN the Query SHALL report `unverified`, not `fresh`.
- IF a relationship references a responsibility missing from the map THEN the report SHALL preserve the identifier and flag the relationship as unresolved.
- IF a map has no impact rules or open questions THEN the report SHALL render the sections with an explicit empty state.
- IF a relationship description contains quotes, angle brackets, or ampersands THEN the report SHALL render it as text.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| MOF-01 | P1: Reliable freshness and Query radius | Core | Verified in `68c3dbe` |
| MOF-02 | P1: Reliable freshness and Query radius | Core | Verified in `68c3dbe` |
| MOF-03 | P1: Reliable freshness and Query radius | Core | Verified in `68c3dbe` |
| MOF-04 | P1: Reliable freshness and Query radius | Core | Verified in T3 |
| MOF-05 | P1: Reliable freshness and Query radius | Core | Verified in `68c3dbe` |
| MOF-06 | P1: Consistent split-map maintenance | Core | Verified in T2 |
| MOF-07 | P1: Consistent split-map maintenance | Core | Verified in T2 |
| MOF-08 | P1: Consistent split-map maintenance | Core | Verified in T2 |
| MOF-09 | P1: Dependency-free technical HTML report | Visual | Verified in T4 |
| MOF-10 | P1: Dependency-free technical HTML report | Visual | Verified in T4 |
| MOF-11 | P1: Dependency-free technical HTML report | Visual | Verified in T4 |
| MOF-12 | P1: Dependency-free technical HTML report | Visual | Verified in T4 |
| MOF-13 | P1: Dependency-free technical HTML report | Visual | Verified in T4 |
| MOF-14 | P1: Dependency-free technical HTML report | Visual | Pending |
| MOF-15 | P2: Multi-agent documentation | Docs | Pending |
| MOF-16 | P2: Multi-agent documentation | Docs | Pending |
| MOF-17 | P2: Multi-agent documentation | Docs | Pending |

**Coverage:** 17 total, 0 mapped to tasks, 17 unmapped pending task creation.

## Success Criteria

- [ ] The Query can distinguish fresh, stale, and unverified evidence without same-day ambiguity.
- [ ] Split maps have explicit root/domain ownership.
- [ ] The generated HTML is offline, dependency-free, searchable, and printable.
- [ ] Claude Code, Codex, and Gemini CLI have documented usage paths.
