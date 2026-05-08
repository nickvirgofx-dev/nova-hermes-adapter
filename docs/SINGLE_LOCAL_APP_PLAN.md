# Single Local App Plan

The dashboard currently uses two local services during development:

```text
5173 = Vite frontend dev server
8765 = local Mission Control backend
```

This is useful for frontend development, but not ideal for daily use.

## Target

Daily use should require only one local address:

```text
http://127.0.0.1:8765
```

The same local server should provide:

```text
/            -> dashboard UI
/api/status  -> read-only status JSON
```

## Why Keep 5173 During Development

`5173` is the Vite dev server. It gives:

- fast UI reloads;
- easy mock preview;
- frontend development without depending on live backend;
- safe separation from the local Nova runtime.

## Why Merge Into 8765 Later

For real use, opening two local servers is confusing.

The final local workflow should be:

1. Start Nova Mission Control backend.
2. Open `http://127.0.0.1:8765`.
3. See the dashboard and live status from the same local origin.

## Required Frontend Adjustment

The frontend should support relative API paths when served by the backend:

```text
/api/status
```

During development it can still use:

```text
VITE_MISSION_CONTROL_URL=http://127.0.0.1:8765
```

## Required Backend Adjustment

The local backend should serve static build files from the frontend build output.

Example conceptual behavior:

```text
GET /              -> serve dist/index.html
GET /assets/*      -> serve dist/assets/*
GET /api/status    -> return read-only Mission Control status
```

## Safety Boundary

This plan must not add:

- command execution;
- terminal control;
- token integration;
- memory write routes;
- queue mutation;
- remote control.

The backend may serve files and status only.

## Migration Steps

1. Stabilize UI on `5173`.
2. Confirm live response from `8765/api/status`.
3. Adjust `normalizeStatus.ts` for live backend data.
4. Build frontend with `npm run build`.
5. Serve `dist/` from the local Mission Control backend.
6. Verify `http://127.0.0.1:8765` opens the dashboard.
7. Keep `5173` for development only.
