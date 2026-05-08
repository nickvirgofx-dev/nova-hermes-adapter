export type QueueCounts = {
  inbox?: number;
  approved?: number;
  done?: number;
  rejected?: number;
};

export type WakeLog = {
  name?: string;
  path?: string;
  status?: string;
  ok?: boolean;
  modified?: string;
  size?: number;
};

export type MissionControlStatus = {
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
  queues?: QueueCounts;
  logs?: {
    count?: number;
    latest?: WakeLog[];
  };
  conversation_memory?: unknown;
  reports?: unknown;
  online_channels?: unknown;
};

export type StatusState =
  | { kind: 'loading' }
  | { kind: 'offline'; message: string }
  | { kind: 'ready'; data: MissionControlStatus };
