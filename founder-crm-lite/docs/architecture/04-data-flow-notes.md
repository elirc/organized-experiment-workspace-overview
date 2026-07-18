# Data Flow Notes

The CRM should eventually have a clear flow from UI to backend entry point to domain/application services to persistence.

## Important concerns

- create/edit/convert lead flows
- deal stage changes
- ownership changes
- task completion
- timeline event creation
- import preview and validation

## Current status

Data flow shape now follows accepted decisions CRM-ADR-002 through CRM-ADR-005:

1. Server components read from feature services that assemble view models.
2. Forms submit to server actions.
3. Server actions authenticate the user, validate input with Zod, and call application services.
4. Services enforce policies, persist data through repositories, and append activity events.
5. Revalidation refreshes the relevant pages.

## Why this is a good teaching shape

- It keeps React components focused on presentation and interaction.
- It gives business rules explicit homes.
- It makes it easier to review state changes, especially around conversion, ownership changes, and timeline events.
