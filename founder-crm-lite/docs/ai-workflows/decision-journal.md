# Decision Journal

## Entry 001

### Stage

Initial CRM project structure

### Recommended AI mode

Mode A: Single Agent

### Why that mode fits

The task was mostly architectural framing and documentation, with limited file scope and no need for parallel implementation.

### Prompts used

- compare project-structure options for a realistic CRM in a shared workspace
- recommend one and record it in docs

### Context included

- CRM requirements
- learning/documentation requirements
- need for separate project folders

### Context excluded

- detailed future implementation files that do not exist yet
- unrelated cross-project sharing assumptions

### Verification steps

- confirm the project lives under its own root folder
- confirm decision docs reflect the chosen option

### Mistakes AI was likely to make here

- premature sharing across products
- vague docs that do not influence implementation

### How a human should supervise this step

- check whether the chosen structure would still make sense after the app gains many modules

## Entry 002

### Stage

CRM implementation and verification

### Recommended AI mode

Mode D: Agent + Tools

### Why that mode fits

Once real code exists, build tooling becomes part of the engineering loop. Typecheck/build results catch mistakes that pure reasoning will miss.

### Prompts used

- scaffold a runnable modular-monolith CRM
- keep business logic in services and policies
- verify by running install, typecheck, and build

### Context included

- accepted architecture decisions
- requirement summary
- need for study-friendly docs and code boundaries

### Context excluded

- speculative production deployment details
- unrelated feedback-board domain specifics

### Verification steps

- `npm install`
- `npm run typecheck`
- `npm run build`

### Mistakes AI was likely to make here

- putting mutation logic in page files
- missing framework-specific type issues
- skipping revalidation after server actions

### How a human should supervise this step

- read the service layer first
- confirm that page files are mostly composition
- verify that policy checks are not only visual/UI-level
