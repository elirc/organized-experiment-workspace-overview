# Codebase Study Path

This file gives you a practical reading order for the workspace and explains how the most important files interact.

The goal is not to read every file mechanically. The goal is to learn how a stronger engineer builds a mental model of a codebase quickly and accurately.

## How this guide was verified

This guide was re-checked against the code in this repository on 2026-10-06 (import commit `3846cdb`).

- Every path named below exists in this repo. Every function name listed under a "Functions to study" heading was found by search in the file it is attributed to.
- Line references use the form `path:line` and point at this repo's files. If you edit a file, the numbers will drift; search for the function name instead.
- There are no automated tests and no `node_modules` in this workspace. Nothing was installed, built, or run while this guide was written. Every claim comes from reading the code. Where the guide predicts runtime behavior (for example, what a double submit does), that prediction is reasoned from the code path it cites, not observed output. Confirming it yourself is one of the exercises.
- Statements the code does not support were corrected in place. The main corrections: the CRM shell is not role-aware for navigation, the feedback board has no "guest" role value, and visibility in the feedback board is enforced on reads but not on most mutations.

Each step below now ends with a **Goal** (what you should be able to explain afterwards) and a **Check** (a question you answer by reading code, with the location of the answer). Do not move to the next step until you can answer the Check without looking.

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

**Goal:** name the three roles, the five accepted decisions (CRM-ADR-001 to CRM-ADR-005 in `01-major-decisions-log.md`), and the one tradeoff the docs call intentional (file-backed persistence, `09-future-extension-risks.md`).

**Check:** which ADR says where validation lives, and what does it choose? Answer: CRM-ADR-005, "Zod schemas at the server boundary plus light client-side constraints". Then confirm it in code: `founder-crm-lite/src/modules/crm/actions.ts:11` calls `leadSchema.parse`.

Read the docs critically. Some of them describe intent rather than the code. For example, `03-domain-model-notes.md` says stage-change activity "is recorded separately", but there is no deal-stage mutation anywhere in `src/` (search for `stage` in `src/modules/crm/actions.ts`: only `addPipelineStageAction`, which edits the list of stages, not a deal).

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

Where things are:

| Concept | Type definition | Seed rows in `data/crm-db.json` |
| --- | --- | --- |
| `Lead` | `types.ts:31` | 3 |
| `Company` | `types.ts:51` | 1 |
| `Contact` | `types.ts:67` | 1 |
| `Deal` | `types.ts:83` | 2 |
| `Task` | `types.ts:102` | 2 |
| `Note` | `types.ts:116` | 2 |
| `ActivityEvent` | `types.ts:126` | 3 |
| `SavedView` | `types.ts:136` | 2 |
| `CrmSettings` | `types.ts:145` | object with `pipelineStages`, `leadSources`, `tags` |
| `CrmDatabase` (the whole file) | `types.ts:151` | 3 users |

(Counts are the array lengths in `founder-crm-lite/data/crm-db.json`; open the file and count them yourself.)

A fact worth noticing: `SavedView` is defined and seeded, but no file under `src/` reads `savedViews` except the type itself (`types.ts:160`). It is modeled, not implemented. The same is true of imports and duplicate merge, which the docs list as "partial"; there is no import or merge code in `src/` at all.

**Goal:** explain why `Note` and `ActivityEvent` are separate types, and why `Task` links to other records with `linkedEntityType` plus `linkedEntityId` instead of a foreign key per entity.

**Check:** what pipeline stages does the seed data define, and in what order? Answer: `Discovery`, `Qualified Opportunity`, `Demo`, `Proposal`, `Negotiation`, `Won`, `Lost`. You will need this order in Step 6, because `addPipelineStage` assumes the last two entries are the closed stages.

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

The exact locations:

- `session.ts:5` names the cookie `crm_demo_user`. `session.ts:7-10` (`getCurrentUser`) reads that cookie and looks the value up with `getDemoUserById` (`demo-users.ts:35`).
- `session.ts:12-20` (`requireUser`) redirects to `/login` when the lookup fails.
- `session.ts:22-30` (`setDemoSession`) stores the raw user id as the cookie value: `httpOnly`, `sameSite: "lax"`, `secure: false`, no signature.
- `src/middleware.ts:5-11` only checks that *some* `crm_demo_user` cookie exists. The real identity check is `requireUser`, called by `src/app/(app)/layout.tsx:5` for every page in the `(app)` group.
- The four policy helpers are at `session.ts:37`, `:41`, `:45` and `:49`.

Two verified observations to keep in mind:

1. **The session cookie is unsigned.** The cookie value is the user id itself, and the three ids are in `demo-users.ts:11-32`. Anyone who sets `crm_demo_user=user-founder` in their browser becomes the founder admin. That is acceptable for a seeded demo, but it is the first thing to replace before any real deployment.
2. **`isReadOnlyUser` is defined but never called.** Search for it: the only hit is its definition at `session.ts:41`. The analyst is still blocked from writing, but only because `canWriteOwnedRecords` (`session.ts:45-47`) lists the other two roles. The read-only rule exists in two forms, and only one of them is used.

