# Domain Model Notes

This file will track the CRM domain model for:

- users and roles
- leads
- companies
- contacts
- deals and pipeline stages
- tasks
- notes
- activity events
- saved views
- imports and import errors

## Early modeling concerns

- How much of lead conversion should be transactional and explicit?
- Which timeline events are immutable history versus editable notes?
- How do ownership and shared visibility interact?
- How do duplicate merges preserve history without destroying auditability?

## Current status

Implemented in the current codebase with file-backed persistence and typed modules.

## Implemented model shape

The current model lives primarily in `src/modules/crm/types.ts` and `data/crm-db.json`.

Core entities:

- `Lead`
- `Company`
- `Contact`
- `Deal`
- `Task`
- `Note`
- `ActivityEvent`
- `SavedView`
- `CrmSettings`

## Important modeling choices

- `Lead` is distinct from `Contact` and `Company`, which makes conversion explicit rather than magical.
- `ActivityEvent` is separate from `Note`, which prevents user-authored narrative text from being confused with immutable system history.
- `Deal` carries `stage`, `value`, and `watcherIds`, while timeline activity for stage changes is recorded separately.
- `Task` uses `linkedEntityType` plus `linkedEntityId`, which is a practical polymorphic link for a CRUD-heavy internal tool.

## Teaching note

A junior engineer often collapses notes, comments, and audit events into one generic "activity" record too early. Stronger modeling keeps authored content and system history distinct because they behave differently in review, permissions, and future reporting.

## Checked against the code (2026-10-06)

Type locations in `src/modules/crm/types.ts`: `LeadStatus` 3, `CompanyStatus` 11, `DealStage` 12, `TaskStatus` 21, `TaskPriority` 22, `EntityType` 23, `CrmUser` 25, `Lead` 31, `Company` 51, `Contact` 67, `Deal` 83, `Task` 102, `Note` 116, `ActivityEvent` 126, `SavedView` 136, `CrmSettings` 145, `CrmDatabase` 151.

The list at the top of this file promises "imports and import errors". There is no import type, no import data in `data/crm-db.json`, and no import code under `src/`. Treat that bullet as a plan.

How the "early modeling concerns" turned out:

- **How transactional is lead conversion?** Not at all. `convertLead` (`src/modules/crm/service.ts:293-372`) builds a company, a contact and a deal in memory, then saves them with five separate repository calls (lines 361-371), each its own `updateJsonFile`. A failure part-way leaves orphaned records, and the "already converted" guard (line 301) runs on a read taken before any of those writes.
- **Which timeline events are immutable?** All of them, by omission: the repository has `appendActivityEvent` and `appendNote` (`repository.ts:14`, `:21`) and nothing that edits or deletes either. Notes are not editable either, even though `Note` has an `updatedAt` field (`types.ts:123`).
- **How do ownership and shared visibility interact?** Ownership is one `ownerId` per record. Sales reps are filtered to their own leads, deals and tasks in most reads (`service.ts:57-59`, `:88`, `:132`, `:155`, `:397`). There is no shared-visibility model: `Deal.watcherIds` (`types.ts:99`) is always written as `[]` (`service.ts:358`) and never read, and `SavedView.isShared` (`types.ts:142`) is never read.
- **How do duplicate merges preserve history?** There is no merge code yet.

On the "Important modeling choices" list:

- "`Deal` carries `stage`, `value`, and `watcherIds`, while timeline activity for stage changes is recorded separately." The fields exist, but no code changes a deal's stage, so no stage-change event is ever recorded. Deals are only created, by `convertLead`, always at `"Discovery"` (`service.ts:348`).
- `DealStage` (`types.ts:12-19`) is a closed union of seven names, but `addPipelineStage` stores any 3-to-40-character string by casting it (`stageName as DealStage`, `service.ts:380` and `:388`). After an admin adds a stage, the JSON holds a value the type says cannot exist. A reviewer should ask whether stages are data (then the type should be `string`) or code (then the settings form should not exist).
- `LeadStatus` includes `"Converted"`, and `leadSchema` accepts it on create (`schemas.ts:9`). A lead created with that status still has `convertedAt: null` (`service.ts:214`), so the lead page still offers the Convert button, which is gated on `convertedAt` (`leads/[leadId]/page.tsx:30`). The status field and the timestamp can disagree.

**Check:** which `Lead` fields does no code path ever set to a non-null value? Answer: `lastContactedAt` and `archivedAt`, both written as `null` in `createLead` (`service.ts:213`, `:215`) and never changed. `lastContactedAt` is still displayed (`leads/page.tsx:83`).
