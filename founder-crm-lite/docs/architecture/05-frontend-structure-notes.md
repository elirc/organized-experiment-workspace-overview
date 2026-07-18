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
