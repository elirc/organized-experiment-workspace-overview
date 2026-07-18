# When To Use One Agent Vs Subagents

## Current guidance

Use a single agent for:

- early architecture choices
- narrow feature slices
- docs updates tied to one decision

Use subagents only when:

- implementation naturally splits into non-overlapping code areas
- reviewer/tester/planner roles add clear value
- there is enough code to justify parallel work
