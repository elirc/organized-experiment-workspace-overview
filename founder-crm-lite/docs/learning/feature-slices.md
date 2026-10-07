# Feature Slices

Planned CRM slices:

- completed: scaffolding and architecture
- completed: domain model and file-backed persistence
- completed: demo auth and role/ownership permissions
- completed: leads list, create flow, detail page, note/task support, and conversion flow
- completed: companies summary view
- completed: deals pipeline board
- completed: tasks queue and completion flow
- completed: dashboard and CSV export
- partial: settings and admin tools
- partial: import preview, duplicate merge, and richer saved views

## What the code shows (checked 2026-10-06)

| Slice | Status in code | Evidence |
| --- | --- | --- |
| Leads list, create, detail | built | `leads/page.tsx`, `leads/new/page.tsx`, `leads/[leadId]/page.tsx`; `listLeads`, `createLead`, `getLeadDetail` in `service.ts` |
| Notes and tasks on a lead | built | `addNote` (`service.ts:253`), `createTask` (`:222`) |
| Lead conversion | built | `convertLead` (`service.ts:293`) creates company, contact and deal |
| Companies summary | built, read only | `listCompanies` (`service.ts:142`); no create or edit |
| Deals pipeline board | built, read only | `listDeals` (`service.ts:127`); no stage-change action exists |
| Tasks queue and completion | built | `listTasks` (`:152`), `completeTask` (`:272`) |
| Dashboard and CSV export | built | `getDashboardData` (`:55`), `api/exports/leads/route.ts` |
| Settings | partial | only "add pipeline stage" (`addPipelineStage`, `:374`); users and lead sources are display only |
| Import preview | not started | no import code anywhere in `src/` |
| Duplicate merge | not started | no merge code anywhere in `src/` |
| Saved views | modeled only | `SavedView` type (`types.ts:136`) and two seed rows; nothing reads `savedViews` |
| Contacts | modeled, created by conversion only | `saveContact` is called only from `convertLead`; there is no contacts page |

So "partial" for imports, merge and saved views means "designed in the type model", not "half built". Moving a deal between stages, which a reader might expect from a "pipeline board", is also not implemented.

**Check:** find the one place where a `Contact` is created. Answer: `service.ts:326-340`, inside `convertLead`, saved at line 362.