**Goal:** be able to say, for each role, which writes it may perform, and point at the line that decides it.

**Check:** a sales rep owns lead A, and lead B belongs to the founder. Which of these does `canEditOwnedRecord` allow: complete a task owned by the rep, convert lead B? Answer: the task yes, lead B no. `session.ts:54` returns true for a sales rep only when `ownerId === user.id`.

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

What the code actually does:

| Action (`actions.ts`) | Line | Validates with | Calls |
| --- | --- | --- | --- |
| `createLeadAction` | 9 | `leadSchema.parse` (line 11) | `createLead` |
| `addNoteAction` | 30 | `noteSchema.parse` (line 32) | `addNote` |
| `createTaskAction` | 43 | `taskSchema.parse` (line 45) | `createTask` |
| `completeTaskAction` | 60 | none, `String(formData.get("taskId"))` | `completeTask` |
| `convertLeadAction` | 68 | none, `String(formData.get("leadId"))` | `convertLead` |
| `addPipelineStageAction` | 78 | `settingStageSchema.parse` (line 80) | `addPipelineStage` |

So "server actions validate with Zod" is true for four of six actions. The other two pass an id straight through; the service then fails with `"Task not found."` or `"Lead not found."` if it is wrong.

Two verified consequences:

- **Validation failures are not handled.** `.parse` throws a `ZodError`. No action catches it, and neither app has an `error.tsx` file anywhere under `src/app`. A too-short lead name (`leadSchema` requires `min(2)`, `schemas.ts:4`) is therefore shown with Next.js's generic error screen instead of a field message. The same applies to every `throw new Error(...)` in the service. Treat "errors become friendly form feedback" as missing, not as done.
- **One revalidation path is wrong for some entity types.** `actions.ts:39` revalidates `` `/${parsed.entityType}s` ``. For `lead` that is `/leads`, but for `company` it is `/companys`, a route that does not exist. Today only the lead page posts notes, so the bug is latent.

**Goal:** for each action, know whether input is schema-validated and which paths are revalidated.

**Check:** what happens if you submit the "Add stage" form with the name `QA`? Answer: `settingStageSchema` requires 3 to 40 characters (`schemas.ts:33`), so `.parse` at `actions.ts:80` throws and you see an error page. Nothing is written.

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

How the write path works (`founder-crm-lite/src/server/json-store.ts`):

- `writeQueue` (line 4) is a module-level `Map` from file path to the last pending write.
- `updateJsonFile` (lines 26-41) chains each new read-modify-write onto the previous promise for the same file (line 31), so two updates in the same Node process never interleave. Line 39 stores `next.catch(() => undefined)` so one failed update does not block the queue forever.
- `readJsonFile` (line 14) is *not* queued. A read can run while a write is in progress.

This queue protects one `updateJsonFile` call. It does not protect a service that reads with `getCrmDatabase()`, makes a decision, and then writes with a separate repository call. That pattern is common in `service.ts` (see Step 6 and the findings table). The queue also does nothing across processes; two `next start` instances on the same file would overwrite each other.

The repository (`repository.ts`) has one function per write shape. Note the asymmetry: `saveLead` (line 28) and `saveTask` (line 38) upsert, but `saveCompany`, `saveContact` and `saveDeal` (lines 48, 55, 62) always prepend. Calling `saveDeal` twice with the same deal creates two rows.

**Goal:** explain exactly what the write queue protects and what it does not.

**Check:** 50 concurrent `appendVote` calls against one file in one process: how many should survive? Answer: all 50, because each is a single queued `updateJsonFile`, and each queued updater re-reads the file (line 34) after the previous write finished. Now: two concurrent `convertLead` calls for one lead? Answer: by the code, two deals are possible, because the `convertedAt` guard (`service.ts:301`) runs on a read taken at line 294, outside the queue. The queue orders the writes but never re-checks the guard.

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

Where each function lives in `founder-crm-lite/src/modules/crm/service.ts`, and what it checks:

| Function | Line | Permission check | Scope filter for `sales_rep` |
| --- | --- | --- | --- |
| `getDashboardData` | 55 | none needed (read) | leads, deals, tasks yes; `recentActivity` (line 68) no |
| `listLeads` | 83 | none needed (read) | yes (line 88) |
| `getLeadDetail` | 105 | throws for another rep's lead (line 113-115) | yes |
| `listDeals` | 127 | read | yes (line 132) |
| `listCompanies` | 142 | read | no (takes no user at all) |
| `listTasks` | 152 | read | yes (line 155) |
| `globalSearch` | 162 | read | deals yes (line 173); leads and companies no (lines 170-171) |
| `createLead` | 178 | `canWriteOwnedRecords` + rep must own (lines 190-196) | n/a |
| `createTask` | 222 | `canWriteOwnedRecords` only (line 231) | n/a |
| `addNote` | 253 | `canWriteOwnedRecords` only (line 254) | n/a |
| `completeTask` | 272 | `canEditOwnedRecord` on the task owner (line 280) | n/a |
| `convertLead` | 293 | already-converted check (301), `canEditOwnedRecord` (305) | n/a |
| `addPipelineStage` | 374 | `canManageAdmin` (line 375) | n/a |
| `exportableLeads` | 394 | read | yes (line 397) |

