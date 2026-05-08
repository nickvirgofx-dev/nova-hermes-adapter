import type { MissionControlStatus, QueueCounts, WakeLog } from '../types';

export type DocStatus = {
  name: string;
  ready: boolean;
};

export type NormalizedMissionStatus = {
  ok: boolean;
  version: string;
  generatedAt?: string;
  policy: string;
  runtimeRoot?: string;
  brainRoot?: string;
  missionRoot?: string;
  server: {
    host: string;
    port: number;
  };
  pause: {
    active: boolean;
    path?: string;
  };
  docs: DocStatus[];
  docsReady: number;
  docsTotal: number;
  queues: Required<QueueCounts>;
  queueTotal: number;
  logs: WakeLog[];
  logCount: number;
};

export function normalizeMissionStatus(raw: MissionControlStatus): NormalizedMissionStatus {
  const queues = normalizeQueues(raw.queues);
  const docs = normalizeDocs(raw.docs);
  const logs = Array.isArray(raw.logs?.latest) ? raw.logs.latest : [];

  return {
    ok: raw.ok === true,
    version: raw.version ?? 'unknown',
    generatedAt: raw.generated_at,
    policy: raw.policy ?? 'read-only',
    runtimeRoot: raw.runtime_root,
    brainRoot: raw.brain_root,
    missionRoot: raw.mission_root,
    server: {
      host: raw.server?.host ?? '127.0.0.1',
      port: raw.server?.default_port ?? 8765,
    },
    pause: {
      active: raw.pause?.active === true,
      path: raw.pause?.path,
    },
    docs,
    docsReady: docs.filter((doc) => doc.ready).length,
    docsTotal: docs.length,
    queues,
    queueTotal: queues.inbox + queues.approved + queues.done + queues.rejected,
    logs,
    logCount: raw.logs?.count ?? logs.length,
  };
}

function normalizeQueues(queues?: QueueCounts): Required<QueueCounts> {
  return {
    inbox: safeCount(queues?.inbox),
    approved: safeCount(queues?.approved),
    done: safeCount(queues?.done),
    rejected: safeCount(queues?.rejected),
  };
}

function normalizeDocs(docs?: Record<string, boolean>): DocStatus[] {
  if (!docs) return [];

  return Object.entries(docs).map(([name, ready]) => ({
    name,
    ready: ready === true,
  }));
}

function safeCount(value?: number): number {
  return Number.isFinite(value) && value && value > 0 ? value : 0;
}
