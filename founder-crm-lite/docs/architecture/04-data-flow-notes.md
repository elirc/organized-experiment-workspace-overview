# Data Flow Notes

The CRM should eventually have a clear flow from UI to backend entry point to domain/application services to persistence.

## Important concerns

- create/edit/convert lead flows
- deal stage changes
- ownership changes
- task completion
- timeline event creation
- import preview and validation

## Current status

Data flow shape now follows accepted decisions CRM-ADR-002 through CRM-ADR-005:

1. Server components read from feature services that assemble view models.
2. Forms submit to server actions.
3. Server actions authenticate the user, validate input with Zod, and call application services.
4. Services enforce policies, persist data through repositories, and append activity events.
5. Revalidation refreshes the relevant pages.

## Why this is a good teaching shape

- It keeps React components focused on presentation and interaction.
- It gives business rules explicit homes.
- It makes it easier to review state changes, especially around conversion, ownership changes, and timeline events.

## Checked against the code (2026-10-06)

The five-step shape holds for the six server actions in `src/modules/crm/actions.ts`, with these exceptions:

- **Step 1.** `leads/new/page.tsx:8` and `settings/page.tsx:8` call `getCrmDatabase()` from the repository directly to fill dropdowns and lists, instead of going through a service.
- **Step 3.** Four actions validate with Zod (`createLeadAction` line 11, `addNoteAction` 32, `createTaskAction` 45, `addPipelineStageAction` 80). `completeTaskAction` (line 60) and `convertLeadAction` (68) read a raw id with `String(formData.get(...))`. `.parse` throws on bad input and nothing catches it; there is no `error.tsx` under `src/app`, so the user sees the framework's error screen.
- **Step 4.** Policies are enforced, but unevenly: `createTask` and `addNote` check only the role (`service.ts:231`, `:254`), not ownership of the record they attach to. Activity events are appended by every write except `addPipelineStage` (`service.ts:374-392`).
- **Step 5.** Revalidation is per action and partial. `convertLeadAction` revalidates `/leads`, `/companies` and `/deals` (lines 72-74) but not the dashboard `/`. `addNoteAction` revalidates `` `/${parsed.entityType}s` `` (line 39), which is `/companys` for a company note.

Of the "important concerns" listed above, these have no code yet: editing a lead, deal stage changes, ownership changes, and import preview.

Example, with line numbers, for converting a lead: `leads/[leadId]/page.tsx:31-36` (form, hidden `leadId`) to `actions.ts:68-76` (`requireUser`, `convertLead`, three revalidations, redirect) to `service.ts:293-372` to `repository.ts:48` (`saveCompany`), `:55` (`saveContact`), `:62` (`saveDeal`), `:28` (`saveLead`), `:14` (`appendActivityEvent`) to `data/crm-db.json`.

**Check:** name the one mutation whose input is never validated by a schema *and* whose service function does not look up the record first. Answer: none. `completeTask` and `convertLead` both look the record up (`service.ts:274`, `:295`) and throw if it is missing. Compare that with `addNote`, which is schema-validated but never checks that `entityId` exists.