So "permissions are enforced before mutation" is true, but the checks are uneven:

- `createLead` enforces ownership; `createTask` and `addNote` do not. A sales rep can attach a note or a task to any lead id, including one owned by someone else, and `createTask` accepts any `ownerId` from the form (the lead page fills it from a hidden input at `leads/[leadId]/page.tsx:84`).
- `globalSearch` returns every lead whose name, email or summary matches, even for a sales rep who cannot open them in `listLeads`. Clicking such a result reaches `getLeadDetail`, which throws.
- `getDashboardData` shows the latest eight activity events for everyone, regardless of ownership.
- `dueTodayCount` (line 64) counts every task that is not completed. It ignores `dueDate`, so the variable name overstates what it measures. The dashboard label, "Tasks due / active" (`(app)/page.tsx:46`), is more honest than the variable name.

`convertLead` is the richest function. Read it in this order: lookups and guards (lines 294-307), the three new records (company 309-323, contact 325-340, deal 342-359), then five separate writes (lines 361-371). The guards run on a snapshot read at line 294; the writes happen later in separate queued updates. Two submits that both read the lead before either write lands will both pass the `convertedAt` check and create two companies, two contacts and two deals. A partial failure between line 361 and line 371 leaves orphaned records. The deal value formula is `18000 + leadScore * 120` (line 349), so a score-50 lead becomes a 24,000 deal.

`addPipelineStage` (lines 374-392) inserts the new stage before the last two entries (line 388), which only works because the seed list ends with `Won`, `Lost`.

**Goal:** for any mutation, say which policy helper guards it and whether the guard looks at the target record's owner.

**Check:** can the analyst complete a task from the Tasks page? Answer: the page shows a Complete button to everyone (`tasks/page.tsx:44-50`), but `completeTask` calls `canEditOwnedRecord` (line 280), which returns false for `analyst`, so the action throws and the analyst sees an error page. The UI and the server disagree; the server wins.

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
- how much (or how little) the shell knows about roles
- presentation helpers that do not own domain behavior

Correction to an earlier version of this guide: the shell is only lightly role-aware. `app-shell.tsx` is a client component (`"use client"`, line 1). Its `navItems` list (lines 8-16) is the same for every role, so the analyst and the sales rep both see a Settings link. The only role-specific output is the role label at line 45. Role-specific UI happens inside pages instead, for example `settings/page.tsx:9` (`canManageAdmin`) decides whether to show the add-stage form, and `leads/[leadId]/page.tsx:19-20` decides whether to show the convert, task and note forms.

**Goal:** explain why `AppShell` receives the user as a prop from the server layout instead of fetching it itself.

**Check:** which file guarantees that `/companies` is only rendered for a signed-in user, given that `companies/page.tsx` never calls `requireUser`? Answer: `src/app/(app)/layout.tsx:5`, because every page in the `(app)` route group renders inside that layout.

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

#### Trace A: convert a lead, with line numbers

1. `leads/[leadId]/page.tsx:11` calls `requireUser`, then `:13` calls `getLeadDetail(user, leadId)`. A missing lead returns `null` and the page calls `notFound()` (`:15-17`). Another rep's lead makes `getLeadDetail` throw (`service.ts:113-115`), which shows an error page, not a 404 or 403.
2. `page.tsx:19` computes `canEdit`. The convert form renders only if `canEdit && !detail.lead.convertedAt` (`:30`). It posts a hidden `leadId` (`:32`) to `convertLeadAction`.
3. `actions.ts:68-76`: `requireUser`, read `leadId` as a string, call `convertLead`, revalidate `/leads`, `/companies`, `/deals`, then redirect back to the lead.
4. `service.ts:293-372`: guards, three new records, five writes, one `lead.converted` activity event.
5. `repository.ts`: `saveCompany` (48), `saveContact` (55), `saveDeal` (62), `saveLead` (28), `appendActivityEvent` (14). Each one is a separate `updateJsonFile` call.
6. `data/crm-db.json` now has one more company, contact and deal, and the lead has `status: "Converted"` and a `companyId`.

#### Trace B: add a note

`page.tsx:126-138` renders the note form only when `canWriteOwnedRecords(user)` is true (`:20`), posting hidden `entityType=lead` and `entityId`. `addNoteAction` (`actions.ts:30-41`) parses with `noteSchema` (body 3 to 2000 characters, `schemas.ts:19`), then `addNote` (`service.ts:253-270`) checks only the role, writes the note (`appendNote`, `repository.ts:21`) and a `note.added` activity event. The page reads notes back at `service.ts:120`.

