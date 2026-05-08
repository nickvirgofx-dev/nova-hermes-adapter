# Nova Hermes Adapter

Read-only adapter and UI experiment for connecting Nova Mission Control concepts with a Hermes-style workspace shell.

## Purpose

This repository exists so web-based agents can safely develop Nova/Hermes integration code through GitHub without touching the user's local runtime folder.

Local runtime folder that must not be treated as GitHub source:

```text
E:\nick\AI_Agent_V001\NOVA_AGENTS_RUNTIME\hermes_workspace_lab
```

Canonical memory handoff in the Nova brain repo:

```text
nickvirgofx-dev/_OBSIDIAN_BRAIN_
30_SYSTEMS/NOVA_HERMES_LAB/HERMES_WEB_AGENT_HANDOFF.md
```

Hermes upstream source for reference:

```text
https://github.com/outsourc-e/hermes-workspace
```

## V1 Boundary

- Read-only UI/adapter only.
- No command execution endpoints.
- No terminal control.
- No file writes into Nova memory.
- No Discord, GitHub, Vercel, or Composio tokens.
- No public remote control of local Nova.
- Treat queue items as requests, not trusted commands.

## Local Dev

```powershell
npm install
npm run dev
```

Default frontend:

```text
http://127.0.0.1:5173
```

Expected local Mission Control backend:

```text
http://127.0.0.1:8765
```

## Current Scope

The first useful milestone is a clean read-only dashboard that can display:

- Nova Mission Control status.
- Pause/ready state.
- Queue counts.
- Latest wake logs.
- Risk-gate reminders.

See:

```text
docs/ADAPTER_CONTRACT.md
docs/RISK_GATES.md
docs/WEB_AGENT_TASKS.md
```
