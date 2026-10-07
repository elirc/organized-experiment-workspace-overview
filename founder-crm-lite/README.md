# Founder CRM Lite

Founder CRM Lite is a lightweight but realistic CRM for a founder-led startup or small sales team.

It is being built as:

- a practical business CRUD-heavy application
- a study-friendly enterprise-style codebase
- a training project for architecture, review discipline, and AI-assisted development

See the docs under `docs/architecture`, `docs/learning`, and `docs/ai-workflows`.

## What the app does

- **Dashboard** (`src/app/(app)/page.tsx`): open and qualified lead counts, open tasks, open pipeline value, pipeline by stage, recent activity, and a link to the CSV export.
- **Leads** (`src/app/(app)/leads/`): filtered list, create form, and a detail page with notes, follow-up tasks, an activity timeline, and a "Convert lead" button that creates a company, a primary contact and a deal.
- **Deals** (`deals/page.tsx`): pipeline board grouped by the configured stages.
- **Companies** (`companies/page.tsx`): account list with deal and contact counts.
- **Tasks** (`tasks/page.tsx`): follow-up queue with a Complete button.
- **Search** (`search/page.tsx`): one query across leads, companies and deals.
- **Settings** (`settings/page.tsx`): pipeline stages (admins can add one), users, lead sources.
- **CSV export** (`src/app/api/exports/leads/route.ts`): returns `401` without a session.

## Roles

Defined in `src/modules/auth/demo-users.ts` and chosen on `/login`:

| Demo user | Role | Can write | Scope |
| --- | --- | --- | --- |
| Avery Chen (`user-founder`) | `founder_admin` | everything, including pipeline stages | all records |
| Jordan Miles (`user-rep`) | `sales_rep` | leads they own, tasks and notes, convert own leads, complete own tasks | own leads, deals and tasks on most pages |
| Priya Shah (`user-analyst`) | `analyst` | nothing | all records, read only |

The rules live in `src/modules/auth/session.ts` (`canManageAdmin`, `canWriteOwnedRecords`, `canEditOwnedRecord`) and are applied in `src/modules/crm/service.ts`.

## How to read it

Start with `src/modules/crm/service.ts`: it is the business-logic center. Then follow one mutation through `actions.ts`, `service.ts`, `repository.ts` and `src/server/json-store.ts`. The workspace-level [`../CODEBASE-STUDY-PATH.md`](../CODEBASE-STUDY-PATH.md) gives a full reading order with line references, and `docs/learning/file-reading-order.md` gives a shorter one.

## Known limitations (verified in code)

- Unsigned demo cookie: setting `crm_demo_user` to another id switches user (`session.ts:22-30`).
- Sales reps see all matching leads and companies in global search (`service.ts:170-171`) and all recent activity on the dashboard (`service.ts:68`).
- Notes and tasks can be attached to records the user does not own (`service.ts:222-270`).
- Lead conversion is not atomic; a double submit creates duplicate records (`service.ts:293-372`).
- Validation and permission errors show the default error screen; there is no `error.tsx`.
- No automated tests.

## Where the data lives

`data/crm-db.json` is the whole database: users, leads, companies, contacts, deals, tasks, notes, activity events, saved views and settings (the `CrmDatabase` type, `src/modules/crm/types.ts:151`). It is read on every request (`getCrmDatabase`, `src/modules/crm/repository.ts:6`) and rewritten in full on every write (`src/server/json-store.ts:20-24`). The path is resolved from `process.cwd()` (`json-store.ts:7`), so start the dev server from this folder. To reset the demo, restore the file from git.