#### Trace C: export leads as CSV

The dashboard (`(app)/page.tsx:25`) and the lead list (`leads/page.tsx:31`) both link to `/api/exports/leads`. `route.ts:6-9` returns `401` if there is no user (this route uses `getCurrentUser`, not `requireUser`, because an API route should not redirect). `exportableLeads` (`service.ts:394-407`) applies the sales-rep filter. `route.ts:13` builds each cell with `JSON.stringify`. That escapes an embedded quote as `\"`, while CSV readers expect `""`, so a name like `O"Brien` will not round-trip cleanly. Values that start with `=` are passed through unchanged, which spreadsheet tools may treat as formulas.

**Goal:** draw Trace A from memory, including the five separate writes.

**Check:** after converting a lead, which pages show fresh data without a manual refresh, and which might not? Answer: `/leads`, `/companies`, `/deals` and the lead itself are revalidated (`actions.ts:72-75`). The dashboard `/` is not revalidated, so its counts can lag until the next request that revalidates it.

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

Two pages break the "pages only call services" rule: `leads/new/page.tsx:8` and `settings/page.tsx:8` both call `getCrmDatabase()` from the repository directly to fill dropdowns and lists. That is a small shortcut, but it is exactly the kind a reviewer should notice, because it means a future database change touches page files too.

**Goal:** sort the nine files into "reads through a service", "reads the repository directly", and "API route".

**Check:** which page builds its owner dropdown differently for a sales rep? Answer: `leads/new/page.tsx:9` limits `selectableOwners` to the rep. The server repeats the rule at `service.ts:194-196`, so a forged `ownerId` is still rejected.

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

**Goal:** name the five accepted decisions (FB-ADR-001 to FB-ADR-005) and say which of them is about public versus internal content.

**Check:** the docs list "creating and editing posts" as a data flow (`04-data-flow-notes.md`). Is there an edit-post flow? Answer: no. `actions.ts` exports nine actions and none edits a post's title or body. Treat that line as a plan, not a description.

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

Where things are in `customer-feedback-board/src/modules/feedback/types.ts`: `PostStatus` (line 3), `PostVisibility` (4), `FlagReason` (5), `FeedbackPost` (13), `Vote` (31), `Comment` (38), `Follow` (49), `ModerationFlag` (68), `ModerationAction` (77), `MergeHistory` (86), `OfficialUpdate` (94), `InternalNote` (102), `Notification` (110), `FeedbackSettings` (119), `FeedbackDatabase` (126).

The seed file holds 4 users, 3 posts (all `public`), 3 votes, 1 comment, 1 follow, 1 open flag, 1 moderation action, 0 merge history rows, 1 official update, 1 internal note and 1 notification.

Fields that exist but are never changed by any code path (verified by searching `src/`):

- `FeedbackPost.hiddenAt` and `commentsLocked` are read (`service.ts:43`, `:182`) but only ever set to their defaults (`service.ts:144-145`). There is no hide or lock action.
- `ModerationFlag.status` is only ever written as `"open"` (`service.ts:220`). No code resolves a flag, so the moderation center's open-flag list only grows.
- `Notification.isRead` is only ever written as `false`. There is no mark-as-read action.
- `FeedbackSettings.allowVoting` and `allowGuestBrowsing` are displayed on the settings page (`settings/page.tsx:20-21`) but no service reads them. Setting `allowVoting` to `false` in the JSON would not stop voting.

**Goal:** separate the fields that drive behavior today from the fields that only exist in the model.

**Check:** a moderator wants to hide an abusive post. Which function would they call? Answer: none exists. `postVisibleToUser` (`service.ts:42-52`) honors `hiddenAt`, but nothing sets it.

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

Correction: there is no `guest` role value. `FeedbackRole` (`demo-users.ts:1`) is `customer | moderator | product_manager | admin`. A guest is simply `user === null`, which is why `getCurrentUser` returns `DemoUser | null` and why `canModerate`, `canManageRoadmap` and `canManageSettings` all accept `null` (`session.ts:43-53`).

The exact locations in `customer-feedback-board/src/modules/auth/session.ts`:

- line 5: cookie name `feedback_demo_user`
- lines 7-10: `getCurrentUser`, a lookup of the raw cookie value
- lines 12-18: `requireUser`, redirect to `/login`
- lines 20-26: `requireRole(roles)`, redirect to `/` (not an error) when the role does not match
- lines 28-36: `setDemoSession`, raw user id, `httpOnly`, `sameSite: "lax"`, `secure: false`, unsigned
- lines 43-53: the three predicates

Unlike the CRM, this app has no `middleware.ts`. Every page decides for itself: public pages call `getCurrentUser`, `new/page.tsx:9-12` and `notifications/page.tsx:9-12` redirect guests manually, and `dashboard`, `moderation` and `settings` call `requireRole` on their first line.

