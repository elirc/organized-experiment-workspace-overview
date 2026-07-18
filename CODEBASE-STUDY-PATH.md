# Codebase Study Path

This file gives you a practical reading order for the workspace and explains how the most important files interact.

The goal is not to read every file mechanically. The goal is to learn how a stronger engineer builds a mental model of a codebase quickly and accurately.

## How to study this workspace

There are two separate applications here:

1. `founder-crm-lite`
2. `customer-feedback-board`

Do not try to deeply study both at the same time.

Study one project all the way through first, then use the second one as a comparison exercise.

Recommended order:

1. Study `founder-crm-lite`
2. Study `customer-feedback-board`
3. Compare the two architectures

Why this order:

- The CRM is easier to understand as a classic internal business app.
- The feedback board adds more public/private visibility and moderation nuance.
- Comparing them later teaches you which architectural patterns are reusable and which are domain-specific.

## How a stronger engineer reads a codebase

A weaker reading strategy:

- opens random components
- reads UI before domain model
- treats all files as equally important

A stronger reading strategy:

1. Understand the product and roles.
2. Understand the domain model.
3. Understand auth and permissions.
4. Understand where business logic lives.
5. Understand the mutation boundary.
6. Understand how pages compose the underlying services.

That is the pattern used below.

---

## Study Path: Founder CRM Lite

### Step 1: Understand the product and architecture intent

Read these first:

1. `founder-crm-lite/docs/architecture/00-project-goals.md`
2. `founder-crm-lite/docs/architecture/01-major-decisions-log.md`
3. `founder-crm-lite/docs/architecture/03-domain-model-notes.md`
4. `founder-crm-lite/docs/learning/build-journal.md`

Why:

- These tell you what the CRM is trying to be.
- They explain which tradeoffs were intentional.
- They prevent you from misreading training choices, such as file-backed persistence, as production recommendations.

### Step 2: Understand the core domain model

Read:

1. `founder-crm-lite/src/modules/crm/types.ts`
2. `founder-crm-lite/data/crm-db.json`

Why these files matter:

- `types.ts` defines the language of the app.
- `crm-db.json` shows how those concepts look in persisted state.

What to focus on:

- the difference between `Lead`, `Contact`, `Company`, and `Deal`
- why `Task`, `Note`, and `ActivityEvent` are separate
- how `SavedView` and `CrmSettings` fit the product

What a junior often misses:

- the domain model is not just “data shape”
- it defines which workflows are easy or awkward later

### Step 3: Understand auth and permission boundaries

Read:

1. `founder-crm-lite/src/modules/auth/demo-users.ts`
2. `founder-crm-lite/src/modules/auth/session.ts`

Why these files matter:

- They define the roles.
- They show how session lookup works.
- They contain the first level of policy helpers.

What to focus on:

- `requireUser`
- `canManageAdmin`
- `canWriteOwnedRecords`
- `canEditOwnedRecord`

How these files interact:

- pages call `requireUser`
- services use policy helpers to enforce ownership and role rules
- UI may hide buttons, but server-side checks are still the real enforcement

### Step 4: Understand validation at the mutation boundary

Read:

1. `founder-crm-lite/src/modules/crm/schemas.ts`
2. `founder-crm-lite/src/modules/crm/actions.ts`

Why these files matter:

- `schemas.ts` defines trusted input shape
- `actions.ts` is the mutation entry point from forms

What to focus on:

- server actions should parse and validate
- server actions should not carry heavy business logic
- revalidation and redirects happen here, not deep inside services

### Step 5: Understand persistence and replaceability

Read:

1. `founder-crm-lite/src/server/json-store.ts`
2. `founder-crm-lite/src/modules/crm/repository.ts`

Why these files matter:

- `json-store.ts` is the low-level persistence utility
- `repository.ts` is the domain-aware storage layer

What to focus on:

- business logic does not directly read and write files
- services talk to repositories, not raw JSON files
- this is the seam you would replace with Prisma/Postgres later

### Step 6: Understand the real business logic center

Read carefully:

1. `founder-crm-lite/src/modules/crm/service.ts`

This is the single most important CRM file to study first in depth.

Why:

- It contains the real application behavior.
- It orchestrates reads, writes, permissions, and activity logging.
- It shows where the “meaning” of the app lives.

Functions to study in order:

1. `getDashboardData`
2. `listLeads`
3. `getLeadDetail`
4. `createLead`
5. `createTask`
6. `addNote`
7. `completeTask`
8. `convertLead`
9. `addPipelineStage`
10. `exportableLeads`

What to notice:

- reads and writes are separated clearly
- permissions are enforced before mutation
- conversion is explicit, not hidden inside UI code
- activity logging is part of the business flow

What a mid-level engineer should notice:

