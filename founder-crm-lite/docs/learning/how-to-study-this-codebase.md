# How To Study This Codebase

Study the CRM in passes:

1. product goals and roles
2. architecture decisions
3. one feature flow such as lead conversion
4. one cross-cutting concern such as activity logging or permissions

Do not start by opening random UI files. Start with the docs and then trace a user story end to end.

## Pass 1: product goals and roles

**Goal:** describe the three roles and what each may change.

Read `docs/architecture/00-project-goals.md`, then `src/modules/auth/demo-users.ts` (three seeded users, lines 11-32) and the helpers in `src/modules/auth/session.ts` (lines 37-55).

**Check:** which role can add a pipeline stage? Only `founder_admin`, via `canManageAdmin` (`session.ts:37-39`), enforced in `addPipelineStage` (`service.ts:375`).

## Pass 2: architecture decisions

**Goal:** match each accepted decision (CRM-ADR-001 to 005 in `docs/architecture/01-major-decisions-log.md`) to a folder or file.

**Check:** CRM-ADR-003 (file-backed JSON behind typed repositories) maps to `src/server/json-store.ts` and `src/modules/crm/repository.ts`. Can you name the pages in `src/app` that skip the service and read the repository directly? There are two: `leads/new/page.tsx:8` and `settings/page.tsx:8`.

## Pass 3: one feature flow, lead conversion

**Goal:** narrate the conversion from button to JSON file.

Path: `leads/[leadId]/page.tsx:30-37` (form) to `actions.ts:68-76` (`convertLeadAction`) to `service.ts:293-372` (`convertLead`) to five repository writes to `data/crm-db.json`.

**Check:** what stops a second conversion? The `convertedAt` guard at `service.ts:301`, plus the page hiding the button (`page.tsx:30`). Then ask the harder question: is that guard safe against two submits at the same moment? It is not, because the check and the writes are not in one `updateCrmDatabase` call. The lead is read at line 294, and the five writes at lines 361-371 are separate queue entries, so two requests that both read before either writes will both pass line 301 and create two deals.

## Pass 4: one cross-cutting concern

Pick activity logging or permissions.

- **Activity logging.** Every write in `service.ts` ends with `appendActivityEvent` (`repository.ts:14`), except `addPipelineStage`. Event types used: `lead.created`, `task.created`, `note.added`, `task.completed`, `lead.converted`.
- **Permissions.** Make a table of every service write and the helper it calls. You will find that `createTask` and `addNote` check only the role (`service.ts:231`, `:254`), while `completeTask` and `convertLead` check ownership.

**Check:** which admin change leaves no trace in the activity timeline? Adding a pipeline stage (`service.ts:374-392` has no `appendActivityEvent`).
