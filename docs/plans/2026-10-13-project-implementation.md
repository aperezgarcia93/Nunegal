# Mobile-device shopping prototype: implementation plan

**Date:** 2026-10-13 · **Change:** `project-implementation` · **State:** implemented and verified; publication (7.4) and archive (7.5) pending authorization. See the [verification report](../../openspec/changes/project-implementation/verification-report.md).

Build the two-view mobile-device shopping SPA described in [the seven-page brief](../../Prueba%20frontend%20ITX%20%281%29.pdf). The user confirmed prototype scope, no additional general constraints, English documents, and authorization to complete all planning phases together. Local OpenSpec artifacts are the source of truth because project documents were explicitly requested.

## Read the plan

| Document | Purpose |
|---|---|
| [Exploration and PDF requirement register](../../openspec/changes/project-implementation/exploration.md) | Source pages, observed API evidence, unknowns, and alternatives. |
| [Proposal](../../openspec/changes/project-implementation/proposal.md) | Intent, scope, exclusions, assumptions, risks, and success criteria. |
| [Shell/navigation](../../openspec/changes/project-implementation/specs/shell-navigation/spec.md) | Routes, header, breadcrumbs, return navigation, responsive structure. |
| [Catalog](../../openspec/changes/project-implementation/specs/catalog/spec.md) | Complete list, live local search, product cards, recovery. |
| [Product detail](../../openspec/changes/project-implementation/specs/product-detail/spec.md) | Device information, selectors, validity, transitions. |
| [Cart](../../openspec/changes/project-implementation/specs/cart/spec.md) | Exact POST payload, returned count, persistence, pending/error behavior. |
| [Client data](../../openspec/changes/project-implementation/specs/client-data/spec.md) | API validation, strict one-hour caching, storage, concurrent reads. |
| [Quality/delivery](../../openspec/changes/project-implementation/specs/quality-delivery/spec.md) | Reproducible commands, accessibility, safety, verification, handoff. |
| [Technical design](../../openspec/changes/project-implementation/design.md) | Architecture, contracts, state ownership, files, test strategy, decisions. |
| [Implementation checklist](../../openspec/changes/project-implementation/tasks.md) | Small ordered tasks, milestones, acceptance checks, planned commands. |
| [Traceability and evidence matrix](../../openspec/changes/project-implementation/traceability.md) | All 17 PDF requirements and all specification scenarios mapped to work and validation. |
| [Verification report](../../openspec/changes/project-implementation/verification-report.md) | Per-scenario results, command evidence, fixes from review, known limitations. |

## Recommended implementation

Use React, TypeScript, Vite, client routing, native fetch, a small explicit product cache, and a shared cart-count provider. Keep brand/model search and variant selection local to their views. Use deterministic fixtures for automated checks and a separate bounded live-service smoke check. Confirm the runtime and compatible dependency versions when implementation starts; record the selected versions and lockfile.

The binding PDF scope is two client-routed views, required product information and selectors, three supplied endpoints, persisted returned cart count, one-hour client caching, four required script purposes, and a public repository with README and incremental history. Accessibility, defensive boundaries, typed contracts, CI, and precise failure behavior are selected engineering defaults. There is no custom backend, database, checkout, authentication, SSR, or required hosted deployment.

## Delivery sequence

1. Resolve API contract and browser-origin uncertainty; establish README and reproducible tools.
2. Build validated API, storage, and strict one-hour read caching with targeted tests.
3. Deliver shell and complete searchable catalog.
4. Deliver details and valid option selection with route-state isolation.
5. Connect cart mutation, authoritative count, reload persistence, and safe pending behavior.
6. Verify integrated browser journeys, responsive/accessibility behavior, and a production build.
7. Record evidence, complete README, and prepare the later authorized public-repository handoff.

Tasks and milestone gates are authoritative in the checklist. Work is sized as small logical changes, not a promised schedule. Re-estimate after the API discovery gate using actual evidence, available developer time, and test infrastructure; no deadline, budget, or staffing commitment is implied.

## SDD operation after planning

- **Apply:** after implementation is requested, use `/sdd-apply project-implementation`. Delegate to `sdd-apply`, implement the next dependency-complete task batch, run its relevant checks, and tick only completed tasks with evidence. Follow the supplied AGENTS.md workflow, including phase transition approval unless the user grants continuing authorization. The current blanket authorization covers planning only.
- **Change a decision:** update the proposal if scope changes; update affected scenario specifications and design before dependent code; adjust tasks and traceability together. Use `/sdd-continue project-implementation` for missing planning artifacts. A separate feature starts with `/sdd-new <change-name>` and the exploration/proposal chain; `/sdd-ff <change-name>` can prepare its planning chain when authorized.
- **Verify:** use `/sdd-verify project-implementation` after implementation. Delegate to `sdd-verify`; compare actual code and behavior against each scenario and task. Record commands, environment, results, manual evidence, and unresolved limitations in `openspec/changes/project-implementation/verification-report.md`. Correct failures before calling the project complete.
- **Archive:** use `/sdd-archive project-implementation` only after implementation and verification are accepted. Delegate to `sdd-archive`; synchronize these new capability specs into `openspec/specs/` and archive the change with its evidence. Repair relative links in this index to the archived location. Planning completeness alone does not justify archiving an implemented change.

These are agent workflow commands, not claims that a particular OpenSpec CLI is installed. No OpenSpec configuration existed during exploration; use the explicit paths here and add configuration only if the chosen workflow needs it. Implementation verification is recorded in the verification report; no deployment, publication, or live cart mutation has been performed.

## First implementation gate

Complete task phase 1 before relying on unspecified detail fields, option-code types, CORS, or cart-session behavior. Record verified facts separately from assumptions. A read-only list request succeeded during exploration; that does not establish detail or mutation behavior. A user-owned public repository and optional hosting target can be selected at handoff; neither blocks local prototype implementation.
