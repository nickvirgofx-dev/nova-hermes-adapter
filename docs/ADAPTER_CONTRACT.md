# Adapter Contract

V1 connects a local frontend to Nova Mission Control in read-only mode.

## Backend

Expected local Mission Control server:

```text
http://127.0.0.1:8765
```

Known endpoint from current Mission Control:

```text
GET /api/status
```

V1 frontend should tolerate missing optional fields and render a clear offline state if the local backend is not running.

## Data Shape

The status payload may include:

```ts
type MissionControlStatus = {
  ok: boolean;
  version?: string;
  generated_at?: string;
  policy?: string;
  runtime_root?: string;
  brain_root?: string;
  mission_root?: string;
  server?: {
    host?: string;
    default_port?: number;
  };
  pause?: {
    active?: boolean;
    path?: string;
  };
  docs?: Record<string, boolean>;
  queues?: {
    inbox?: number;
    approved?: number;
    done?: number;
    rejected?: number;
  };
  logs?: {
    count?: number;
    latest?: Array<{
      name?: string;
      path?: string;
      status?: string;
      ok?: boolean;
      modified?: string;
      size?: number;
    }>;
  };
  conversation_memory?: unknown;
  reports?: unknown;
  online_channels?: unknown;
};
```

## Forbidden In V1

- POST/write/execute routes.
- Shell command submission.
- Terminal streaming.
- File browser with write access.
- Token management.
- Remote command approval.

## Future Bridge

Remote/online access requires a separate approved design with:

- authentication;
- explicit allowlist;
- risk classification;
- human approval for risky tasks;
- audit log;
- kill switch support.
