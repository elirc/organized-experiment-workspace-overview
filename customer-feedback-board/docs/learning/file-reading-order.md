# File Reading Order

Start with:

1. `docs/architecture/00-project-goals.md`
2. `docs/architecture/01-major-decisions-log.md`
3. `docs/architecture/02-options-considered.md`
4. `docs/learning/build-journal.md`

## Then read the actual code in this order

1. `src/modules/feedback/types.ts`
2. `src/modules/feedback/schemas.ts`
3. `src/modules/feedback/service.ts`
4. `src/modules/feedback/actions.ts`
5. `src/modules/feedback/repository.ts`
6. `src/modules/auth/session.ts`
7. `src/app/post/[slug]/page.tsx`
8. `src/app/page.tsx`
9. `src/app/moderation/page.tsx`

## Why this order works

It helps you learn the domain and policy model before you study how the UI consumes it.

## What to look for in each file

1. **`src/modules/feedback/types.ts`** (141 lines). `PostStatus`, `PostVisibility` and `FlagReason` (lines 3-5), then `FeedbackPost` (line 13) and the records that hang off a post. Notice which fields no code ever changes: `hiddenAt`, `commentsLocked`, flag `status`, notification `isRead`.
2. **`src/modules/feedback/schemas.ts`** (33 lines). Six schemas. There is no schema for votes or follows; those actions take a raw `postId`.
3. **`src/modules/feedback/service.ts`** (390 lines). Start with `postVisibleToUser` (line 42). Then ask, for every later function, whether it calls it. The reads (`getBoardHome` at 54, `getPostDetail` at 89) do; the customer-facing writes (`toggleVote` at 159 to `flagPost` at 213) do not.
4. **`src/modules/feedback/actions.ts`** (103 lines). Nine actions. Five need only a signed-in user; four use `requireRole`.
5. **`src/modules/feedback/repository.ts`** (75 lines). Append functions for each record type, plus `removeVote` and `removeFollow`.
6. **`src/modules/auth/session.ts`** (53 lines). Cookie session, `requireUser`, `requireRole` (redirects to `/` on a wrong role), and three null-safe role predicates.
7. **`src/app/post/[slug]/page.tsx`** (190 lines). The richest page: public actions for any signed-in user (lines 44-66), PM/admin forms (120-163), internal notes (167-180).
8. **`src/app/page.tsx`** (139 lines). The public board. Reads `q`, `status` and `category` from the query string and passes a possibly-null user to `getBoardHome`.
9. **`src/app/moderation/page.tsx`** (73 lines). Open flags and the merge form. Both selects list every non-hidden post, including posts already marked duplicate.

Also worth one look: `src/server/json-store.ts` (41 lines), the same per-file write queue as the CRM. There is no `middleware.ts` in this app.

**Check:** after this pass you should be able to say which function would have to change if internal posts must never be votable. Answer: `toggleVote` (`service.ts:159-177`) needs a `postVisibleToUser` check after it finds the post.
