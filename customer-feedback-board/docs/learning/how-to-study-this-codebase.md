# How To Study This Codebase

Study the feedback board in passes:

1. product goals and role model
2. architecture decisions
3. one public flow such as creating and voting on a post
4. one internal flow such as duplicate merge or moderation

Pay special attention to where public-facing simplicity hides backend complexity.

## Pass 1: product goals and role model

**Goal:** describe what a guest, a customer, a moderator, a PM and an admin can each do.

Read `docs/architecture/00-project-goals.md`, then `src/modules/auth/demo-users.ts` (four seeded users, lines 10-15) and the predicates in `src/modules/auth/session.ts` (lines 43-53). A guest is `user === null`, not a role value.

**Check:** can a moderator read internal notes? No. `getPostDetail` returns internal notes only when `canManageRoadmap(user) || canManageSettings(user)` (`service.ts:114`), and `canManageRoadmap` excludes moderators (`session.ts:47-49`). A moderator can, however, see internal posts, because `postVisibleToUser` accepts `canModerate` (`service.ts:51`).

## Pass 2: architecture decisions

**Goal:** match FB-ADR-001 to 005 in `docs/architecture/01-major-decisions-log.md` to files.

**Check:** which decision explains why there is a `repository.ts` between `service.ts` and `json-store.ts`? FB-ADR-003, the persistence strategy; the docs' stated reason is a replacement seam for a real database later (`docs/architecture/09-future-extension-risks.md`).

## Pass 3: a public flow, creating and voting on a post

**Goal:** narrate both flows from form to JSON.

Create: `new/page.tsx` form to `createPostAction` (`actions.ts:9-21`, `postSchema`) to `createPost` (`service.ts:126-157`) to one `updateFeedbackDatabase` write, then a redirect to `/post/<slug>`.

Vote: `post/[slug]/page.tsx:46-51` to `toggleVoteAction` (`actions.ts:23-29`) to `toggleVote` (`service.ts:159-177`) to `appendVote` or `removeVote`.

**Check:** where is one-vote-per-user enforced? Only by the toggle: `toggleVote` looks for an existing vote (`service.ts:166`) before deciding. The store itself does not prevent duplicates: `appendVote` (`repository.ts:27-29`) prepends unconditionally. Two concurrent calls by the same user can both see "no vote" at line 166 and both append.

## Pass 4: an internal flow, duplicate merge or status change

**Goal:** list every record written by `changePostStatus` and by `mergeDuplicate`.

- `changePostStatus` (`service.ts:269-315`): the post, one `ModerationAction`, one `Notification` per follower.
- `mergeDuplicate` (`service.ts:317-342`): the source post (status `Duplicate`, `duplicateOfPostId`), one `MergeHistory` row.

**Check:** after a merge, where would a PM look to see who merged the post? Not on the post page: its timeline reads `moderationActions` (`service.ts:120-122`), and merges do not write one. The only record is in `mergeHistory` in `data/feedback-db.json`, which no page displays.
