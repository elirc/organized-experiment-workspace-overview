# Auth And Permissions Notes

This file will track authentication and CRM-specific authorization.

Key roles:

- Founder/Admin
- Sales Rep
- Read-Only Analyst

Key concerns:

- route protection
- ownership checks
- shared record visibility
- admin-only settings
- export permissions

## Current status

Accepted strategy:

- seeded demo users authenticate through a cookie-based session
- all meaningful permissions are enforced server-side
- UI visibility follows permissions, but does not replace server enforcement

## Important distinction

Authentication answers "who are you?"

Authorization answers "what may you do to this specific record?"

For this CRM, ownership and role policy checks are the real complexity and should be reviewed more closely than the login mechanism itself.
