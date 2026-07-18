# PR Slices

## Slice 001: Initial CRM architecture foundation

### Purpose

Create the CRM folder, project docs, and initial decision records before implementation.

### Files touched

- `founder-crm-lite/README.md`
- files under `founder-crm-lite/docs/architecture`
- files under `founder-crm-lite/docs/learning`
- files under `founder-crm-lite/docs/ai-workflows`

### Main risks

- documenting abstractions too vaguely
- front-loading shared patterns before real feature pressure exists

### Reviewer focus

- are the product boundaries and goals clear?
- is the first structural decision realistic?

### Likely follow-up tasks

- decide application architecture
- decide domain model direction
- decide auth and persistence strategy

### What a junior reviewer might miss

- why a workspace-level shared app would create long-term confusion

### What a stronger reviewer would flag

- any premature shared package strategy without proven reuse

## Slice 002: CRM runnable application foundation

### Purpose

Turn the docs into a working Next.js app with auth/session plumbing, shared shell components, persistence helpers, and core CRM modules.

### Files touched

- config files at the project root
- `src/modules/auth/*`
- `src/modules/crm/types.ts`
- `src/modules/crm/repository.ts`
- `src/modules/crm/service.ts`
- `src/server/json-store.ts`
- `data/crm-db.json`

### Main risks

- leaking business logic into route files
- teaching unrealistic auth/persistence assumptions without clearly documenting the tradeoffs

### Reviewer focus

- are auth and persistence abstractions honest about their limitations?
- does the service layer own the meaningful business rules?

### Likely follow-up tasks

- richer import flow
- duplicate merge flows
- more advanced reporting and saved views

### What a junior reviewer might miss

- why JSON persistence can still be acceptable in a training app if the repository boundary is clean

### What a stronger reviewer would flag

- any policy checks hidden in UI instead of services

## Slice 003: CRM user-facing flows

### Purpose

Implement the dashboard, leads, tasks, deals, companies, search, settings, and CSV export flows.

### Files touched

- `src/app/(app)/**/*`
- `src/app/api/exports/leads/route.ts`
- `src/components/*`
- `src/modules/crm/actions.ts`

### Main risks

- detail pages becoming god files
- revalidation gaps after mutations

### Reviewer focus

- does each page stay mostly compositional?
- are timeline/task/note/conversion flows still easy to trace?

### Likely follow-up tasks

- more granular company/contact detail pages
- import preview and duplicate handling

### What a junior reviewer might miss

- why build-time verification matters even for mostly server-rendered pages

### What a stronger reviewer would flag

- any creeping duplication between dashboard, lead detail, and task flows
