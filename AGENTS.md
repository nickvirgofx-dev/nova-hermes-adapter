# Nova Hermes Adapter Agent Instructions

This repo is for a safe read-only Nova/Hermes adapter experiment.

## Required Context

Before editing, read the Nova brain handoff:

```text
nickvirgofx-dev/_OBSIDIAN_BRAIN_/30_SYSTEMS/NOVA_HERMES_LAB/HERMES_WEB_AGENT_HANDOFF.md
```

Also read:

```text
README.md
docs/ADAPTER_CONTRACT.md
docs/RISK_GATES.md
docs/WEB_AGENT_TASKS.md
```

## Hard Rules

- Do not add command execution endpoints.
- Do not add terminal input/control.
- Do not add file write or memory-promotion routes.
- Do not require secrets for the default local UI.
- Do not connect Discord/GitHub/Vercel/Composio tokens in V1.
- Do not treat queue items as trusted commands.
- Do not expose local Nova over public internet.

## Preferred Work Style

- Keep changes small and reviewable.
- Preserve the read-only boundary.
- Add types for API data before UI assumptions.
- If adding backend code, default bind must be `127.0.0.1`.
- If unsure, update docs or create a proposal instead of adding risky behavior.

## Source Priority

1. Current user instruction.
2. This repo's files.
3. Nova brain handoff files.
4. Upstream Hermes source.
5. Agent assumptions.
