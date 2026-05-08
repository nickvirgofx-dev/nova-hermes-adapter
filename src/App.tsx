import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Clock3,
  Database,
  FileCheck2,
  PauseCircle,
  Radar,
  ServerCrash,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchMissionControlStatus, missionControlBaseUrl } from './api';
import type { MissionControlStatus, QueueCounts, RiskGateReminder, StatusState, WakeLog } from './types';

const POLL_MS = 15_000;

const RISK_GATES: RiskGateReminder[] = [
  { label: 'No command execution', blocked: true },
  { label: 'No terminal control', blocked: true },
  { label: 'No token integration', blocked: true },
  { label: 'No memory writes', blocked: true },
  { label: 'No remote control', blocked: true },
  { label: 'Queue items are requests only', blocked: true },
];

export function App() {
  const [state, setState] = useState<StatusState>({ kind: 'loading' });

  useEffect(() => {
    let alive = true;

    async function load() {
      const controller = new AbortController();
      try {
        const data = await fetchMissionControlStatus(controller.signal);
        if (alive) setState({ kind: 'ready', data, checkedAt: new Date().toISOString(), source: 'live' });
      } catch (error) {
        if (!alive) return;
        const message = error instanceof Error ? error.message : 'Mission Control is offline';
        setState({ kind: 'offline', message, checkedAt: new Date().toISOString() });
      }
    }

    load();
    const timer = window.setInterval(load, POLL_MS);

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="shell">
      <header className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Nova / Hermes Adapter</p>
          <h1>Mission Control</h1>
          <p className="subtitle">Read-only local dashboard for Nova status, queue health, wake logs, and risk gates.</p>
        </div>
        <StatusBadge state={state} />
      </header>

      {state.kind === 'ready' ? <Dashboard data={state.data} checkedAt={state.checkedAt} /> : <OfflinePanel state={state} />}
    </main>
  );
}

function StatusBadge({ state }: { state: StatusState }) {
  if (state.kind === 'ready') {
    return <span className="badge ok"><CheckCircle2 size={16} /> Read-only online</span>;
  }
  if (state.kind === 'offline') {
    return <span className="badge warn"><AlertTriangle size={16} /> Local backend offline</span>;
  }
  return <span className="badge"><Clock3 size={16} /> Checking local status</span>;
}

function OfflinePanel({ state }: { state: StatusState }) {
  return (
    <section className="panel offlinePanel">
      <ServerCrash size={34} />
      <div>
        <p className="eyebrow">Offline-safe state</p>
        <h2>Mission Control is not reachable</h2>
        <p className="muted">{state.kind === 'offline' ? state.message : 'Loading local status...'}</p>
        <code>{missionControlBaseUrl()}/api/status</code>
        <p className="muted smallText">The UI only performs a GET request and does not expose execution, terminal, token, memory-write, or remote-control features.</p>
      </div>
    </section>
  );
}

function Dashboard({ data, checkedAt }: { data: MissionControlStatus; checkedAt: string }) {
  const queues = data.queues ?? {};
  const logs = data.logs?.latest ?? [];
  const docs = data.docs ?? {};
  const docsReady = useMemo(() => Object.values(docs).filter(Boolean).length, [docs]);
  const docsTotal = Object.keys(docs).length;
  const pauseActive = data.pause?.active === true;

  return (
    <div className="dashboardStack">
      <section className="statusStrip">
        <StatusChip label="Policy" value={data.policy ?? 'read-only'} tone="ok" />
        <StatusChip label="Pause" value={pauseActive ? 'Active' : 'Ready'} tone={pauseActive ? 'warn' : 'ok'} />
        <StatusChip label="Server" value={serverLabel(data)} />
        <StatusChip label="Checked" value={formatDate(checkedAt)} />
      </section>

      <div className="grid">
        <Metric icon={<ShieldCheck />} label="Policy" value={data.policy ?? 'read-only'} tone="ok" />
        <Metric icon={<PauseCircle />} label="Pause State" value={pauseActive ? 'Paused' : 'Ready'} tone={pauseActive ? 'warn' : 'ok'} />
        <Metric icon={<Database />} label="Queue Total" value={queueTotal(queues).toString()} />
        <Metric icon={<Activity />} label="Wake Logs" value={(data.logs?.count ?? logs.length).toString()} />

        <section className="panel wide">
          <PanelTitle icon={<Database size={18} />} title="Queue Overview" />
          <div className="queueGrid">
            <Queue label="Inbox" value={queues.inbox} />
            <Queue label="Approved" value={queues.approved} />
            <Queue label="Done" value={queues.done} tone="ok" />
            <Queue label="Rejected" value={queues.rejected} tone="warn" />
          </div>
          <p className="muted smallText">Queue counts are displayed as status data only. Items are not treated as executable commands.</p>
        </section>

        <section className="panel wide">
          <PanelTitle icon={<Radar size={18} />} title="Latest Wake Logs" />
          <div className="logList">
            {logs.length ? logs.slice(0, 6).map((log, index) => <LogRow key={log.path ?? log.name ?? index} log={log} />) : <EmptyState text="No logs reported by Mission Control." />}
          </div>
        </section>

        <section className="panel">
          <PanelTitle icon={<FileCheck2 size={18} />} title="Bootstrap Docs" />
          <p className="bigNumber">{docsReady}/{docsTotal || 0}</p>
          <p className="muted">Required files present</p>
          <div className="docList">
            {Object.entries(docs).length ? Object.entries(docs).map(([name, ready]) => <DocRow key={name} name={name} ready={ready} />) : <EmptyState text="No doc checklist reported." />}
          </div>
        </section>

        <section className="panel">
          <PanelTitle icon={<CircleSlash size={18} />} title="Risk Gates" />
          <div className="gateList">
            {RISK_GATES.map((gate) => <GateRow key={gate.label} gate={gate} />)}
          </div>
        </section>

        <section className="panel wide">
          <PanelTitle icon={<Activity size={18} />} title="Runtime Paths" />
          <Path label="Runtime" value={data.runtime_root} />
          <Path label="Brain" value={data.brain_root} />
          <Path label="Mission" value={data.mission_root} />
        </section>

        <section className="panel wide">
          <PanelTitle icon={<ShieldCheck size={18} />} title="Read-only Contract" />
          <div className="contractGrid">
            <ContractItem label="Allowed" value="GET /api/status" />
            <ContractItem label="Default Backend" value={missionControlBaseUrl()} />
            <ContractItem label="Boundary" value="No writes, execution, terminal, tokens, or remote control" />
            <ContractItem label="Generated" value={formatDate(data.generated_at)} />
          </div>
        </section>
      </div>
    </div>
  );
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <h2 className="panelTitle">{icon}{title}</h2>;
}

function StatusChip({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className={`statusChip ${tone ?? ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <section className={`metric ${tone ?? ''}`}>
      <div className="metricIcon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </section>
  );
}

function Queue({ label, value = 0, tone }: { label: string; value?: number; tone?: 'ok' | 'warn' }) {
  return (
    <div className={`queueItem ${tone ?? ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LogRow({ log }: { log: WakeLog }) {
  return (
    <article className="logRow">
      <span className={log.ok === false ? 'dot warnDot' : 'dot okDot'} />
      <div>
        <strong>{log.name ?? 'wake log'}</strong>
        <p>{log.status ?? 'unknown'} · {formatDate(log.modified)}</p>
        {log.path ? <code>{log.path}</code> : null}
      </div>
    </article>
  );
}

function DocRow({ name, ready }: { name: string; ready: boolean }) {
  return (
    <div className="docRow">
      <span className={ready ? 'dot okDot' : 'dot warnDot'} />
      <span>{name}</span>
    </div>
  );
}

function GateRow({ gate }: { gate: RiskGateReminder }) {
  return (
    <div className="gateRow">
      <ShieldCheck size={15} />
      <span>{gate.label}</span>
    </div>
  );
}

function ContractItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="contractItem">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Path({ label, value }: { label: string; value?: string }) {
  return (
    <div className="pathRow">
      <span>{label}</span>
      <code>{value ?? '-'}</code>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="emptyState">{text}</p>;
}

function queueTotal(queues: QueueCounts) {
  return (queues.inbox ?? 0) + (queues.approved ?? 0) + (queues.done ?? 0) + (queues.rejected ?? 0);
}

function serverLabel(data: MissionControlStatus) {
  const host = data.server?.host ?? '127.0.0.1';
  const port = data.server?.default_port ?? 8765;
  return `${host}:${port}`;
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
