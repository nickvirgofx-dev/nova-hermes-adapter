# Nova Mission Control Dashboard Roadmap

This roadmap keeps the dashboard useful while preserving the V1 read-only boundary.

## Current Principle

The board must be easy to read before it becomes feature-rich.

Default layout rule:

```text
Header
Mock/Live state
Today's Focus
System Status
Active Projects
System Health Summary
Request / Queue / Logs / Decisions / Brain Sync / Risk Gates
```

Do not add new panels unless the existing page remains readable at common desktop sizes.

## Phase A — Stable UI on Vite Dev Server

Target URL during development:

```text
http://127.0.0.1:5173
```

Goals:

- Keep the board readable in mock mode.
- Keep offline mode clear and non-scary.
- Keep live mode clearly labeled.
- Use static mock data for frontend development.
- Use list/table layout for text-heavy sections.
- Use cards only for compact status numbers.

Done so far:

- Mock preview mode.
- Auto-refresh paused during mock preview.
- Read-only refresh button using GET status only.
- Today's Focus.
- Active Projects list.
- System Status strip.
- System Health Summary.
- Request Inbox Preview.
- Queue Overview.
- Wake Log search/filter.
- Decision Queue.
- Brain Sync.
- Risk Gates.

## Phase B — Connect Live Read-only Data

Target backend:

```text
http://127.0.0.1:8765/api/status
```

Goals:

- Confirm the live backend response shape.
- Extend `normalizeStatus.ts` to handle real fields safely.
- Keep all reads GET-only.
- Do not add mutation endpoints.
- Do not add approve/reject/execute buttons.

Potential future read-only endpoints:

```text
GET /api/status
GET /api/queues
GET /api/logs
GET /api/reports
GET /api/brain-sync
```

These endpoints are informational only.

## Phase C — Single Local App

Target production/local URL:

```text
http://127.0.0.1:8765
```

Goal:

- Use `5173` only while developing the frontend.
- Build the frontend into static files.
- Let the local Mission Control backend serve the dashboard and API from one local address.

Recommended behavior:

```text
http://127.0.0.1:8765          -> dashboard UI
http://127.0.0.1:8765/api/status -> status JSON
```

## Phase D — Request/Decision Workflow

Goal:

- Show incoming requests as planning signals.
- Show decisions that need the user.
- Keep requests as non-executable items.
- Keep all action buttons disabled or absent until a separate controlled-action system is designed.

## Future Phase — Controlled Actions

Not allowed in V1.

If this is ever developed, it requires a separate approval phase with:

- PAUSE_NOVA kill switch.
- Human approval.
- Command allowlist.
- Risk classifier.
- Dry-run first.
- Audit log.
- Secret redaction.
- No hidden autonomous execution.

## Hard Boundary

The dashboard must not add:

- command execution;
- terminal control;
- token integration;
- memory write routes;
- remote control;
- queue execution.
