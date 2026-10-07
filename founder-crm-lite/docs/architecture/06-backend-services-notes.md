# Backend Services Notes

This file will explain the CRM backend service structure.

Expected concerns:

- lead services
- company/contact services
- deal and pipeline services
- task services
- import/export services
- authorization policies
- activity logging

## Current status

Accepted direction:

- application services orchestrate use cases
- repositories encapsulate file-backed persistence
- policy helpers enforce role/ownership rules
- activity logging is treated as part of core business behavior, not an afterthought

## Important teaching note

A junior engineer often places "just a little logic" in form handlers or page files. Stronger teams give core mutations named service functions so reviewers can evaluate business rules in one place.

## Checked against the code (2026-10-06)

There is one service module, `src/modules/crm/service.ts` (407 lines), not one per concern. Its exported functions and the guard each applies:

| Concern | Function (line) | Guard |
| --- | --- | --- |
| Dashboard | `getDashboardData` (55) | sales reps see own leads, deals, tasks; `recentActivity` (line 68) is not scoped |
| Leads | `listLeads` (83), `getLeadDetail` (105), `createLead` (178), `convertLead` (293) | owner filter; detail throws for another rep's lead (113-115); create requires `canWriteOwnedRecords` and rep must own (190-196); convert requires `canEditOwnedRecord` (305) |
| Deals | `listDeals` (127) | owner filter for reps |
| Companies | `listCompanies` (142) | none; takes no user |
| Tasks | `listTasks` (152), `createTask` (222), `completeTask` (272) | owner filter; create checks role only (231); complete checks ownership (280) |
| Notes | `addNote` (253) | role only (254) |
| Search | `globalSearch` (162) | deals filtered for reps (173); leads and companies not (170-171) |
| Settings | `addPipelineStage` (374) | `canManageAdmin` (375) |
| Export | `exportableLeads` (394) | owner filter for reps (397) |

Against the "accepted direction" above:

- **Services orchestrate use cases:** yes. Pages and actions contain no business rules.
- **Repositories encapsulate persistence:** mostly. Two pages read the repository directly (see `04-data-flow-notes.md`). `saveLead` and `saveTask` upsert (`repository.ts:28`, `:38`); `saveCompany`, `saveContact` and `saveDeal` always prepend (`:48`, `:55`, `:62`), so calling one twice duplicates a row.
- **Policy helpers enforce role and ownership rules:** the helpers exist (`src/modules/auth/session.ts:37-55`), but `isReadOnlyUser` (line 41) is never called, and ownership is not checked in `createTask` or `addNote`.
- **Activity logging is core behavior:** every write except `addPipelineStage` appends an event. The events are separate queued writes after the main write, so a crash between them loses the event.

The JSON store (`src/server/json-store.ts:26-41`) serializes `updateJsonFile` calls per file inside one process. It does not protect a service that reads with `getCrmDatabase()`, decides, and writes later. `convertLead` and `completeTask` both follow that read-then-write shape.

**Check:** which service function would you change so a sales rep cannot create a task owned by someone else, and which line in another function shows the pattern to copy? Answer: `createTask` (`service.ts:222`); copy the ownership rule from `createLead` (`service.ts:194-196`).
