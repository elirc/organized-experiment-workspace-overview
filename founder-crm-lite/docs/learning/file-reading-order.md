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
