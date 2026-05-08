import type { MissionControlStatus } from '../types';

export const mockMissionControlStatus: MissionControlStatus = {
  ok: true,
  version: 'mock-v1',
  generated_at: new Date().toISOString(),
  policy: 'read-only',
  runtime_root: 'E:\\nick\\AI_Agent_V001\\NOVA_AGENTS_RUNTIME',
  brain_root: 'E:\\nick\\AI_Agent_V001\\_OBSIDIAN_BRAIN_',
  mission_root: 'E:\\nick\\AI_Agent_V001\\NOVA_AGENTS_RUNTIME\\mission_control',
  server: {
    host: '127.0.0.1',
    default_port: 8765,
  },
  pause: {
    active: false,
    path: 'E:\\nick\\AI_Agent_V001\\NOVA_AGENTS_RUNTIME\\PAUSE_NOVA',
  },
  docs: {
    'README.md': true,
    'AGENTS.md': true,
    'docs/ADAPTER_CONTRACT.md': true,
    'docs/RISK_GATES.md': true,
    'docs/WEB_AGENT_TASKS.md': true,
  },
  queues: {
    inbox: 3,
    approved: 1,
    done: 12,
    rejected: 0,
  },
  logs: {
    count: 4,
    latest: [
      {
        name: 'wake-2026-05-08T09-30-00Z.json',
        path: 'logs/wake-2026-05-08T09-30-00Z.json',
        status: 'ok',
        ok: true,
        modified: new Date().toISOString(),
        size: 2048,
      },
      {
        name: 'queue-scan-2026-05-08T09-20-00Z.json',
        path: 'logs/queue-scan-2026-05-08T09-20-00Z.json',
        status: 'read-only scan complete',
        ok: true,
        modified: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        size: 1536,
      },
      {
        name: 'risk-gate-check-2026-05-08T09-10-00Z.json',
        path: 'logs/risk-gate-check-2026-05-08T09-10-00Z.json',
        status: 'blocked capabilities remain disabled',
        ok: true,
        modified: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        size: 1024,
      },
      {
        name: 'offline-probe-2026-05-08T09-00-00Z.json',
        path: 'logs/offline-probe-2026-05-08T09-00-00Z.json',
        status: 'backend unavailable during probe',
        ok: false,
        modified: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        size: 768,
      },
    ],
  },
};
