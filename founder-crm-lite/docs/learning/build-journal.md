# Build Journal

## Entry 001

### Stage

Initial workspace split and CRM architecture framing

### What decision was made

- The CRM will be built in its own folder as a standalone modular monolith.

### What options were considered

- one shared app for both products
- two separate project folders
- a monorepo with shared packages from day one

### Why the final option was chosen

It keeps the CRM's domain boundaries clear, reduces accidental coupling, and makes the project easier to study and review.

### Files/modules created or changed

- `README.md`
- `founder-crm-lite/README.md`
- `founder-crm-lite/docs/architecture/*`
- `founder-crm-lite/docs/learning/*`
- `founder-crm-lite/docs/ai-workflows/*`

### What to study later

- why premature sharing across products is risky
- how project-local docs improve traceability

### Questions to ask yourself when reviewing

- does this structure make future CRM changes easier to isolate?
- are we avoiding fake reuse?

### How AI was used in this stage

- single-agent architecture reasoning
- structured documentation creation

### Workflow mode used

Mode A: Single Agent

### What worked well

- consistent narrative across architecture and learning docs

### What was risky or required manual verification

- making sure the split keeps future implementation straightforward rather than fragmented

## Entry 002

### Stage

CRM implementation baseline decisions

### What decision was made

- internal architecture: modular monolith with App Router, feature modules, server components for reads, and server actions for writes
- persistence: file-backed JSON repositories behind typed services
- auth: cookie session with seeded users and server-side policy checks
- validation: Zod schemas at the server boundary

### What options were considered

- thin page-driven architecture versus explicit service layers
- in-memory fixtures versus file-backed repositories versus full DB setup
- external auth versus demo session auth versus UI-only role toggles

### Why the final option was chosen

It keeps the app runnable in one session while still teaching real separation of concerns, policy enforcement, and code-reviewable business logic.

### Files/modules created or changed

- `docs/architecture/01-major-decisions-log.md`
- `docs/architecture/02-options-considered.md`
- `docs/architecture/04-data-flow-notes.md`
- `docs/architecture/06-backend-services-notes.md`
- `docs/architecture/07-auth-and-permissions-notes.md`
- `docs/architecture/09-future-extension-risks.md`

### What to study later

- why realistic boundaries matter more than a production-grade storage engine in an early training project
- how authentication and authorization are related but not the same thing

### Questions to ask yourself when reviewing

- can I find the policy checks without reading UI code?
- will a database swap later preserve most service code?
- where will activity logging be triggered for major mutations?

### How AI was used in this stage

- decision synthesis
- tradeoff articulation
- docs updates before implementation

### Workflow mode used

Mode A: Single Agent

### What worked well

- the chosen architecture creates obvious homes for future domain logic

### What was risky or required manual verification

- making sure the simplified auth and persistence choices do not accidentally teach bad production assumptions

## Entry 003

### Stage

CRM implementation slice

### What decision was made

- build a runnable local CRM with durable JSON-backed state, seeded demo users, and core revenue-ops workflows

### What options were considered

- stop at scaffold quality versus implement meaningful end-to-end flows
- use route handlers for every mutation versus server actions over explicit services

### Why the final option was chosen

Server actions over explicit services kept the UI wiring fast while still preserving reviewable business logic boundaries. That let us deliver a working app in one pass without teaching the wrong lesson about where logic belongs.

### Files/modules created or changed

- `package.json`, `tsconfig.json`, `next.config.ts`
- `src/app/**/*`
- `src/components/*`
- `src/modules/auth/*`
- `src/modules/crm/*`
- `src/server/json-store.ts`
- `data/crm-db.json`

### What to study later

- `src/modules/crm/service.ts` as the main business-logic center
- `src/modules/crm/actions.ts` as the mutation boundary
- `src/app/(app)/leads/[leadId]/page.tsx` as a realistic detail page composition

### Questions to ask yourself when reviewing

- what logic is in the service layer that should not be in the page?
- where are permissions enforced for conversion and task completion?
- how would a relational database replace the JSON repository without forcing a full rewrite?

### How AI was used in this stage

- scaffold generation
- repetitive file creation
- compile/build verification
- fast iteration after framework/type errors

### Workflow mode used

Mode D: Agent + Tools

### What worked well

- typecheck/build verification caught real framework integration issues before handoff

### What was risky or required manual verification

- verifying that the simplified persistence layer still demonstrates sound service/repository boundaries
