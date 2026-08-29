# Grok Bot handoff

This directory is the exported configuration consumed by the sibling
`grok-bot-restaurant-scout` agent repository. It defines the agent's identity,
skills, routines, and MCP connector wiring so the bot can:

1. Scout trending local food creators and dishes (read-only research).
2. Draft shoppable video scripts that end in a clear "buy now" prompt.
3. Push `ContentDraft` and `CreatorLead` records into this system's database
   for **human approval** — the bot never posts, publishes, or spends money
   on its own.

## Files

- `agent.yaml` — agent identity, model, and high-level policy (approval-gated).
- `skills/scout-trends.yaml` — skill definition for trend/creator scouting.
- `skills/draft-script.yaml` — skill definition for shoppable script drafting.
- `mcp-connectors.json` — MCP connector specs the bot uses to talk to this
  repo's API (`apps/api`) for reading the catalog and submitting drafts.

## Approval gate

Every write the bot makes lands in the `ContentDraft` / `CreatorLead` /
`Approval` tables with `status = PENDING` (or `PENDING_APPROVAL`). A human
reviewer must flip the `Approval.status` to `APPROVED` via the dashboard
before any content is published or any product goes live. See
`packages/db/prisma/schema.prisma` for the exact model.
