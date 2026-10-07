# Domain Model Notes

This file will track the feedback platform domain model for:

- users and roles
- feedback posts
- votes
- comments
- categories and tags
- follows and notifications
- moderation flags and actions
- merge history
- official updates and internal notes

## Early modeling concerns

- how duplicate merging preserves votes, comments, follows, and auditability
- how public status and private internal notes relate without leaking data
- where moderation history should live

## Current status

Implemented in the current codebase with file-backed persistence and typed modules.

## Implemented model shape

The current model lives primarily in `src/modules/feedback/types.ts` and `data/feedback-db.json`.

Core entities:

- `FeedbackPost`
- `Vote`
- `Comment`
- `Follow`
- `ModerationFlag`
- `ModerationAction`
- `MergeHistory`
- `OfficialUpdate`
- `InternalNote`
- `Notification`
- `FeedbackSettings`

## Important modeling choices

- `FeedbackPost` carries public-facing status and visibility, while internal commentary stays in separate `InternalNote` records.
- `Vote` and `Follow` are separate relationship entities, which keeps notification and duplicate-handling behavior explicit.
- `ModerationFlag`, `ModerationAction`, and `MergeHistory` are distinct because flags are user reports, actions are staff interventions, and merges are a specialized audit event.

## Teaching note

A junior engineer often tries to collapse roadmap updates, moderation history, and internal notes into one generic timeline table. Stronger modeling keeps those concepts separate because they have different permissions and product meaning.

## Checked against the code (2026-10-06)

Type locations in `src/modules/feedback/types.ts`: `FeedbackPost` 13, `Vote` 31, `Comment` 38, `Follow` 49, `Category` 56, `Tag` 63, `ModerationFlag` 68, `ModerationAction` 77, `MergeHistory` 86, `OfficialUpdate` 94, `InternalNote` 102, `Notification` 110, `FeedbackSettings` 119, `FeedbackDatabase` 126. `Category` and `Tag` are also core entities, though the list above omits them.

How the "early modeling concerns" turned out:

- **Does duplicate merging preserve votes, comments and follows?** It leaves them where they were. `mergeDuplicate` (`service.ts:317-342`) changes only the source post and adds a `MergeHistory` row; votes, comments and follows stay attached to the source, which is then hidden from the board.
- **Do public status and internal notes stay separate without leaking?** On reads, yes: internal notes are returned only to PMs and admins (`service.ts:114-119`). Internal *posts* are a different matter: they are hidden from customers on reads (`postVisibleToUser`, `service.ts:42-52`) but not protected on vote, comment, follow or flag.
- **Where does moderation history live?** In `moderationActions`, but only status changes write there (`service.ts:294-302`). Merges go to `mergeHistory`, which no page displays, and flags go to `flags`.

Fields modeled but never changed by any code path: `FeedbackPost.hiddenAt`, `FeedbackPost.commentsLocked`, `Comment.isHidden`, `Comment.parentCommentId` (always `null`), `ModerationFlag.status` (always `"open"`), `Notification.isRead` (always `false`), and the `allowVoting` and `allowGuestBrowsing` settings. They describe the intended product; treat them as design, not behavior.