The same unsigned-cookie observation as in the CRM applies: setting `feedback_demo_user=fb-user-admin` makes the browser the admin (`demo-users.ts:14`).

Defense in depth is good here. For the PM-only actions, the role is checked twice: `requireRole(["product_manager", "admin"])` in the action (`actions.ts:62`, `:73`, `:83`) and `canManageRoadmap` again in the service (`service.ts:225`, `:254`, `:270`).

**Goal:** map each page to the auth call it makes on its first line.

**Check:** a customer opens `/dashboard`. What happens, and where? Answer: `dashboard/page.tsx:8` calls `requireRole(["moderator", "product_manager", "admin"])`, which redirects to `/` (`session.ts:22-24`). The service check in `getDashboardData` (`service.ts:345-347`) is never reached.

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

The full table (`customer-feedback-board/src/modules/feedback/actions.ts`):

| Action | Line | Auth | Validation |
| --- | --- | --- | --- |
| `createPostAction` | 9 | `requireUser` | `postSchema` |
| `toggleVoteAction` | 23 | `requireUser` | none (raw `postId`) |
| `addCommentAction` | 31 | `requireUser` | `commentSchema` |
| `toggleFollowAction` | 42 | `requireUser` | none (raw `postId`) |
| `flagPostAction` | 50 | `requireUser` | `flagSchema` |
| `addOfficialResponseAction` | 61 | `requireRole(["product_manager", "admin"])` | `internalNoteSchema` (reused) |
| `addInternalNoteAction` | 72 | `requireRole(["product_manager", "admin"])` | `internalNoteSchema` |
| `changeStatusAction` | 82 | `requireRole(["product_manager", "admin"])` | `statusSchema` |
| `mergeDuplicateAction` | 94 | `requireRole(["moderator", "product_manager", "admin"])` | `mergeSchema` |

Things to notice:

- Official responses are validated with `internalNoteSchema` (line 63). It works because both need a post id and a 3-to-1200-character body, but the name tells a future reader the wrong story. A dedicated `officialResponseSchema` would make the intent clear.
- As in the CRM, `.parse` failures and service `throw`s are not caught and there is no `error.tsx`, so a 1-character comment produces the framework error screen.
- `addCommentAction` revalidates only `/` (line 39), not the post page the comment was written on. The post page is dynamic and re-renders on the next request anyway, but the revalidation calls are not a reliable list of "what changed".

**Goal:** for each action, know whether the role check happens in the action, the service, or both.

**Check:** which mutation requires login but no role, and also skips both schema validation and any post lookup? Answer: `toggleFollowAction` (line 42) calling `toggleFollow` (`service.ts:198-211`). It will store a follow for any string, including a post id that does not exist.

### Step 5: Understand persistence and auditability

Read:

1. `customer-feedback-board/src/server/json-store.ts`
2. `customer-feedback-board/src/modules/feedback/repository.ts`

What to focus on:

- repositories wrap storage operations
- actions do not directly touch files
- moderation and notification records have their own append paths

`customer-feedback-board/src/server/json-store.ts` is identical in logic to the CRM version (per-file promise queue, unqueued reads). The repository (`repository.ts`) is append-only apart from `removeVote` (line 31) and `removeFollow` (line 46). Status changes and merges go through the generic `updateFeedbackDatabase` (line 21) from the service.

**Goal:** list every repository function and say whether it appends, removes, or replaces.

**Check:** `toggleVote` reads the votes at `service.ts:160`, decides at `:166`, and then calls `appendVote` or `removeVote`. What happens on a double click? Answer: both requests can read "no vote yet" before either append lands, so the user can end up with two votes. Nothing in `appendVote` (`repository.ts:27-29`) looks for an existing vote. One-vote-per-user is a convention of the toggle, not an invariant of the store.

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

Locations in `customer-feedback-board/src/modules/feedback/service.ts`: `slugify` (34), `postVisibleToUser` (42), `getBoardHome` (54), `getPostDetail` (89), `createPost` (126), `toggleVote` (159), `addComment` (179), `toggleFollow` (198), `flagPost` (213), `addOfficialResponse` (224), `addInternalNote` (253), `changePostStatus` (269), `mergeDuplicate` (317), `getDashboardData` (344), `getModerationCenter` (371), `getNotifications` (387).

How well the "What to notice" claims hold up, checked line by line:

- **"Visibility checks are not left to UI only."** True for reads: `getBoardHome` (line 59) and `getPostDetail` (line 93) both call `postVisibleToUser`, and internal notes are only returned to PMs and admins (lines 114-119). Not true for writes: `toggleVote`, `addComment`, `toggleFollow` and `flagPost` never call `postVisibleToUser`. A signed-in customer who knows an internal post's id can vote on it, comment on it, follow it and flag it, even though they cannot see it.
- **"Moderation is modeled as explicit behavior."** Partly. Status changes write a `ModerationAction` (lines 294-302). Merges write a `MergeHistory` row (lines 335-341) but no `ModerationAction`, so a merge never appears on the post's moderation timeline (`getPostDetail` reads only `moderationActions`, line 120). Flags are created but never resolved.
- **"Notifications are tied to meaningful workflow changes."** True for official responses (lines 239-250) and status changes (lines 304-314): every follower gets a notification. Merges notify nobody.
- **"Duplicate merge is not treated like a cosmetic UI action."** It is a real state change (lines 326-333 mark the source `Duplicate` and set `duplicateOfPostId`). But it does not check that either post exists, that the target is not itself a duplicate, or move votes and follows to the target. The only guard is `sourcePostId === targetPostId` (line 322).

