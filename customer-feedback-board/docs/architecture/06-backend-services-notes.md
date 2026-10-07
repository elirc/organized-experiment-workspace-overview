# Backend Services Notes

Expected service concerns:

- feedback post services
- vote services
- comment and moderation services
- duplicate merge services
- notification/follow services
- taxonomy/settings services

## Current status

Accepted direction:

- application services orchestrate post, vote, comment, follow, and moderation use cases
- repositories encapsulate file-backed persistence
- policy helpers enforce role and visibility rules
- moderation and official-update events are treated as core business behavior

## Checked against the code (2026-10-06)

There is one service module, `src/modules/feedback/service.ts` (390 lines), not one service per concern. Its functions:

| Concern | Functions (line) | Guard |
| --- | --- | --- |
| Visibility | `postVisibleToUser` (42) | hides `hiddenAt` posts; internal posts only for staff |
| Board reads | `getBoardHome` (54), `getPostDetail` (89) | `postVisibleToUser` |
| Posts | `createPost` (126) | caller must be signed in; customers forced to `public` |
| Votes | `toggleVote` (159) | post exists and is not a duplicate |
| Comments | `addComment` (179) | post exists and comments not locked |
| Follows | `toggleFollow` (198) | none |
| Flags | `flagPost` (213) | none |
| Official updates | `addOfficialResponse` (224) | `canManageRoadmap` |
| Internal notes | `addInternalNote` (253) | `canManageRoadmap` |
| Status | `changePostStatus` (269) | `canManageRoadmap` |
| Merges | `mergeDuplicate` (317) | `canModerate`; source differs from target |
| Staff views | `getDashboardData` (344), `getModerationCenter` (371) | `canModerate` |
| Notifications | `getNotifications` (387) | filtered to the current user |

The repository (`repository.ts`, 75 lines) has no business rules. The JSON store (`src/server/json-store.ts`) serializes `updateJsonFile` calls per file inside one process (lines 26-41), but the service often reads first and writes later, so decisions such as "has this user already voted?" (`service.ts:166`) are not protected by that queue.

There are no taxonomy or settings services: categories, tags and settings are read straight from the database object, and nothing writes them.
