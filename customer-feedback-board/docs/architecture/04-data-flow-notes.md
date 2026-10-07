# Data Flow Notes

Important flows will include:

- creating and editing posts
- voting and unvoting
- commenting
- moderation actions
- duplicate merging
- following and notifications
- status changes and official responses

## Current status

Data flow shape now follows accepted decisions FB-ADR-002 through FB-ADR-005:

1. Public and authenticated pages read view models through feature services.
2. Mutations happen through server actions.
3. Server actions authenticate the actor, validate input with Zod, and call application services.
4. Services enforce visibility and moderation policies, persist through repositories, and record activity.
5. Revalidation refreshes the affected pages.

## Why this is a good teaching shape

- It keeps public UI simple without hiding backend complexity.
- It creates explicit homes for moderation and visibility rules.
- It makes duplicate merges, official updates, and vote behavior easier to review.

## Checked against the code (2026-10-06)

The five-step shape holds, with these exceptions:

- **Step 1.** `new/page.tsx:14` and `settings/page.tsx:8` read the repository (`getFeedbackDatabase`) directly instead of going through a service.
- **Step 3.** `toggleVoteAction` and `toggleFollowAction` (`actions.ts:23`, `:42`) do not validate with Zod; they pass a raw `postId`. Validation errors from the other actions are thrown and not caught, and there is no `error.tsx`, so the user sees the framework's error screen.
- **Step 4.** Services enforce visibility on reads only. Of the moderation flows, only status changes record a `ModerationAction`.
- **Step 5.** Revalidation lists are partial. `addCommentAction` revalidates only `/` (`actions.ts:39`), not the post page.
- "Creating and **editing** posts": there is no edit flow.

Two flows also write in several steps without a transaction. `changePostStatus` (`service.ts:269-315`) writes the post, then re-reads, then appends the moderation action, then one notification per follower, each as a separate queued write. `addOfficialResponse` (`:224-251`) does the same for the update and its notifications. A failure part-way leaves the earlier writes in place.

Example, with line numbers, for a PM changing a status: `post/[slug]/page.tsx:122` (form) to `actions.ts:82-92` (`requireRole`, `statusSchema`) to `service.ts:269-315` to `repository.ts:21` (`updateFeedbackDatabase`), `:57` (`appendModerationAction`) and `:73` (`appendNotification`) to `data/feedback-db.json`, then revalidation of `/`, `/roadmap` and `/dashboard`.
