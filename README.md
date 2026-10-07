# Workspace Overview

This workspace contains two separate production-style study projects:

1. `founder-crm-lite`
2. `customer-feedback-board`

Each project is intentionally treated as its own application with its own:

- architecture docs
- learning/study docs
- AI workflow docs

## Why two separate folders

The products have different domains, roles, workflows, and UI needs. Keeping them in separate folders makes the boundaries clearer for study and review, while still allowing the overall workspace to act as a portfolio and AI-assisted engineering practice environment.

## Current status

Both projects now have working Next.js application code, typed domain modules, local demo persistence, and study-oriented documentation.

- `founder-crm-lite`: CRM flows for dashboarding, leads, conversion, tasks, pipeline, search, settings, and CSV export
- `customer-feedback-board`: feedback board flows for public browsing, submission, voting, comments, follows, roadmap, moderation, notifications, and admin views

Both apps are intended to be runnable locally and to be read as study codebases, not just UI demos.

## Where to start

Read [`CODEBASE-STUDY-PATH.md`](CODEBASE-STUDY-PATH.md) first. It gives a step-by-step reading order for both apps, with a goal and a self-check for each step, line-referenced traces of the main features, a table of verified review findings, debugging scenarios and an exercise ladder.

Then open the app folders:

- [`founder-crm-lite/README.md`](founder-crm-lite/README.md)
- [`customer-feedback-board/README.md`](customer-feedback-board/README.md)

## What is in this repository

```
README.md                      this file
CODEBASE-STUDY-PATH.md         the study guide for both apps
founder-crm-lite/
  data/crm-db.json             seeded JSON "database"
  src/app/                     Next.js App Router pages (protected (app) group, login, CSV export route)
  src/modules/auth/            demo users, cookie session, role and ownership predicates
  src/modules/crm/             types, Zod schemas, server actions, service, repository
  src/server/json-store.ts     file read/write with a per-file write queue
  docs/                        architecture, learning and AI-workflow notes
customer-feedback-board/
  data/feedback-db.json        seeded JSON "database"
  src/app/                     public board, post detail, roadmap, staff dashboard, moderation, settings
  src/modules/auth/            demo users, cookie session, role predicates
  src/modules/feedback/        types, Zod schemas, server actions, service, repository
  src/server/json-store.ts     same store design as the CRM
  docs/                        architecture, learning and AI-workflow notes
```

Both apps use the same stack, declared in each `package.json`: Next.js `^15.3.1`, React `^19.1.0`, Zod `^3.24.4` and TypeScript `^5.8.3`. Neither has a database server, an external auth provider, or any test files.

## The shared architecture in one paragraph

Pages are server components that read data through a feature `service.ts`. Forms post to server actions in `actions.ts`, which authenticate the user from a demo cookie, validate input with Zod (for most actions), call a service function, and revalidate the affected pages. The service holds the business rules and permission checks and writes through a `repository.ts`, which in turn uses `src/server/json-store.ts` to read and rewrite one JSON file. The CRM's main authorization question is ownership; the feedback board's is visibility of public versus internal posts.

## Running the apps

Each app is a separate npm project. From inside an app folder, the scripts in `package.json` are `dev`, `build`, `start`, `lint` and `typecheck`. This repository does not include `node_modules`, so you need an `npm install` first. Demo users are picked on the `/login` page; there are no passwords. Writes go to the app's `data/*.json` file, resolved from the directory the server was started in, so start the server from the app folder.

Nothing in this repository was installed, built or run while the docs were last revised (2026-10-06). Every statement in the study guide is traced to a file and line, so you can verify it by reading.

## Things to know before you rely on it

- **Demo auth only.** Both apps store the raw user id in an unsigned cookie (`crm_demo_user`, `feedback_demo_user`). Anyone can become any user, including the admin. This is intentional for local study and must not be deployed.
- **File persistence.** Writes are serialized per file inside one Node process, but several service functions read, decide, and write in separate steps, so double submits can create duplicates. The study guide walks through two such cases line by line (`toggleVote` and `convertLead`).
- **No error pages.** Validation and permission errors are thrown and shown with the framework's default error screen.
- **Planned features are not all built.** The CRM's saved views, imports and duplicate merge exist only in the type model; the feedback board has no edit-post, hide-post, lock-comments or resolve-flag flow.

## How the two apps differ

| Concern | `founder-crm-lite` | `customer-feedback-board` |
| --- | --- | --- |
| Who can see a page | everyone must sign in (`src/middleware.ts` plus `(app)/layout.tsx`) | guests can browse the board and roadmap |
| Main authorization question | does this user own the record? | may this user see this post? |
| History | `ActivityEvent` rows | `ModerationAction`, `MergeHistory` and `Notification` rows |

The side-by-side table near the end of [`CODEBASE-STUDY-PATH.md`](CODEBASE-STUDY-PATH.md) has the full comparison with file references.
