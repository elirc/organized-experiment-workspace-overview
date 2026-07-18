# Future Extension Risks

Likely CRM stress points:

- multi-tenant expansion
- custom pipelines per workspace
- richer lead scoring rules
- more advanced import orchestration
- email/calendar integrations
- forecasting and analytics growth

This file will record where our initial design is pragmatic versus where it may need refactoring later.

## Known intentional tradeoff

File-backed persistence is a local-development teaching choice, not a production deployment recommendation. If the app grows, the first likely refactor is replacing repository adapters with a relational database while preserving the service and policy layers.
