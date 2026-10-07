# Frontend Structure Notes

This file will describe the feedback board frontend organization.

Expected areas include:

- public browse and detail pages
- authenticated post creation/editing flows
- moderation tools
- PM/admin controls
- dashboard/analytics views

## Current status

Implemented with thin App Router pages under `src/app` and shared UI helpers under `src/components`.

## Current frontend structure

- `src/app/page.tsx`: public board feed
- `src/app/post/[slug]/page.tsx`: post detail with comments, votes, follows, official updates, and internal notes
- `src/app/new/page.tsx`: authenticated post submission flow
- `src/app/roadmap/page.tsx`: roadmap projection
- `src/app/dashboard/page.tsx`: moderator/PM analytics
- `src/app/moderation/page.tsx`: duplicate-merge and flag center
- `src/app/notifications/page.tsx`: in-app update queue
- `src/app/settings/page.tsx`: admin settings surface
- `src/components/*`: shell, status badges, page headers, and timeline UI

## Teaching note

The page files should answer "what does this page need to show?" The service layer should answer "what business rules and state changes does this flow require?"

## Checked against the code (2026-10-06)

All listed paths exist. Additional facts a reader needs:

- `src/app/login/page.tsx` (51 lines) is the demo login and is missing from the list above.
- There is no shared layout for signed-in pages. Every page wraps its content in `<SiteShell user={user}>` (`src/components/site-shell.tsx`, line 18) and must fetch the user itself.
- How each page authenticates: `page.tsx` and `roadmap/page.tsx` call `getCurrentUser` and allow guests; `new/page.tsx` and `notifications/page.tsx` call `getCurrentUser` and redirect guests to `/login`; `dashboard/page.tsx` and `moderation/page.tsx` call `requireRole(["moderator", "product_manager", "admin"])`; `settings/page.tsx` calls `requireRole(["admin"])`.
- `post/[slug]/page.tsx` hides vote, follow, flag and comment forms from guests (lines 44 and 95) and shows PM/admin forms only when `canManageRoadmap(user)` is true (lines 20, 120). These are display decisions; the actions repeat the checks.
- The new-post form offers an "Internal" visibility option to every signed-in user. The service overrides it to `public` for customers (`service.ts:142`), so the UI promises something the server will not do.
- The settings page is read only. It displays `portalMode`, `allowGuestBrowsing`, `allowVoting` and the status list; there are no forms.
- The only client component is `src/components/site-shell.tsx` (`"use client"`). Every page is a server component, and interactivity is plain HTML forms posting to server actions.