Other verified details:

- `createPost` forces customers' posts to `public` (line 142) whatever the form sends. The form at `new/page.tsx` offers an "Internal" option to everyone, and the server quietly overrides it for customers. That is correct server-side enforcement with a misleading UI.
- `slugify` (line 34-36) does not check for collisions. Two posts titled "Dark mode please" get the same slug, and `getPostDetail` returns the first match, which is the newest because `createPost` prepends (line 153). A title made only of punctuation, such as `!!!!` (it passes the `min(4)` length check), produces an empty slug and a redirect to `/post/`. Trace `slugify` by hand on both inputs to see why.
- `changePostStatus` (lines 269-315) writes the status, then re-reads the database (line 288), then appends the moderation action and one notification per follower as separate writes. If it fails part-way, the status has changed but the audit row is missing.
- `getDashboardData` counts posts by status over all posts, including internal ones (line 361), but `topPosts` only considers public posts (line 352).

**Goal:** for each function, say whether it calls `postVisibleToUser`, a role predicate, both, or neither.

**Check:** which two service mutations perform no existence check on the post id at all? Answer: `toggleFollow` (198-211) and `flagPost` (213-222). `toggleVote` and `addComment` at least look the post up (lines 161, 181).

### Step 7: Understand how the UI is composed

Read:

1. `customer-feedback-board/src/components/site-shell.tsx`
2. `customer-feedback-board/src/components/page-header.tsx`
3. `customer-feedback-board/src/components/status-badge.tsx`
4. `customer-feedback-board/src/components/timeline.tsx`

Why:

- these files show the shared presentation layer
- they should not own core moderation or visibility logic

Unlike the CRM, there is no route-group layout here. Each page wraps itself in `<SiteShell user={user}>`, so every page must fetch the user itself. `site-shell.tsx:46` is where the sign-out form lives.

**Goal:** explain why the feedback board needs `SiteShell` on every page while the CRM uses one `(app)/layout.tsx`.

**Check:** which UI elements on the post page are shown only to PMs and admins? Answer: the status, official response and internal note forms (`post/[slug]/page.tsx:120-163`, gated by `roadmapEditor` from line 20) and the internal-notes panel (`:167-180`). Moderators see only the "Moderation access" note (`:182-187`).

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

#### Trace D: vote on a post

1. `post/[slug]/page.tsx:12-14`: `getCurrentUser` (may be `null`), then `getPostDetail(user, slug)`. A hidden or internal post returns `null` for a customer, and the page calls `notFound()` (`:16-18`).
2. `:44-51`: if there is a user, a form posts the hidden `postId` to `toggleVoteAction`. The button label comes from `detail.hasVoted` (`service.ts:102`).
3. `actions.ts:23-29`: `requireUser`, raw `postId`, `toggleVote`, revalidate `/` and `/dashboard`.
4. `service.ts:159-177`: refuse if the post is missing or a duplicate, then remove or append.
5. `repository.ts:27` (`appendVote`) or `:31` (`removeVote`).

#### Trace E: change status as a PM

`post/[slug]/page.tsx:122-139` posts `postId` and `status` to `changeStatusAction` (`actions.ts:82-92`), which calls `requireRole`, parses with `statusSchema` and calls `changePostStatus` (`service.ts:269-315`). That writes the post, re-reads, appends a `status.changed` `ModerationAction`, and appends one `Notification` per follower. The new status shows up on `/roadmap` only if it is `Planned`, `In Progress` or `Shipped` (`roadmap/page.tsx:10`).

#### Trace F: merge a duplicate

`moderation/page.tsx:8` requires a moderator, PM or admin. The form (`:44-68`) offers every non-hidden post twice, as source and canonical target. `mergeDuplicateAction` (`actions.ts:94-103`) calls `mergeDuplicate` (`service.ts:317-342`). Afterwards the source disappears from the board, because `getBoardHome` filters out posts with `duplicateOfPostId` (line 60), but its votes stay attached to the source and no one is notified.

**Goal:** be able to say, for Trace D, exactly which line stops a guest from voting.

**Check:** a guest submits the vote form by hand (for example with `curl`). What stops it? Answer: `requireUser` at `actions.ts:24` redirects to `/login`. The page hiding the button (`:44`) is not the protection.

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

