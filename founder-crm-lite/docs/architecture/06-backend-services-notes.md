# Backend Services Notes

This file will explain the CRM backend service structure.

Expected concerns:

- lead services
- company/contact services
- deal and pipeline services
- task services
- import/export services
- authorization policies
- activity logging

## Current status

Accepted direction:

- application services orchestrate use cases
- repositories encapsulate file-backed persistence
- policy helpers enforce role/ownership rules
- activity logging is treated as part of core business behavior, not an afterthought

## Important teaching note

A junior engineer often places "just a little logic" in form handlers or page files. Stronger teams give core mutations named service functions so reviewers can evaluate business rules in one place.
