# Feature Slices

Planned feedback-board slices:

- completed: scaffolding and architecture
- completed: domain model and file-backed persistence
- completed: guest/public browsing plus demo auth and role permissions
- completed: feedback posts and voting
- completed: comments and follows
- completed: moderation flags and duplicate merging
- completed: roadmap statuses and official updates
- completed: analytics dashboard
- completed: notifications and admin settings surface

## What the code shows (checked 2026-10-06)

"Completed" above means a working end-to-end path exists. Several slices are narrower than their names suggest:

| Slice | Built | Not built |
| --- | --- | --- |
| Public browsing and demo auth | board, post detail and roadmap work for guests; login picks a seeded user | `allowGuestBrowsing` is displayed but never read |
| Posts and voting | create (`createPost`, `service.ts:126`), toggle vote (`:159`) | edit or delete a post; unique slugs; `allowVoting` enforcement; visibility check on vote |
| Comments and follows | add comment (`:179`), toggle follow (`:198`) | edit, hide or reply to comments (`parentCommentId` is always `null`, `:191`); comment locking (`commentsLocked` is never set) |
| Moderation flags and merging | create flag (`:213`), merge (`:317`) | resolve a flag; hide a post; a moderation-timeline entry for merges |
| Roadmap statuses and official updates | status change (`:269`) with audit row and follower notifications; official responses (`:224`) | status-transition rules (any status can move to any other) |
| Analytics dashboard | top public posts, status counts, open flags, recent moderation (`:344`) | trends over time |
| Notifications and settings | list own notifications (`:387`); admin settings page | mark as read; editing any setting |

**Check:** find out whether a PM can move a `Shipped` post back to `Open`. Answer: yes. `statusSchema` accepts any of the seven statuses (`schemas.ts:20-23`) and `changePostStatus` applies whatever it receives.
