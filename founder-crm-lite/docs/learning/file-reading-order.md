# File Reading Order

Start with:

1. `docs/architecture/00-project-goals.md`
2. `docs/architecture/01-major-decisions-log.md`
3. `docs/architecture/02-options-considered.md`
4. `docs/learning/build-journal.md`

## Then read the actual code in this order

1. `src/modules/crm/types.ts`
2. `src/modules/crm/schemas.ts`
3. `src/modules/crm/service.ts`
4. `src/modules/crm/actions.ts`
5. `src/modules/crm/repository.ts`
6. `src/modules/auth/session.ts`
7. `src/app/(app)/leads/[leadId]/page.tsx`
8. `src/app/(app)/page.tsx`
9. `src/app/api/exports/leads/route.ts`

## Why this order works

It helps you understand the system from domain model to mutation boundary to UI composition, which is closer to how stronger engineers actually review complex features.

## What to look for in each file

1. **`src/modules/crm/types.ts`** (162 lines). The entity types start at line 31 (`Lead`) and end with `CrmDatabase` at line 151, which is the shape of the whole JSON file. Note `EntityType` (line 23), used for the polymorphic links on notes, tasks and activity events.
2. **`src/modules/crm/schemas.ts`** (34 lines). Four Zod schemas. `leadScore` uses `z.coerce.number()` because form values arrive as strings. Optional text fields accept `""` because an empty input still submits an empty string.
3. **`src/modules/crm/service.ts`** (407 lines). Read the read functions first (`getDashboardData` at 55 to `globalSearch` at 162), then the writes (`createLead` at 178 to `exportableLeads` at 394). For each one, note which permission helper it calls and whether it filters by owner for sales reps.
4. **`src/modules/crm/actions.ts`** (87 lines). Six server actions. Four use a schema; `completeTaskAction` and `convertLeadAction` pass the id straight through.
5. **`src/modules/crm/repository.ts`** (67 lines). One function per write shape, all built on `updateCrmDatabase` (line 10). `saveLead` and `saveTask` upsert; `saveCompany`, `saveContact` and `saveDeal` always prepend.
6. **`src/modules/auth/session.ts`** (55 lines). The cookie session and the four policy helpers. `isReadOnlyUser` (line 41) is never called.
7. **`src/app/(app)/leads/[leadId]/page.tsx`** (154 lines). One page, three forms (convert, task, note), each shown only when the matching helper allows it (lines 19-20).
8. **`src/app/(app)/page.tsx`** (131 lines). The dashboard; a pure consumer of `getDashboardData`.
9. **`src/app/api/exports/leads/route.ts`** (21 lines). The only API route. It returns `401` rather than redirecting, because it is called as a download, not rendered as a page.

Also worth one look: `src/middleware.ts` (20 lines) and `src/server/json-store.ts` (41 lines). The middleware only checks that a session cookie exists; the store serializes writes per file inside one process.

**Check:** after this pass you should be able to answer, without looking, which file decides that a sales rep cannot convert another rep's lead. Answer: `service.ts:305`, using `canEditOwnedRecord` from `session.ts:49`.
