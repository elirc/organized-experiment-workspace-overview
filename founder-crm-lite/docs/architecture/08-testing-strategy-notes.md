# Testing Strategy Notes

This file will record the CRM testing approach.

Likely targets:

- lead conversion
- duplicate merge behavior
- deal stage transitions
- ownership and permission rules
- import validation
- saved views and filter behavior

## Current status

Current automated verification:

- `npm run typecheck`
- `npm run build`

## Why this is not the full end state

Build and type checks prove that the app compiles and that server/client boundaries are valid, but they do not deeply verify workflow correctness.

## Recommended next tests

- lead conversion service tests
- task-completion permission tests
- export route tests
- page-level smoke tests for login and protected navigation
