<!--
Sync Impact Report
- Version change: template/unversioned -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Assignment Scope First
  - Template Principle 2 -> II. Money Uses Integer Cents Only
  - Template Principle 3 -> III. Simple, Testable System Design
  - Template Principle 4 -> IV. Responsive Request Experience
  - Template Principle 5 -> V. Critical Flows Need Playwright Proof
- Added sections:
  - Delivery Constraints
  - Workflow & Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ✅ updated: .specify/templates/agent-file-template.md
  - ⚪ not present: .specify/templates/commands/*.md
- Follow-up TODOs:
  - None
-->
# Lovie P2P Request Constitution

## Core Principles

### I. Assignment Scope First
Every decision MUST stay tightly aligned to the fintech P2P payment request take-home.
Work that does not directly improve the core request flow, reviewability, or interview
demonstration MUST be treated as out of scope. Optional polish is acceptable only when it
does not delay or complicate the core assignment deliverable. Rationale: a focused solution
is easier to review, easier to defend in interview discussion, and less likely to hide
unfinished essentials behind extra features.

### II. Money Uses Integer Cents Only
All monetary values MUST be represented, stored, transmitted, tested, and asserted as
integer cents. Floating-point money handling is forbidden in application code, fixtures,
seed data, mocks, and tests. Any display formatting MUST derive from integer cents at the
presentation boundary only. Rationale: fintech-style behavior depends on deterministic money
math, and integer cents eliminate rounding ambiguity in both product behavior and tests.

### III. Simple, Testable System Design
The implementation MUST prefer straightforward, testable architecture over clever
abstractions. Simple or mock email authentication is acceptable and preferred when it keeps
the assignment focused. New layers, patterns, or infrastructure MUST be justified by a clear
need in the request flow, not by speculative future requirements. Rationale: interview
projects are strongest when reviewers can understand the system quickly and verify behavior
without tracing unnecessary indirection.

### IV. Responsive Request Experience
The user experience MUST support both mobile and desktop layouts for all critical request
flows. Responsive behavior, readable typography, touch-friendly controls, and sane empty,
loading, and error states are required for each primary path. Rationale: the feature is being
evaluated as a product experience, not only as backend logic, so usability across common
screen sizes is part of the deliverable.

### V. Critical Flows Need Playwright Proof
Critical user journeys MUST have Playwright end-to-end coverage, and the automated run MUST
produce video recordings suitable for review. A feature is not complete until those tests are
implemented, executable, and able to demonstrate the primary success path and important
failure handling. Rationale: reproducible browser-level evidence provides fast reviewer
confidence and reduces ambiguity about whether the assignment truly works.

## Delivery Constraints

- Mock or simplified email authentication is an acceptable implementation choice and SHOULD
  be preferred unless the feature explicitly requires stronger realism.
- Solutions MUST avoid unnecessary features outside assignment scope, including speculative
  dashboards, production-grade billing infrastructure, or unrelated social/product extras.
- Specs, plans, and tasks MUST call out critical flows, responsive expectations, and money
  handling rules explicitly rather than leaving them implicit.
- Any tradeoff that favors speed over completeness MUST preserve correctness in money logic,
  user clarity, and reviewer testability.

## Workflow & Quality Gates

- Plans MUST pass a constitution check covering scope discipline, integer-cent money
  handling, responsive UX, simple architecture, and Playwright video evidence.
- Specifications MUST define acceptance scenarios for critical flows, edge cases for invalid
  amounts and request states, and measurable outcomes that are demonstrable in interview
  review.
- Task lists MUST include work for Playwright critical-flow coverage and video artifact
  generation before a feature is considered done.
- Reviews MUST reject changes that introduce float-based money logic, non-responsive primary
  flows, or complexity without assignment value.

## Governance

This constitution overrides conflicting local conventions for this repository. Amendments
MUST be made by updating this document and synchronizing any affected templates or guidance
artifacts in the same change. Compliance MUST be checked during planning, specification,
task generation, implementation, and review. Versioning follows semantic versioning for this
document: MAJOR for incompatible governance changes or principle removals, MINOR for new
principles or materially expanded guidance, and PATCH for clarifications that do not change
project obligations.

**Version**: 1.0.0 | **Ratified**: 2026-04-09 | **Last Amended**: 2026-04-09
