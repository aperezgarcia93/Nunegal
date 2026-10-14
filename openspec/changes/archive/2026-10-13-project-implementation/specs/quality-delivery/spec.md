# Quality and delivery specification

## Purpose

State a proportionate verification and handoff standard for this prototype. **Mandate** identifies PDF requirements. Other requirements are deliberate engineering defaults, not claims that the PDF requires a certification or production service. See [source register](../../exploration.md).

## Requirements

### Requirement: QUAL-01 — Reproducible development commands

**Mandate:** PDF-02/04 (p. 1). **Decision:** conventional lowercase script keys and pinned toolchain.

The project MUST document and provide `start` for development, `build` for a production SPA bundle, `test` for deterministic automated checks, and `lint` for code-quality checks. A clean install using the committed lockfile and documented supported runtime MUST reproduce those commands. TypeScript, if selected, MUST be type-checked by a documented validation command/gate. Test and lint commands MUST return nonzero on failures and support noninteractive execution.

#### Scenario: QUAL-01a — Clean checkout
- GIVEN a clean checkout and the documented runtime
- WHEN dependencies are installed from the lockfile and required scripts are run
- THEN development starts, production assets build, and tests/lint report meaningful pass/fail exit codes.

#### Scenario: QUAL-01b — Gate failure
- GIVEN a failing behavior test or lint violation
- WHEN its command runs noninteractively
- THEN it exits nonzero rather than waiting indefinitely or reporting success.

### Requirement: QUAL-02 — Accessible interaction

**Decision:** practical keyboard/screen-reader acceptance supporting the required UI; full WCAG certification is not in scope.

Navigation links, search, selectors, and Add/retry actions MUST have semantic roles, accessible names, visible keyboard focus, and keyboard operation. Product images MUST have useful alternative text or correctly decorative treatment. Page headings and breadcrumbs MUST convey structure. Loading/error/addition status MUST be perceivable without relying only on color; mutation results MUST be announced without forcing disruptive focus changes. Route changes SHOULD move focus to an appropriate heading, and content MUST remain usable at 200% zoom. Text and interactive focus indicators SHOULD meet WCAG AA contrast targets.

#### Scenario: QUAL-02a — Keyboard purchase path
- GIVEN keyboard-only interaction
- WHEN the visitor searches, opens a card, selects options, and adds
- THEN every action can be completed with visible focus and no keyboard trap.

#### Scenario: QUAL-02b — Accessible status and zoom
- GIVEN a screen-reader audit and a 200% zoom check
- WHEN validation, loading, successful addition, and failed addition are exercised
- THEN controls have names, status is perceivable, and required information/actions remain usable without overlap or clipping.

### Requirement: QUAL-03 — Boundary safety and predictable performance

**Decision:** prototype safety/performance baseline without unsupported numerical service guarantees.

Remote and persisted text MUST render as text, never executable markup. The frontend MUST contain no secret credentials. Unsafe/unusable image sources MUST use fallbacks; external service failures MUST not reveal stack traces or sensitive diagnostics to users. Image loading SHOULD reserve layout space and avoid eagerly loading every off-screen catalog image. Search MUST execute locally without repeated network calls. The production bundle SHOULD be inspected for accidental server/test dependencies; absolute latency and bundle budgets are design targets, not promises about the public API.

#### Scenario: QUAL-03a — Untrusted content
- GIVEN product text containing HTML/script-looking content and an unusable image URL
- WHEN the product renders
- THEN the text is not executed and the image has a safe fallback.

#### Scenario: QUAL-03b — Resource behavior
- GIVEN a catalog larger than the visible viewport
- WHEN images load and the visitor types in search
- THEN image space is reserved, off-screen loading follows the chosen strategy, and search makes no API calls.

### Requirement: QUAL-04 — Behavior verification and review gates

**Decision:** deterministic risk-focused tests and continuous checks.

Verification MUST cover the named scenarios across these specifications with proportionate unit, component, browser, or manual evidence. Automated tests MUST use deterministic fixtures and a controllable clock for TTL boundaries, and MUST NOT depend on live service uptime or perform uncontrolled real cart mutations. Critical end-to-end coverage MUST include search-to-detail-to-add, returned-count reload persistence, failure recovery, and production direct-route reload. Automated lint/type checks as applicable, tests, and build MUST run before delivery, preferably in CI. Manual responsive/keyboard checks MUST supplement automation. Coverage percentages alone MUST NOT substitute for observable acceptance behavior.

#### Scenario: QUAL-04a — Offline deterministic suite
- GIVEN external API access is unavailable
- WHEN the automated acceptance suite runs with local fixtures
- THEN it verifies critical success/error/cache behavior without making live cart mutations.

#### Scenario: QUAL-04b — Delivery evidence
- GIVEN a release candidate
- WHEN its verification checklist is reviewed
- THEN required commands, critical browser flows, exact TTL boundary cases, viewport checks, and known service limitations have recorded results.

### Requirement: QUAL-05 — Reviewable repository and handoff

**Mandate:** PDF-05 (p. 1). **Decision:** implementation milestones and explicit later publication boundary.

Eventual delivery MUST include a publicly accessible code repository with incremental development history and a README explaining setup, execution, and relevant notes. README SHOULD be established in the first implementation commit. It MUST document routes/static SPA fallback, API configuration/limitations, assumptions (currency, options, caching, count persistence), testing, architecture boundaries, and remaining limitations. A production build MUST be tested locally; hosted deployment is optional because the PDF requires a repository, not a paid host. This planning request MUST NOT itself publish or deploy anything.

#### Scenario: QUAL-05a — Reviewer reproducibility
- GIVEN a reviewer with the repository URL
- WHEN they follow README from a clean checkout
- THEN they can run the application and checks and understand known assumptions without undocumented setup.

#### Scenario: QUAL-05b — Final submission
- GIVEN implementation is ready for later delivery and publication is authorized
- WHEN repository accessibility and history are checked
- THEN the source is publicly readable, milestone commits are visible, and no secrets or generated dependency directories are included.
