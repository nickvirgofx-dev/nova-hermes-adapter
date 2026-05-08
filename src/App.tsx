import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, PauseCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchMissionControlStatus, missionControlBaseUrl } from './api';
import type { MissionControlStatus, QueueCounts, StatusState, WakeLog } from './types';

const POLL_MS = 15_000;

export function App() {
  const [state, setState] = useState<StatusState>({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function load() {
      try {
        const data = await fetchMissionControlStatus(controller.signal);
        if (alive) setState({ kind: 'ready', data });
      } catch (error) {
        if (!alive) return;
        const message = error instanceof Error ? error.message : 'Mission Control is offline';
        setState({ kind: 'offline', message });
      }
    }

    load();
    const timer = window.setInterval(load, POLL_MS);

    return () => {
      alive = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Nova / Hermes Adapter</p>
          <h1>Mission Control</h1>
        </div>
        <StatusBadge state={state} />
      </header>

      {state.kind === 'ready' ? <Dashboard data={state.data} /> : <OfflinePanel state={state} />}
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
  return <span className="badge"><Clock3 size={16} /> Checking</span>;
}

function OfflinePanel({ state }: { state: StatusState }) {
  return (
    <section className="panel offline">
      <AlertTriangle size={28} />
      <div>
        <h2>Mission Control is not reachable</h2>
        <p>{state.kind === 'offline' ? state.message : 'Loading local status...'}</p>
        <code>{missionControlBaseUrl()}/api/status</code>
      </div>
    </section>
  );
}

function Dashboard({ data }: { data: MissionControlStatus }) {
  const queues = data.queues ?? {};
  const logs = data.logs?.latest ?? [];
  const docs = data.docs ?? {};
  const docsReady = useMemo(() => Object.values(docs).filter(Boolean).length, [docs]);

  return (
    <div className="grid">
      <Metric icon={<ShieldCheck />} label="Policy" value={data.policy ?? 'read-only'} />
      <Metric icon={<PauseCircle />} label="Pause" value={data.pause?.active ? 'Active' : 'Ready'} tone={data.pause?.active ? 'warn' : 'ok'} />
      <Metric icon={<Database />} label="Queues" value={queueTotal(queues).toString()} />
      <Metric icon={<Activity />} label="Wake Logs" value={(data.logs?.count ?? logs.length).toString()} />

      <section className="panel wide">
        <h2>Queues</h2>
        <div className="queueGrid">
          <Queue label="Inbox" value={queues.inbox} />
          <Queue label="Approved" value={queues.approved} />
          <Queue label="Done" value={queues.done} />
          <Queue label="Rejected" value={queues.rejected} />
        </div>
      </section>

      <section className="panel wide">
        <h2>Latest Wake Logs</h2>
        <div className="logList">
          {logs.length ? logs.slice(0, 5).map((log) => <LogRow key={log.path ?? log.name} log={log} />) : <p className="muted">No logs reported.</p>}
        </div>
      </section>

      <section className="panel">
        <h2>Runtime</h2>
        <Path label="Runtime" value={data.runtime_root} />
        <Path label="Brain" value={data.brain_root} />
        <Path label="Generated" value={data.generated_at} />
      </section>

      <section className="panel">
        <h2>Bootstrap Docs</h2>
        <p className="bigNumber">{docsReady}/{Object.keys(docs).length}</p>
        <p className="muted">Required files present</p>
      </section>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <section className={`metric ${tone ?? ''}`}>
      <div className="metricIcon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </section>
  );
}

function Queue({ label, value = 0 }: { label: string; value?: number }) {
  return (
    <div className="queueItem">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LogRow({ log }: { log: WakeLog }) {
  return (
    <article className="logRow">
      <span className={log.ok ? 'dot okDot' : 'dot warnDot'} />
      <div>
        <strong>{log.name ?? 'wake log'}</strong>
        <p>{log.status ?? 'unknown'} · {log.modified ?? 'no timestamp'}</p>
      </div>
    </article>
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

function queueTotal(queues: QueueCounts) {
  return (queues.inbox ?? 0) + (queues.approved ?? 0) + (queues.done ?? 0) + (queues.rejected ?? 0);
}