Auth entry per page (first lines of each file): `page.tsx:13` and `roadmap/page.tsx:8` use `getCurrentUser` (guests welcome); `new/page.tsx:9-12` and `notifications/page.tsx:9-12` use `getCurrentUser` plus a manual redirect; `dashboard/page.tsx:8` and `moderation/page.tsx:8` use `requireRole` for moderator, PM and admin; `settings/page.tsx:7` uses `requireRole(["admin"])`. Like the CRM, `new/page.tsx:14` and `settings/page.tsx:8` read the repository directly.

**Goal:** sort the seven pages into public, signed-in, staff and admin.

**Check:** can a guest see the roadmap? Answer: yes. `roadmap/page.tsx:8-10` passes a possibly-null user to `getBoardHome`, which returns public posts, then filters to roadmap statuses.

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

### Side-by-side comparison

| Concern | `founder-crm-lite` | `customer-feedback-board` |
| --- | --- | --- |
| Route protection | `src/middleware.ts` (cookie presence) plus `(app)/layout.tsx:5` (`requireUser`) | No middleware; each page calls `getCurrentUser`, `requireUser` or `requireRole` |
| Anonymous users | Not supported; everything outside `/login` redirects | First-class; `user` may be `null` throughout the service |
| Roles | 3 (`demo-users.ts:1`) | 4 (`demo-users.ts:1`), plus `null` for guests |
| Main authorization question | "Do you own this record?" (`canEditOwnedRecord`) | "May you see this post, and may you act on it?" (`postVisibleToUser` plus role predicates) |
| Audit trail | `ActivityEvent` for create, note, task, complete, convert | `ModerationAction` for status changes only; `MergeHistory` for merges |
| Notifications | none | `Notification` per follower on official response and status change |
| Persistence | `json-store.ts` per-file queue, identical in both apps | same |
| Error handling | `throw new Error`, no `error.tsx` | same |
| Tests | none | none |

The reusable part is the layer stack. The domain-specific part is the authorization question: ownership in a CRM, visibility in a public board.

## Fastest way to become stronger from this codebase

Do these in order:

1. Read one project’s `service.ts` fully.
2. Trace one mutation from page to action to service to repository.
3. Identify where auth is enforced.
4. Identify where validation is enforced.
5. Identify where auditability or timeline behavior is created.
6. Ask what would have gone wrong if that logic lived in the page component instead.

If you build that habit, you will start reading code like a stronger mid-level engineer instead of just scanning screens and forms.

## Verified review findings

Each item below was confirmed by reading the code at the listed lines. Severity is judged for a real deployment; for a local study app most of these are acceptable, which is exactly why they are good review practice.

| # | App | Finding | Where | Severity |
| --- | --- | --- | --- | --- |
| 1 | both | Session cookie holds the raw user id with no signature, so any client can pick its own identity | CRM `session.ts:22-30`; FB `session.ts:28-36` | High in production, intended for the demo |
| 2 | CRM | `globalSearch` returns leads without the sales-rep owner filter that `listLeads` applies (companies are unscoped everywhere, including `listCompanies`) | `service.ts:170` vs `:88` | Medium (data exposure) |
| 3 | CRM | Dashboard `recentActivity` is not scoped to the rep's records | `service.ts:68` | Low to medium |
| 4 | CRM | `addNote` and `createTask` check the role only, not ownership of the target record; `createTask` trusts the posted `ownerId` | `service.ts:231`, `:254` | Medium |
| 5 | CRM | `convertLead` checks `convertedAt` on a snapshot and then performs five separate writes; a double submit creates duplicate company, contact and deal | `service.ts:294-371` | Medium |
| 6 | FB | Vote, comment, follow and flag never check post visibility, so internal posts can be acted on by id | `service.ts:159-222` | Medium |
| 7 | FB | `toggleVote` decides outside the write queue; a double submit stores two votes | `service.ts:160-176` | Low to medium |
| 8 | both | Zod `.parse` and service errors are uncaught and there is no `error.tsx`; bad input shows a generic error screen | CRM `actions.ts:11` etc.; FB `actions.ts:11` etc. | Low (UX) |
| 9 | CRM | `isReadOnlyUser` is defined but never called | `session.ts:41` | Low (dead code, two sources of truth) |
| 10 | FB | `allowVoting` and `allowGuestBrowsing` settings are displayed but never enforced | `settings/page.tsx:20-21` | Low |
| 11 | FB | Slugs are not unique; punctuation-only titles give an empty slug | `service.ts:34-36`, `:136` | Low |
| 12 | FB | Merges record `MergeHistory` but no `ModerationAction`, no notification, and no existence checks | `service.ts:317-342` | Low to medium (auditability) |
| 13 | CRM | `addNoteAction` revalidates `/${entityType}s`, which is `/companys` for companies | `actions.ts:39` | Low (latent) |
| 14 | CRM | CSV cells are quoted with `JSON.stringify`, which is not CSV escaping and does not neutralize leading `=` | `api/exports/leads/route.ts:13` | Low |

Patterns checked for and **not** found:

