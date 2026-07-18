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
