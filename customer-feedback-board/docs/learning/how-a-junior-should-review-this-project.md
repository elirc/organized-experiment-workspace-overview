# How A Junior Should Review This Project

Review the feedback board by tracing behavior and visibility rules, not just screens.

Ask:

- where is one-vote-per-user enforced?
- where are internal notes hidden from normal users?
- how does duplicate merge preserve context?
- what gets logged when statuses or moderation states change?

## Where the answers are

- **One vote per user** is enforced only by the toggle logic in `toggleVote` (`src/modules/feedback/service.ts:166-176`): if a vote by this user exists it is removed, otherwise one is added. Nothing in `repository.ts` or the JSON store rejects a second vote, so two simultaneous requests can both add one.
- **Internal notes are hidden** in `getPostDetail`, which returns an empty list unless the user is a PM or admin (`service.ts:114-119`). The page also renders the panel only for `canManageRoadmap(user)` (`post/[slug]/page.tsx:167`). Both layers agree.
- **Duplicate merge** marks the source post `Duplicate` and points it at the target (`service.ts:326-333`), and appends a `MergeHistory` row (`:335-341`). It does not move votes, follows or comments, does not check that the posts exist, and does not notify anyone. The source disappears from the board because `getBoardHome` filters out posts with `duplicateOfPostId` (`:60`).
- **Logging on status change**: one `ModerationAction` with `actionType: "status.changed"` (`:294-302`) and one notification per follower (`:304-314`). Merges and flags write no `ModerationAction`.

## Questions that find real issues here

1. Do the write paths respect visibility the way the read paths do? No: `toggleVote`, `addComment`, `toggleFollow` and `flagPost` (`service.ts:159-222`) never call `postVisibleToUser`.
2. Do the settings on the settings page do anything? No: `allowVoting` and `allowGuestBrowsing` are only displayed (`settings/page.tsx:20-21`).
3. Can two posts share a URL? Yes: `slugify` (`service.ts:34-36`) does not check for existing slugs.
4. Can a flag ever be closed? No: flags are only created with `status: "open"` (`service.ts:220`).
5. Is the official-response input validated with the right schema? It uses `internalNoteSchema` (`actions.ts:63`); it works, but the name misleads.
6. Is the session tamper-proof? No: the cookie holds the raw user id (`session.ts:30`).

## How to write the review comment

Point at the line, name the role that is affected, and suggest the smallest fix. For example: "`service.ts:159`: `toggleVote` finds the post but never calls `postVisibleToUser`, so a customer who learns an internal post's id can vote on it. Suggest checking visibility right after the lookup and refusing with the same error as a missing post."
