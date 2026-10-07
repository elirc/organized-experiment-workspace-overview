# How A Junior Should Review This Project

Review the CRM by tracing business behavior, not just UI screens.

Ask:

- where does lead conversion logic live?
- where are ownership and role checks enforced?
- what events get added to the timeline when state changes?
- could duplicate merge behavior accidentally drop history?

## Where the answers are

- **Lead conversion logic** lives entirely in `convertLead` (`src/modules/crm/service.ts:293-372`). The action (`actions.ts:68-76`) only reads the id, calls it, and revalidates.
- **Ownership and role checks** are in the service, using helpers from `src/modules/auth/session.ts`: `canWriteOwnedRecords` for creating leads, tasks and notes (`service.ts:190`, `:231`, `:254`), `canEditOwnedRecord` for completing tasks and converting leads (`:280`, `:305`), and `canManageAdmin` for pipeline stages (`:375`). Reads filter by owner for sales reps in most list functions.
- **Timeline events** are written by `appendActivityEvent` after each successful write: `lead.created` (`service.ts:219`), `task.created` (`:250`), `note.added` (`:269`), `task.completed` (`:290`), `lead.converted` (`:371`). The lead page shows only events whose `entityType` is `lead` (`getLeadDetail`, `service.ts:122`), so a task created from the lead page, which is logged against the task, does not appear in that lead's timeline.
- **Duplicate merge** does not exist in the code yet, so there is no history to drop. The question is still a good one to ask of any future merge design.

## Questions that find real issues here

Each of these leads to something confirmed in the code. Try to find it before reading the answer.

1. Do all list and search paths apply the same sales-rep filter? No: `globalSearch` leads and companies (`service.ts:170-171`) and dashboard `recentActivity` (`:68`) do not.
2. Do all write paths check ownership of the record they attach to? No: `createTask` and `addNote` check only the role.
3. Is the "already converted" check safe under double submit? No: the guard and the writes are separate queue entries.
4. What does the user see when the service throws? The framework error screen; there is no `error.tsx`.
5. Is every helper in `session.ts` used? No: `isReadOnlyUser` (line 41) is never called.
6. Is the session tamper-proof? No: the cookie value is the raw user id (`session.ts:24`).

## How to write the review comment

Point at the line, state the impact for a specific role, and propose the smallest fix. For example: "`service.ts:170`: `globalSearch` does not apply the sales-rep owner filter that `listLeads` applies at line 88, so Jordan can see the names and summaries of Avery's leads in search. Suggest reusing the same predicate."
