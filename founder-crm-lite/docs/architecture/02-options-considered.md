# Options Considered

## CRM-ADR-001

## Stage

Project/app structure

## Why this matters

This decision affects how cleanly the CRM can evolve, how easy it is to review as a standalone application, and whether future engineering decisions stay local to the CRM or become entangled with the feedback product.

## Options considered

### Option A: Single shared app serving both products
- What it is: one Next.js application with routes for both the CRM and the feedback board.
- Strengths: shared tooling, shared dependencies, one runtime.
- Weaknesses: product boundaries blur immediately, auth/roles/settings can become coupled, and review scope gets muddy.
- Future pain points: one product's complexity leaks into the other through shared abstractions and routing conventions.
- When a team would choose it: when both products are really two modules of one platform with heavy overlap.

### Option B: Separate project folders, each as a standalone modular monolith
- What it is: each product gets its own top-level folder, docs, app, architecture, and runtime choices.
- Strengths: strongest product clarity, easier study flow, easier PR slicing, less accidental coupling, and better portfolio/readability value.
- Weaknesses: some duplicated setup later.
- Future pain points: shared utilities would need deliberate extraction rather than casual reuse.
- When a team would choose it: when the products are distinct enough that their domain, UI, and permissions should stay isolated.

### Option C: Monorepo packages with shared infrastructure from day one
- What it is: two apps plus shared packages for UI, auth, config, and utilities at the start.
- Strengths: can reduce duplication and encourage consistency if the shared abstractions are truly stable.
- Weaknesses: premature sharing often creates the wrong abstractions before either app is understood.
- Future pain points: teams end up maintaining generic packages that serve neither product well.
- When a team would choose it: when there is already a proven shared platform or a larger team with stable cross-product conventions.

## Recommendation

Choose **Option B: Separate project folders, each as a standalone modular monolith**.

Why:

- The CRM is domain-heavy and will benefit from highly product-specific naming and structure.
- It keeps the codebase easier to study because the files you open will all belong to one mental model.
- It avoids premature shared abstractions, which is a common early mistake in multi-product repos.

## Junior engineer pitfall

A junior engineer often overvalues DRY too early and may try to share app structure, UI primitives, or service layers before the domain has stabilized.

## Mid-level engineer view

A mid-level engineer should notice that "separate folders" is not only an organizational choice. It is a way to keep future refactors bounded and reviews more understandable.

## Senior engineer concern

A senior engineer worries about accidental platform-building. Shared infrastructure is expensive when created before clear reuse patterns emerge.

## Recommended AI workflow

Mode A: Single Agent

This stage is mostly architectural framing and documentation. It benefits more from coherent reasoning than from parallel subagents. Extra agents would add coordination cost without enough implementation complexity yet.

## Suggested prompt pattern

Bad prompt:

"Set up a CRM app."

Better prompt:

"Design the initial project structure for a realistic startup CRM in Next.js with clear docs and maintainable module boundaries."

Strong prompt:

"I am building a founder CRM in a shared workspace with another unrelated product. Compare repository/app-structure options, explain tradeoffs for maintainability and AI-assisted development, recommend one, and record the decision in architecture, learning, and AI workflow docs."

## Verification checklist

- Does the chosen structure keep the CRM independent from the feedback project?
- Will future auth, imports, timeline logic, and pipeline features have obvious homes?
- Are we avoiding shared abstractions before we understand actual reuse?

## Decision impact on the codebase

- The CRM will live entirely inside `founder-crm-lite/`.
- Docs, app code, tests, and configuration will stay project-local.
- Future features will be reviewed and studied within CRM-specific slices rather than workspace-wide slices.

## CRM-ADR-002

## Stage

Internal application architecture

## Why this matters

This determines whether the CRM stays reviewable once lead conversion, import flows, pipeline logic, notes, and permissions start interacting.

## Options considered

### Option A: Thin Next.js app with most logic in pages and components
- What it is: components and page files own much of the orchestration and mutation logic.
- Strengths: very fast to start.
- Weaknesses: business logic leaks into UI, reviews become harder, and tests become more coupled to rendering.
- Future pain points: lead conversion and import logic become difficult to centralize.
- When a team would choose it: prototypes with very short lifespan.

### Option B: Modular monolith with App Router, feature modules, server components for reads, server actions for writes, and explicit services/repositories
- What it is: route files stay thin while feature modules own schemas, services, repositories, policies, and view-model shaping.
- Strengths: clear business-logic homes, easier code review, and realistic boundaries for a long-lived internal app.
- Weaknesses: more initial structure.
- Future pain points: requires discipline so developers do not bypass the service layer.
- When a team would choose it: enterprise-style products that need to stay maintainable without separate-service overhead.

### Option C: Separate frontend and backend service
- What it is: Next.js UI plus dedicated API service from day one.
- Strengths: strongest boundary clarity.
- Weaknesses: too much setup and operational complexity for this stage.
- Future pain points: duplicated contracts and slower local iteration.
- When a team would choose it: larger teams or multi-client platforms.

## Recommendation

Choose **Option B**.

## Junior engineer pitfall

A junior engineer may see structure as overhead and not realize that the hard part of a CRM is not rendering forms, it is keeping conversion, activity logging, permissions, and imports understandable.

