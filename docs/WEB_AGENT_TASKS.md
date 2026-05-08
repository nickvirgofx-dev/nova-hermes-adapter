# Web Agent Tasks

Good first tasks for web-based agents:

1. Improve the read-only status UI.
2. Add resilient offline/error states.
3. Add TypeScript types for Mission Control payloads.
4. Add static mock data for UI development.
5. Compare Hermes Workspace UI ideas against this repo's current layout.
6. Propose a read-only adapter design in docs.

Do not start with:

- Docker.
- Websocket terminal control.
- auth/token flows.
- app automation.
- command execution.
- deploying online.

## Handoff Prompt

```text
You are working in nickvirgofx-dev/nova-hermes-adapter. Keep V1 read-only. Read AGENTS.md, README.md, docs/ADAPTER_CONTRACT.md, docs/RISK_GATES.md, and docs/WEB_AGENT_TASKS.md first. If you need Nova memory context, read nickvirgofx-dev/_OBSIDIAN_BRAIN_/30_SYSTEMS/NOVA_HERMES_LAB/HERMES_WEB_AGENT_HANDOFF.md. Do not add execution endpoints or token integrations.
```