- this file is doing orchestration, not rendering
- this is where reviewers should spend serious time

### Step 7: Understand how the UI consumes the service layer

Read:

1. `founder-crm-lite/src/app/(app)/layout.tsx`
2. `founder-crm-lite/src/components/app-shell.tsx`
3. `founder-crm-lite/src/components/page-header.tsx`
4. `founder-crm-lite/src/components/status-badge.tsx`
5. `founder-crm-lite/src/components/timeline-list.tsx`

Why these files matter:

- They show the reusable UI shell and common presentation primitives.
- They should stay light and mostly presentation-focused.

What to focus on:

- layout composition
- role-aware shell behavior
- presentation helpers that do not own domain behavior

### Step 8: Trace one end-to-end feature

Best first trace:

1. `founder-crm-lite/src/app/(app)/leads/[leadId]/page.tsx`
2. `founder-crm-lite/src/modules/crm/actions.ts`
3. `founder-crm-lite/src/modules/crm/service.ts`
4. `founder-crm-lite/src/modules/crm/repository.ts`
5. `founder-crm-lite/data/crm-db.json`

Trace this exact flow:

- open a lead detail page
- add a note
- add a task
- convert the lead

What interaction pattern to look for:

1. page renders data from service
2. form posts to server action
3. server action validates input
4. service enforces permissions and business rules
5. repository persists state
6. activity history is appended
7. page is revalidated

That is one of the most important real-world patterns in this repo.

### Step 9: Read supporting flows

Next files:

1. `founder-crm-lite/src/app/(app)/page.tsx`
2. `founder-crm-lite/src/app/(app)/leads/page.tsx`
3. `founder-crm-lite/src/app/(app)/leads/new/page.tsx`
4. `founder-crm-lite/src/app/(app)/tasks/page.tsx`
5. `founder-crm-lite/src/app/(app)/deals/page.tsx`
6. `founder-crm-lite/src/app/(app)/companies/page.tsx`
7. `founder-crm-lite/src/app/(app)/search/page.tsx`
8. `founder-crm-lite/src/app/(app)/settings/page.tsx`
9. `founder-crm-lite/src/app/api/exports/leads/route.ts`

Why:

- These files show how the same architecture scales across multiple page types.

### Most important CRM files overall

If you only had time to study 8 files:

1. `founder-crm-lite/src/modules/crm/types.ts`
2. `founder-crm-lite/src/modules/auth/session.ts`
3. `founder-crm-lite/src/modules/crm/schemas.ts`
4. `founder-crm-lite/src/modules/crm/actions.ts`
5. `founder-crm-lite/src/modules/crm/repository.ts`
6. `founder-crm-lite/src/modules/crm/service.ts`
7. `founder-crm-lite/src/app/(app)/leads/[leadId]/page.tsx`
8. `founder-crm-lite/data/crm-db.json`

---

## Study Path: Customer Feedback Board

### Step 1: Understand the product and architecture intent

Read:

1. `customer-feedback-board/docs/architecture/00-project-goals.md`
2. `customer-feedback-board/docs/architecture/01-major-decisions-log.md`
3. `customer-feedback-board/docs/architecture/03-domain-model-notes.md`
4. `customer-feedback-board/docs/learning/build-journal.md`

Why:

- This app looks simple from the outside, but its real complexity is visibility, moderation, and roadmap state.

### Step 2: Understand the core domain model

Read:

1. `customer-feedback-board/src/modules/feedback/types.ts`
2. `customer-feedback-board/data/feedback-db.json`

What to focus on:

- `FeedbackPost`
- `Vote`
- `Comment`
- `Follow`
- `ModerationFlag`
- `ModerationAction`
- `MergeHistory`
- `OfficialUpdate`
- `InternalNote`
- `Notification`

What a stronger engineer notices:

- public content and internal workflow are related, but not the same
- the model reflects that separation explicitly

### Step 3: Understand auth and role boundaries

Read:

1. `customer-feedback-board/src/modules/auth/demo-users.ts`
2. `customer-feedback-board/src/modules/auth/session.ts`

Why these files matter:

- They define guest, customer, moderator, PM, and admin capabilities.

What to focus on:

- `getCurrentUser`
- `requireUser`
- `requireRole`
- `canModerate`
- `canManageRoadmap`
- `canManageSettings`

How these files interact:

- pages may allow public reads
- mutation actions require authenticated users or specific roles
- services use permission helpers to protect important operations

### Step 4: Understand validation and mutation boundaries

Read:

1. `customer-feedback-board/src/modules/feedback/schemas.ts`
2. `customer-feedback-board/src/modules/feedback/actions.ts`

Why:

- `schemas.ts` defines trusted input shapes
- `actions.ts` is where UI submissions enter the backend flow

