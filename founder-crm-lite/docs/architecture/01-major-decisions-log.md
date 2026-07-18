# Major Decisions Log

| ID | Stage | Status | Chosen option | Why it matters | Related docs |
| --- | --- | --- | --- | --- | --- |
| CRM-ADR-001 | Project/app structure | accepted | Standalone Next.js modular monolith inside its own project folder | Sets the boundaries for UI, backend services, auth, and persistence without coupling the CRM to the other project | `02-options-considered.md`, `04-data-flow-notes.md`, `05-frontend-structure-notes.md`, `06-backend-services-notes.md` |
| CRM-ADR-002 | Internal application architecture | accepted | Next.js App Router modular monolith with feature modules, server components for reads, server actions for writes, and explicit service/repository layers | Determines where business logic lives and how UI, policies, and persistence stay separated | `02-options-considered.md`, `04-data-flow-notes.md`, `05-frontend-structure-notes.md`, `06-backend-services-notes.md` |
| CRM-ADR-003 | Persistence strategy | accepted | File-backed JSON repository adapter behind typed repositories | Provides working local persistence now while preserving a clean replacement seam for a real database later | `03-domain-model-notes.md`, `04-data-flow-notes.md`, `06-backend-services-notes.md`, `09-future-extension-risks.md` |
| CRM-ADR-004 | Auth and authorization strategy | accepted | Cookie-based demo session with seeded users and server-side role/ownership policy checks | Lets the app enforce realistic permissions without external identity setup, while keeping auth decisions explicit and reviewable | `02-options-considered.md`, `07-auth-and-permissions-notes.md`, `04-data-flow-notes.md` |
| CRM-ADR-005 | Validation strategy | accepted | Zod schemas at the server boundary plus light client-side constraints | Keeps validation consistent and type-safe while avoiding business-rule duplication in UI code | `04-data-flow-notes.md`, `06-backend-services-notes.md`, `08-testing-strategy-notes.md` |

## CRM-ADR-001 notes

- Chosen in the initial setup stage.
- We evaluated multiple ways to organize the CRM within the shared workspace.
- We chose an isolated project folder with its own docs and later its own runtime/tooling setup.
- This keeps the product easy to study, review, and evolve independently.

## CRM-ADR-002 notes

- We considered a server-actions-first thin architecture, a modular monolith with explicit services, and a separate API service.
- We chose the modular monolith because it gives us realistic code boundaries without separate-service overhead.

## CRM-ADR-003 notes

- We considered in-memory fixtures, file-backed persistence, and a full relational database setup.
- We chose file-backed persistence to keep the app runnable immediately while still modeling repositories and domain boundaries clearly.

## CRM-ADR-004 notes

- We considered external auth integration, demo-cookie sessions, and no-auth prototypes.
- We chose demo-cookie sessions because they keep the learning focus on permission boundaries without blocking on identity-provider setup.

## CRM-ADR-005 notes

- We considered component-local validation, schema validation at boundaries, and ad hoc validation spread across services.
- We chose Zod at the boundary because it is easier to test, reason about, and reuse.
