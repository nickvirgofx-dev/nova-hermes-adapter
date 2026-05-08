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
  RefreshCw,
  ServerCrash,
  ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchMissionControlStatus, missionControlBaseUrl } from './api';
import { formatBytes, formatDate, formatNumber, serverAddress } from './lib/format';
import { normalizeMissionStatus } from './lib/normalizeStatus';
import type { NormalizedMissionStatus } from './lib/normalizeStatus';
import type { RiskGateReminder, StatusState, WakeLog } from './types';

const POLL_MS = 15_000;

const RISK_GATES: RiskGateReminder[] = [
  { label: 'No command execution', blocked: true },
  { label: 'No terminal control', blocked: true },
  { label: 'No token integration', blocked: true },
  { label: 'No memory writes', blocked: true },
  { label: 'No remote control', blocked: true },
  { label: 'Queue items are requests only', blocked: true },
];

const NAV_ITEMS = ['Overview', 'Queues', 'Wake Logs', 'Risk Gates', 'Runtime', 'Contract'];

export function App() {
  const [state, setState] = useState<StatusState>({ kind: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchMissionControlStatus();
      setState({ kind: 'ready', data, checkedAt: new Date().toISOString(), source: 'live' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mission Control is offline';
      setState({ kind: 'offline', message, checkedAt: new Date().toISOString() });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <main className="appShell">
      <Sidebar state={state} />
      <section className="mainStage">
        <header className="hero">
          <div className="heroCopy">
            <p className="eyebrow">Nova / Hermes Adapter</p>
            <h1>Mission Control</h1>
            <p className="subtitle">Read-only local dashboard for Nova status, queue health, wake logs, and risk gates.</p>
          </div>
          <div className="heroActions">
            <StatusBadge state={state} />
            <button className="refreshButton" type="button" onClick={load} disabled={isRefreshing}>
              <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
              Refresh Status
            </button>
          </div>
        </header>

        {state.kind === 'ready' ? <Dashboard data={normalizeMissionStatus(state.data)} checkedAt={state.checkedAt} /> : <OfflinePanel state={state} />}
      </section>
    </main>
  );
}

function Sidebar({ state }: { state: StatusState }) {
  return (
    <aside className="sidebar">
      <div className="brandBlock">
        <div className="brandMark">N</div>
        <div>
          <strong>Nova Shell</strong>
          <span>Read-only</span>
        </div>
      </div>

      <nav className="sideNav" aria-label="Dashboard sections">
        {NAV_ITEMS.map((item) => (
          <a key={item} href={`#${sectionId(item)}`}>
            {item}
          </a>
        ))}
      </nav>

      <div className="sideFooter">
        <span className="sideLabel">Boundary</span>
        <strong>{state.kind === 'ready' ? 'GET-only online' : 'Offline-safe'}</strong>
        <p>No terminal, execution, token, memory-write, or remote-control features.</p>
      </div>
    </aside>
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

function Dashboard({ data, checkedAt }: { data: NormalizedMissionStatus; checkedAt: string }) {
  const failedLogs = useMemo(() => data.logs.filter((log) => log.ok === false).length, [data.logs]);

  return (
    <div className="dashboardStack">
      <section className="statusStrip" id="overview">
        <StatusChip label="Policy" value={data.policy} tone="ok" />
        <StatusChip label="Pause" value={data.pause.active ? 'Active' : 'Ready'} tone={data.pause.active ? 'warn' : 'ok'} />
        <StatusChip label="Server" value={serverAddress(data.server.host, data.server.port)} />
        <StatusChip label="Checked" value={formatDate(checkedAt)} />
      </section>

      <div className="grid">
        <Metric icon={<ShieldCheck />} label="Policy" value={data.policy} tone="ok" />
        <Metric icon={<PauseCircle />} label="Pause State" value={data.pause.active ? 'Paused' : 'Ready'} tone={data.pause.active ? 'warn' : 'ok'} />
        <Metric icon={<Database />} label="Queue Total" value={formatNumber(data.queueTotal)} />
        <Metric icon={<Activity />} label="Wake Logs" value={formatNumber(data.logCount)} />

        <section className="panel wide" id="queues">
          <PanelTitle icon={<Database size={18} />} title="Queue Overview" />
          <div className="queueGrid">
            <Queue label="Inbox" value={data.queues.inbox} />
            <Queue label="Approved" value={data.queues.approved} />
            <Queue label="Done" value={data.queues.done} tone="ok" />
            <Queue label="Rejected" value={data.queues.rejected} tone="warn" />
          </div>
          <p className="muted smallText">Queue counts are displayed as status data only. Items are not treated as executable commands.</p>
        </section>

        <section className="panel wide" id="wake-logs">
          <PanelTitle icon={<Radar size={18} />} title="Latest Wake Logs" />
          <div className="logSummary">
            <span>{formatNumber(data.logs.length)} shown</span>
            <span>{formatNumber(failedLogs)} flagged</span>
          </div>
          <div className="logList">
            {data.logs.length ? data.logs.slice(0, 6).map((log, index) => <LogRow key={log.path ?? log.name ?? index} log={log} />) : <EmptyState text="No logs reported by Mission Control." />}
          </div>
        </section>

        <section className="panel" id="runtime">
          <PanelTitle icon={<FileCheck2 size={18} />} title="Bootstrap Docs" />
          <p className="bigNumber">{data.docsReady}/{data.docsTotal}</p>
          <p className="muted">Required files present</p>
          <div className="docList">
            {data.docs.length ? data.docs.map((doc) => <DocRow key={doc.name} name={doc.name} ready={doc.ready} />) : <EmptyState text="No doc checklist reported." />}
          </div>
        </section>

        <section className="panel" id="risk-gates">
          <PanelTitle icon={<CircleSlash size={18} />} title="Risk Gates" />
          <div className="gateList">
            {RISK_GATES.map((gate) => <GateRow key={gate.label} gate={gate} />)}
          </div>
        </section>

        <section className="panel wide">
          <PanelTitle icon={<Activity size={18} />} title="Runtime Paths" />
          <Path label="Runtime" value={data.runtimeRoot} />
          <Path label="Brain" value={data.brainRoot} />
          <Path label="Mission" value={data.missionRoot} />
          <Path label="Pause Flag" value={data.pause.path} />
        </section>

        <section className="panel wide" id="contract">
          <PanelTitle icon={<ShieldCheck size={18} />} title="Read-only Contract" />
          <div className="contractGrid">
            <ContractItem label="Allowed" value="GET /api/status" />
            <ContractItem label="Default Backend" value={missionControlBaseUrl()} />
            <ContractItem label="Boundary" value="No writes, execution, terminal, tokens, or remote control" />
            <ContractItem label="Generated" value={formatDate(data.generatedAt)} />
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
        <p>{log.status ?? 'unknown'} · {formatDate(log.modified)} · {formatBytes(log.size)}</p>
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

function sectionId(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}