What to focus on:

- which actions require login
- which actions require specific roles
- how revalidation happens after mutations

### Step 5: Understand persistence and auditability

Read:

1. `customer-feedback-board/src/server/json-store.ts`
2. `customer-feedback-board/src/modules/feedback/repository.ts`

What to focus on:

- repositories wrap storage operations
- actions do not directly touch files
- moderation and notification records have their own append paths

### Step 6: Understand the real business logic center

Read carefully:

1. `customer-feedback-board/src/modules/feedback/service.ts`

This is the single most important feedback-board file to study first in depth.

Functions to study in order:

1. `getBoardHome`
2. `getPostDetail`
3. `createPost`
4. `toggleVote`
5. `addComment`
6. `toggleFollow`
7. `flagPost`
8. `addOfficialResponse`
9. `addInternalNote`
10. `changePostStatus`
11. `mergeDuplicate`
12. `getDashboardData`
13. `getModerationCenter`

What to notice:

- visibility checks are not left to UI only
- moderation is modeled as explicit behavior
- notifications are tied to meaningful workflow changes
- duplicate merge is not treated like a cosmetic UI action

What a senior engineer worries about here:

- whether public/private content stays consistently enforced
- whether status changes and moderation remain auditable

### Step 7: Understand how the UI is composed

Read:

1. `customer-feedback-board/src/components/site-shell.tsx`
2. `customer-feedback-board/src/components/page-header.tsx`
3. `customer-feedback-board/src/components/status-badge.tsx`
4. `customer-feedback-board/src/components/timeline.tsx`

Why:

- these files show the shared presentation layer
- they should not own core moderation or visibility logic

### Step 8: Trace one end-to-end feature

Best first trace:

1. `customer-feedback-board/src/app/post/[slug]/page.tsx`
2. `customer-feedback-board/src/modules/feedback/actions.ts`
3. `customer-feedback-board/src/modules/feedback/service.ts`
4. `customer-feedback-board/src/modules/feedback/repository.ts`
5. `customer-feedback-board/data/feedback-db.json`

Trace these flows:

- vote on a post
- add a comment
- add an official response
- add an internal note
- change status

What interaction pattern to look for:

1. page renders a mixed public/internal view model
2. form submits to server action
3. action authenticates and validates
4. service enforces visibility and role rules
5. repository persists state
6. related notifications or moderation actions are recorded
7. page revalidation reflects the change

### Step 9: Read supporting flows

Next files:

1. `customer-feedback-board/src/app/page.tsx`
2. `customer-feedback-board/src/app/new/page.tsx`
3. `customer-feedback-board/src/app/roadmap/page.tsx`
4. `customer-feedback-board/src/app/dashboard/page.tsx`
5. `customer-feedback-board/src/app/moderation/page.tsx`
6. `customer-feedback-board/src/app/notifications/page.tsx`
7. `customer-feedback-board/src/app/settings/page.tsx`

Why:

- They show how public browse flows differ from internal operator flows.

### Most important Feedback Board files overall

If you only had time to study 8 files:

1. `customer-feedback-board/src/modules/feedback/types.ts`
2. `customer-feedback-board/src/modules/auth/session.ts`
3. `customer-feedback-board/src/modules/feedback/schemas.ts`
4. `customer-feedback-board/src/modules/feedback/actions.ts`
5. `customer-feedback-board/src/modules/feedback/repository.ts`
6. `customer-feedback-board/src/modules/feedback/service.ts`
7. `customer-feedback-board/src/app/post/[slug]/page.tsx`
8. `customer-feedback-board/data/feedback-db.json`

---

## How the major layers interact

This interaction model is shared by both projects:

1. `types.ts`
   Defines the domain language.

2. `schemas.ts`
   Defines trusted input at mutation boundaries.

3. `session.ts`
   Defines who the actor is and which broad permissions exist.

4. `actions.ts`
   Accepts form input, authenticates, validates, calls services, and triggers revalidation/redirects.

5. `service.ts`
   Contains the main business logic and orchestration.

6. `repository.ts`
   Encapsulates domain-aware persistence access.

7. `json-store.ts`
   Handles low-level file I/O.

8. `app/*.tsx`
   Renders pages and wires forms to server actions.

That is the most important architecture pattern in this workspace.

## Fastest way to become stronger from this codebase

Do these in order:

1. Read one project’s `service.ts` fully.
2. Trace one mutation from page to action to service to repository.
3. Identify where auth is enforced.
4. Identify where validation is enforced.
5. Identify where auditability or timeline behavior is created.
6. Ask what would have gone wrong if that logic lived in the page component instead.

If you build that habit, you will start reading code like a stronger mid-level engineer instead of just scanning screens and forms.
