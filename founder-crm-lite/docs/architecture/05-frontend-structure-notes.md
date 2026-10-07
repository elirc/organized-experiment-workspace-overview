# Frontend Structure Notes

This file will explain how the CRM frontend is organized once implementation starts.

Expected areas include:

- dashboard pages
- list/detail/create/edit flows
- reusable filter/table patterns
- form modules
- timeline components
- admin/settings pages

## Current status

Implemented with a thin-route pattern under `src/app` and reusable UI helpers under `src/components`.

## Current frontend structure

- `src/app/login/page.tsx`: demo auth entry
- `src/app/(app)/layout.tsx`: protected shell composition
- `src/app/(app)/page.tsx`: dashboard
- `src/app/(app)/leads/*`: lead list, creation, and detail flow
- `src/app/(app)/deals/page.tsx`: pipeline board
- `src/app/(app)/companies/page.tsx`: account list
- `src/app/(app)/tasks/page.tsx`: follow-up queue
- `src/app/(app)/search/page.tsx`: global search
- `src/app/(app)/settings/page.tsx`: admin-oriented configuration surface
- `src/components/*`: shell, badges, page headers, and timeline rendering

## Teaching note

The route files intentionally do not own validation or persistence logic. Their job is to:

- gather params and current-user context
- call feature services
- render UI
- wire forms to server actions

## Checked against the code (2026-10-06)

All listed paths exist. Details a reader needs:

- **Two guards, not one.** `src/middleware.ts` redirects to `/login` when no `crm_demo_user` cookie is present (lines 5-12), but it does not check that the value is a real user. The real check is `requireUser()` in `src/app/(app)/layout.tsx:5`, which wraps every page in the `(app)` group. That is why `companies/page.tsx` can call `listCompanies()` without fetching a user at all.
- **Most pages call `requireUser` again** (for example `page.tsx:9`, `leads/page.tsx:13`, `tasks/page.tsx:9`) because they need the user object to pass to the service. The layout's call protects the route; the page's call gets the data.
- **The shell is not role-aware.** `src/components/app-shell.tsx` is the only client component (`"use client"`, line 1). Its `navItems` (lines 8-16) are the same for every role; the analyst sees a Settings link. Role-specific UI lives in pages: `settings/page.tsx:9` (`canManageAdmin`) and `leads/[leadId]/page.tsx:19-20` (`canEditOwnedRecord`, `canWriteOwnedRecords`).
- **UI and server disagree in one place.** The Tasks page shows a Complete button on every open task to every role (`tasks/page.tsx:44-51`). `completeTask` refuses analysts and other reps' tasks (`service.ts:280`) by throwing. The server is right; the page should hide the button.
- **The API route is outside the protected group.** `src/app/api/exports/leads/route.ts` is still covered by the middleware matcher (`middleware.ts:19`), but it checks the session itself with `getCurrentUser` and returns `401` (lines 6-9), because a download link should not redirect.
- **Components.** `src/components/` has four files: `app-shell.tsx` (57 lines), `page-header.tsx` (19), `status-badge.tsx` (12) and `timeline-list.tsx` (26). None imports a service or repository.

**Check:** if you deleted `src/middleware.ts`, could a visitor with no cookie see `/companies`? Answer: no. `(app)/layout.tsx:5` would still redirect them to `/login`.
