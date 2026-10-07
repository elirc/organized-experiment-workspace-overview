# Customer Feedback Board

Customer Feedback Board is a realistic feedback management platform for product teams and users.

It is being built as:

- a public/private feedback portal with moderation and roadmap communication
- a maintainable full-stack application with realistic permission boundaries
- a training project for architecture, review discipline, and AI-assisted development

See the docs under `docs/architecture`, `docs/learning`, and `docs/ai-workflows`.

## What the app does

- **Board** (`src/app/page.tsx`): public feed of posts with search, status and category filters and simple metrics. Guests can browse.
- **Post detail** (`src/app/post/[slug]/page.tsx`): votes, follow, flag as duplicate, comments, official updates, a moderation/roadmap timeline, and for PMs and admins the status, official-response and internal-note forms.
- **New post** (`new/page.tsx`): signed-in users submit an idea. Customers' posts are always public, whatever the form says.
- **Roadmap** (`roadmap/page.tsx`): visible posts in `Planned`, `In Progress` or `Shipped`.
- **Dashboard** (`dashboard/page.tsx`) and **Moderation** (`moderation/page.tsx`): staff only; top posts, status mix, open flags, and the duplicate-merge form.
- **Notifications** (`notifications/page.tsx`): the signed-in user's notifications.
- **Settings** (`settings/page.tsx`): admin only, read-only display of portal settings and statuses.

## Roles

Defined in `src/modules/auth/demo-users.ts`. A guest is a request with no session (`user === null`), not a role value.

| Demo user | Role | Extra abilities |
| --- | --- | --- |
| (none) | guest | browse public posts and the roadmap |
| Noah Garcia (`fb-user-customer`) | `customer` | post, vote, comment, follow, flag |
| Lena Park (`fb-user-moderator`) | `moderator` | see internal posts, dashboard, moderation center, merge duplicates |
| Marco Bell (`fb-user-pm`) | `product_manager` | everything a moderator can, plus status changes, official responses, internal notes |
| Tina Wong (`fb-user-admin`) | `admin` | everything, plus the settings page |

The predicates are `canModerate`, `canManageRoadmap` and `canManageSettings` in `src/modules/auth/session.ts`. Read visibility is decided by `postVisibleToUser` in `src/modules/feedback/service.ts`.

## How to read it

Start with `src/modules/feedback/service.ts`, especially `postVisibleToUser`, `getPostDetail` and `changePostStatus`. Then follow one vote and one status change from the post page through `actions.ts` and `repository.ts`. The workspace-level [`../CODEBASE-STUDY-PATH.md`](../CODEBASE-STUDY-PATH.md) has the full path with line references.

## Known limitations (verified in code)

- Unsigned demo cookie: setting `feedback_demo_user` to another id switches user (`session.ts:28-36`).
- Vote, comment, follow and flag do not check post visibility, so an internal post can be acted on by id (`service.ts:159-222`).
- A double-submitted vote can be stored twice (`service.ts:160-176`).
- Duplicate slugs are possible (`service.ts:34-36`).
- Merges leave no moderation-timeline entry and notify nobody (`service.ts:317-342`).
- `allowVoting` and `allowGuestBrowsing` are displayed but not enforced; flags are never resolved; notifications are never marked read.
- Validation and permission errors show the default error screen. No automated tests.

## Where the data lives

`data/feedback-db.json` is the whole database. It is read on every request (`getFeedbackDatabase`, `src/modules/feedback/repository.ts:17`) and rewritten in full on every write (`src/server/json-store.ts:20-24`). The path is resolved from `process.cwd()` (`json-store.ts:7`), so start the dev server from this folder. To reset the demo, restore the file from git.