- **Header-trusting auth.** Neither app reads identity from a request header. The CRM middleware sets an `x-pathname` response header (`middleware.ts:14`) but nothing reads it as identity.
- **Lost updates inside one process.** The per-file queue in `json-store.ts` prevents them for single repository calls; the races above come from services that read first and write later.

## Debugging scenarios

Work through these by reading code first. Each answer names the lines that explain the behavior.

1. **"As Jordan (sales rep), I searched for a name, clicked the result, and got an error page."** `globalSearch` returned a lead Jordan does not own (`service.ts:170`). The lead page calls `getLeadDetail`, which throws `"You do not have access to this lead."` (`:113-115`). Fix it at the source: apply the same owner filter in `globalSearch`.
2. **"Priya (analyst) clicked Complete on a task and the app crashed."** The Complete button is rendered for everyone (`tasks/page.tsx:44-50`); `completeTask` refuses analysts (`service.ts:280`) by throwing, and there is no error boundary. Fix either the UI condition or add error handling, ideally both.
3. **"A lead has two deals after one conversion."** Look for a double submit. The guard at `service.ts:301` ran twice on the same snapshot before the writes landed. Check `data/crm-db.json` for two deals with the same `sourceLeadId`.
4. **"I added a pipeline stage and it appeared after Lost."** `addPipelineStage` inserts before the last two items (`service.ts:388`). If someone edited the JSON so the list no longer ends with `Won`, `Lost`, the position is wrong.
5. **"The dashboard still shows the old count after I completed a task."** `completeTaskAction` revalidates `/tasks` and `/` (`actions.ts:64-65`), so the dashboard should refresh. Remember too that `dueTodayCount` counts all tasks that are not completed, not tasks due today (`service.ts:64`). If the user expected "due today", the number was never measuring that.
6. **"My post's link goes to someone else's post."** Two posts share a slug (`service.ts:136`). `getPostDetail` returns the first one in the array (`:91`), which is the newest.
7. **"A customer's post that they marked Internal is public."** Intended: `createPost` forces customer posts to `public` (`service.ts:142`). The form offers the option anyway (`new/page.tsx`), which is the real bug.
8. **"I set `allowVoting` to false but people can still vote."** No code reads the setting (search `src/` for `allowVoting`: only `settings/page.tsx:21`).
9. **"After a merge, the moderation timeline on the post shows nothing."** `mergeDuplicate` writes `MergeHistory`, but the timeline reads `moderationActions` (`service.ts:120`).
10. **"Changes I make while the dev server runs disappear."** Both stores resolve paths from `process.cwd()` (`json-store.ts:7`). Starting `next dev` from a different directory reads or creates a different `data/*.json`.

## Exercise ladder

Do these in order. Each one has a **Check** you can verify by reading or by a small script.

1. **Locate.** Find every call to `canEditOwnedRecord` in the CRM. **Check:** three call sites outside `session.ts`: `service.ts:280`, `service.ts:305`, `leads/[leadId]/page.tsx:19`.
2. **Explain.** In one paragraph, explain why `getLeadDetail` throws for a forbidden lead but returns `null` for a missing one, and what the user sees in each case. **Check:** `null` becomes `notFound()` (`page.tsx:15-17`); the throw becomes an error page.
3. **Predict.** Before reading `listCompanies` (`service.ts:142`), predict whether a sales rep sees all companies. **Check:** yes; the function takes no user argument.
4. **Design a fix on paper.** Write the owner filter for `globalSearch` leads so it matches `listLeads`. **Check:** your filter should be the same expression as `service.ts:88`.
5. **Design a fix on paper.** Rewrite `convertLead` so the guard and all five writes happen inside one `updateCrmDatabase` callback. **Check:** after your change, a second call must throw `"Lead has already been converted."` because it sees the first call's write.
6. **Visibility.** Add `postVisibleToUser` to `toggleVote`, `addComment`, `toggleFollow` and `flagPost` on paper. **Check:** each function needs the post object first; `toggleFollow` and `flagPost` do not currently fetch it.
7. **Audit.** Decide what `ModerationAction` a merge should write, and which notifications it should send. **Check:** compare your answer with what `changePostStatus` writes at `service.ts:294-314`.
8. **Extract and test.** Copy `slugify` (`service.ts:34-36`) into a `.mjs` file and write a `node --test` case for collisions and empty slugs. **Check:** `slugify("!!!!")` returns `""`.

## What this guide did not do

- It did not install dependencies, build, type-check, lint, or start either app. Statements about what the UI shows are read from the page components, not from screenshots.
- It did not run any tests, because there are none.
- The race conditions in the findings table (5 and 7) are inferred from the order of reads and writes in the cited lines. To see one for yourself, copy `updateJsonFile` and `toggleVote` into a scratch `.mjs` file, point them at a scratch JSON file, and call `toggleVote` twice with `Promise.all`. Predict the result before you run it.
- Line numbers were checked against the files in this repository at import commit `3846cdb`. They will drift as soon as the code changes.
