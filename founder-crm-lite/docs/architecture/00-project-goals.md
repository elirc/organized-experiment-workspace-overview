# Project Goals

## Product summary

Founder CRM Lite is a realistic CRM for a founder-led startup or small sales team. It should support leads, companies, contacts, deals, tasks, notes, timelines, dashboards, import/export, settings, and role-sensitive workflows.

It should feel like an internal business application that can grow over time, not a toy contact manager.

## Main users

- Founder/Admin
- Sales Rep
- Read-Only Analyst

## Product goals

- Help teams manage leads from first capture through qualification and conversion.
- Track companies, contacts, deals, tasks, and activity history.
- Surface pipeline state, stuck deals, and due follow-ups.
- Support meaningful operational features such as duplicate merging and import review.

## Engineering goals

- Strong typing and maintainable boundaries.
- Clear distinction between UI, application logic, domain logic, and persistence.
- Explicit authorization and ownership rules.
- Reusable patterns for list pages, detail pages, forms, timeline events, and imports.

## Learning goals

- Learn how to structure a realistic CRM codebase.
- Practice reviewing ownership, workflow, and auditing logic.
- Practice using AI with enough context to be helpful without becoming noisy.

## Non-goals for the initial implementation

- deep email integration
- advanced marketing automation
- territory planning
- external CRM sync
- sophisticated forecasting models

## Current architectural direction

Pending the next major decisions after the initial structure choice, recorded in `01-major-decisions-log.md` and `02-options-considered.md`.