## Mid-level engineer view

A mid-level engineer should notice that explicit service and repository layers create a better review surface for business rules.

## Senior engineer concern

A senior engineer worries about future churn landing in too many UI files if the boundaries are not established up front.

## Recommended AI workflow

Mode A: Single Agent

This stage is still architecture-heavy and benefits from coherent reasoning more than parallel implementation.

## Suggested prompt pattern

"Design the internal architecture of a realistic CRM so lead conversion, ownership rules, imports, exports, and activity logging remain reviewable."

## Verification checklist

- Can a reviewer find business rules without reading React tree internals?
- Is there an obvious place for activity events and policies?
- Do route files stay relatively thin?

## Decision impact on the codebase

- Feature modules will live under `src/modules`.
- Shared server-only data access will live under `src/server`.
- Page files will mostly compose services and UI.

## CRM-ADR-003

## Stage

Persistence strategy

## Why this matters

We need the app to run locally right away, but we also want a structure that teaches good boundaries rather than baking storage concerns into page code.

## Options considered

### Option A: In-memory seed data only
- What it is: hardcoded objects reset on refresh or server restart.
- Strengths: fastest possible implementation.
- Weaknesses: not realistic enough for CRUD-heavy business flows.
- Future pain points: no durable state for studying workflows.
- When a team would choose it: demos where persistence does not matter.

### Option B: File-backed JSON repositories behind typed interfaces
- What it is: repositories read and write structured JSON files using server-only persistence helpers.
- Strengths: durable local state, low setup cost, and a clean seam for later database replacement.
- Weaknesses: not concurrent-safe enough for real production.
- Future pain points: limited query power and transaction guarantees.
- When a team would choose it: learning builds or internal demos that still want realistic repository structure.

### Option C: Full relational database and ORM from the start
- What it is: PostgreSQL/SQLite plus Prisma or equivalent.
- Strengths: strongest production realism.
- Weaknesses: more setup, migrations, and schema churn across two apps in the same turn.
- Future pain points: higher upfront cost before the domain stabilizes.
- When a team would choose it: teams ready to commit to database design immediately.

## Recommendation

Choose **Option B**.

## Junior engineer pitfall

A junior engineer may think persistence choice is only about storage, not about whether services and repositories remain replaceable.

## Mid-level engineer view

A mid-level engineer should notice that repository seams matter even when the storage engine is intentionally simple.

## Senior engineer concern

A senior engineer worries about not misleading future contributors into thinking file-backed persistence is production-ready.

## Recommended AI workflow

Mode A: Single Agent

## Suggested prompt pattern

"Choose a persistence strategy that keeps a training CRM runnable locally while preserving a realistic repository boundary."

## Verification checklist

- Are repository interfaces isolated from UI code?
- Could the storage layer be replaced later without rewriting business logic?
- Are limitations clearly documented?

## Decision impact on the codebase

- Seeded JSON data will live under `data/`.
- Server-only persistence helpers will live under `src/server`.
- Services will depend on repositories, not raw files.

## CRM-ADR-004

## Stage

Auth and authorization strategy

## Why this matters

The CRM has role-sensitive behavior and ownership rules. We need realistic permission enforcement without turning setup into an identity-provider project.

## Options considered

### Option A: Full external auth integration now
- What it is: Auth.js, Clerk, or external IdP from day one.
- Strengths: realistic login infrastructure.
- Weaknesses: adds setup complexity unrelated to the domain-learning goal.
- Future pain points: identity integration work dominates the early project.
- When a team would choose it: production-facing products or identity-heavy systems.

### Option B: Demo cookie sessions with seeded users and server-side policy checks
- What it is: users sign in as seeded demo identities, sessions are stored in cookies, and role/ownership rules are enforced on the server.
- Strengths: keeps permissions real and testable while staying easy to run locally.
- Weaknesses: not a production auth system.
- Future pain points: later replacement with real identity integration.
- When a team would choose it: training projects and internal demos focused on business logic.

### Option C: UI-only role switching with no server enforcement
- What it is: frontend toggles roles visually.
- Strengths: fastest to fake.
- Weaknesses: teaches the wrong lesson because permissions are not trustworthy.
- Future pain points: impossible to review as real authorization.
- When a team would choose it: never, if the goal is realistic engineering practice.

## Recommendation

Choose **Option B**.

## Junior engineer pitfall

A junior engineer may assume auth can be added later, but permission-sensitive business logic gets much harder to untangle once it is written without server enforcement.

## Mid-level engineer view

A mid-level engineer should notice the difference between authentication mechanics and authorization boundaries.

## Senior engineer concern

A senior engineer worries about hidden permission logic spread across components instead of policy helpers and server actions.

## Recommended AI workflow

Mode A: Single Agent

## Suggested prompt pattern

"Design a local-friendly auth model for a CRM that still enforces role and ownership checks on the server."

## Verification checklist

- Are permissions checked server-side?
- Are ownership rules centralized?
- Is the auth simplification clearly documented as a training tradeoff?

## Decision impact on the codebase

- Auth helpers and policy checks will live in feature modules instead of pages.
- Layouts and server actions will read the current session from cookies.
- UI affordances will reflect permissions but will not be the only enforcement point.
