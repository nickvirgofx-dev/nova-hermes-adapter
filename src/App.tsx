import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  CircleSlash,
  Clock3,
  Database,
  FileCheck2,
  FolderKanban,
  GitBranch,
  HelpCircle,
  Inbox,
  PauseCircle,
  Radar,
  RefreshCw,
  Search,
  ServerCrash,
  ShieldCheck,
  Sparkles,
  TestTube2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchMissionControlStatus, missionControlBaseUrl } from './api';
import { formatBytes, formatDate, formatNumber, serverAddress } from './lib/format';
import { normalizeMissionStatus } from './lib/normalizeStatus';
import type { NormalizedMissionStatus } from './lib/normalizeStatus';
import { mockMissionControlStatus } from './mock/missionControlStatus';
import type { RiskGateReminder, StatusState, WakeLog } from './types';

type ProjectStatus = 'active' | 'building' | 'paused' | 'lab';
type LogFilter = 'all' | 'ok' | 'flagged';

type ProjectCard = {
  name: string;
  status: ProjectStatus;
  next: string;
  note: string;
};

type DecisionItem = {
  title: string;
  detail: string;
};

type RequestItem = {
  source: string;
  title: string;
  status: string;
};

const POLL_MS = 15_000;

const RISK_GATES: RiskGateReminder[] = [
  { label: 'No command execution', blocked: true },
  { label: 'No terminal control', blocked: true },
  { label: 'No token integration', blocked: true },
  { label: 'No memory writes', blocked: true },
  { label: 'No remote control', blocked: true },
  { label: 'Queue items are requests only', blocked: true },
];

const NAV_ITEMS = ['Focus', 'Projects', 'System', 'Requests', 'Queues', 'Wake Logs', 'Decisions', 'Brain Sync', 'Risk Gates'];

const PROJECTS: ProjectCard[] = [
  {
    name: 'Nova Mission Control',
    status: 'active',
    next: 'Make the board easy to understand before connecting more live endpoints.',
    note: 'Current work surface for Nova status, queues, logs, and safety gates.',
  },
  {
    name: 'Cat Match App',
    status: 'building',
    next: 'Keep content data-driven: questions, scoring, cats, and results editable.',
    note: 'Small web app/product track with cute stray-cat matching concept.',
  },
  {
    name: 'Genesis Idle',
    status: 'paused',
    next: 'Return when the planet/core loop and UI direction are ready to continue.',
    note: 'Game track focused on planets/stars, not hero combat.',
  },
  {
    name: 'Obsidian Brain',
    status: 'active',
    next: 'Keep handoffs and system decisions recorded after meaningful work.',
    note: 'Personal knowledge base and future Nova memory source.',
  },
  {
    name: 'Art / Product Lab',
    status: 'lab',
    next: 'Organize product ideas, sticker sets, character names, and visual systems.',
    note: 'Creative production track for characters, merch, and image workflows.',
  },
];

const DECISIONS: DecisionItem[] = [
  {
    title: 'When to merge the dashboard into 8765',
    detail: 'Recommended after UI and /api/status live data are stable.',
  },
  {
    title: 'Which project gets today’s deep-work slot',
    detail: 'Keep one primary focus to avoid scattering across Nova, apps, games, and art.',
  },
  {
    title: 'What counts as safe automation later',
    detail: 'Future execution gates need allowlist, risk classifier, PAUSE_NOVA, audit log, and human approval.',
  },
];

const REQUESTS: RequestItem[] = [
  {
    source: 'Manual',
    title: 'Improve Mission Control board clarity',
    status: 'Active design request',
  },
  {
    source: 'Brain',
    title: 'Record dashboard roadmap and handoff',
    status: 'Needs documentation sync',
  },
  {
    source: 'Future',
    title: 'Add live /api/queues and /api/logs readers',
    status: 'Read-only planned',
  },
];

export function App() {
  const [state, setState] = useState<StatusState>({ kind: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMockPreview = state.kind === 'ready' && state.source === 'mock';

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

  const showMockPreview = useCallback(() => {
    setState({
      kind: 'ready',
      data: {
        ...mockMissionControlStatus,
        generated_at: new Date().toISOString(),
      },
      checkedAt: new Date().toISOString(),
      source: 'mock',
    });
  }, []);

  useEffect(() => {
    if (isMockPreview) return;

    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [isMockPreview, load]);

  return (
    <main className="appShell">
      <Sidebar state={state} />
      <section className="mainStage">
        <header className="hero">
          <div className="heroCopy">
            <p className="eyebrow">Nova / Hermes Adapter</p>
            <h1>Mission Control</h1>
            <p className="subtitle">A read-only work command board for daily focus, active projects, Nova runtime status, and safety gates.</p>
          </div>
          <div className="heroActions">
            <StatusBadge state={state} />
            <button className="refreshButton" type="button" onClick={load} disabled={isRefreshing}>
              <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
              Refresh Status
            </button>
          </div>
        </header>

        {state.kind === 'ready' ? (
          <Dashboard data={normalizeMissionStatus(state.data)} checkedAt={state.checkedAt} source={state.source} />
        ) : (
          <OfflinePanel state={state} onPreviewMock={showMockPreview} />
        )}
      </section>
    </main>
  );
}

function Sidebar({ state }: { state: StatusState }) {
  const isDashboardVisible = state.kind === 'ready';

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
          <a key={item} href={isDashboardVisible ? `#${sectionId(item)}` : '#offline'} className={isDashboardVisible ? '' : 'disabledLink'}>
            {item}
          </a>
        ))}
      </nav>

      <div className="sideFooter">
        <span className="sideLabel">Boundary</span>
        <strong>{state.kind === 'ready' ? `${state.source === 'mock' ? 'Mock preview' : 'GET-only online'}` : 'Offline-safe'}</strong>
        <p>No terminal, execution, token, memory-write, or remote-control features.</p>
      </div>
    </aside>
  );
}

function StatusBadge({ state }: { state: StatusState }) {
  if (state.kind === 'ready' && state.source === 'mock') {
    return <span className="badge mock"><TestTube2 size={16} /> Mock preview</span>;
  }
  if (state.kind === 'ready') {
    return <span className="badge ok"><CheckCircle2 size={16} /> Read-only online</span>;
  }
  if (state.kind === 'offline') {
    return <span className="badge warn"><AlertTriangle size={16} /> Local backend offline</span>;
  }
  return <span className="badge"><Clock3 size={16} /> Checking local status</span>;
}

function OfflinePanel({ state, onPreviewMock }: { state: StatusState; onPreviewMock: () => void }) {
  return (
    <section className="panel offlinePanel" id="offline">
      <ServerCrash size={34} />
      <div>
        <p className="eyebrow">Offline-safe state</p>
        <h2>Mission Control is not reachable</h2>
        <p className="muted">{state.kind === 'offline' ? state.message : 'Loading local status...'}</p>
        <code>{missionControlBaseUrl()}/api/status</code>
        <div className="offlineActions">
          <button className="refreshButton" type="button" onClick={onPreviewMock}>
            <TestTube2 size={16} />
            Preview Mock Dashboard
          </button>
        </div>
        <p className="muted smallText">Preview uses static local mock data only. The UI still performs no execution, terminal control, token integration, memory write, or remote control.</p>
      </div>
    </section>
  );
}

function Dashboard({ data, checkedAt, source }: { data: NormalizedMissionStatus; checkedAt: string; source: 'live' | 'mock' }) {
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [logQuery, setLogQuery] = useState('');
  const failedLogs = useMemo(() => data.logs.filter((log) => log.ok === false).length, [data.logs]);
  const visibleLogs = useMemo(() => filterLogs(data.logs, logFilter, logQuery), [data.logs, logFilter, logQuery]);
  const health = getHealthSummary(data, source);

  return (
    <div className="dashboardStack">
      {source === 'mock' ? (
        <section className="mockBanner">
          <TestTube2 size={16} />
          <strong>Mock preview mode</strong>
          <span>Auto-refresh is paused in mock mode. Use Refresh Status when you want to test the live backend again.</span>
        </section>
      ) : null}

      <section className="focusPanel" id="focus">
        <div>
          <p className="eyebrow">Today’s Focus</p>
          <h2>Make Nova Mission Control simple, readable, and useful for daily work.</h2>
          <p className="muted">Current best next step: finish the board UX on 5173, then connect live 8765 data, then merge into one local app.</p>
        </div>
        <div className="focusMeta">
          <StatusChip label="Mode" value={source === 'mock' ? 'Mock preview' : 'Live read-only'} tone={source === 'mock' ? 'warn' : 'ok'} />
          <StatusChip label="Checked" value={formatDate(checkedAt)} />
        </div>
      </section>

      <section className="projectSection" id="projects">
        <PanelTitle icon={<FolderKanban size={18} />} title="Active Projects" />
        <div className="projectGrid">
          {PROJECTS.map((project) => <ProjectCardView key={project.name} project={project} />)}
        </div>
      </section>

      <section className="statusStrip" id="system">
        <StatusChip label="Health" value={health.label} tone={health.tone} />
        <StatusChip label="Pause" value={data.pause.active ? 'Active' : 'Ready'} tone={data.pause.active ? 'warn' : 'ok'} />
        <StatusChip label="Server" value={serverAddress(data.server.host, data.server.port)} />
        <StatusChip label="Wake Logs" value={formatNumber(data.logCount)} />
      </section>

      <section className="panel healthPanel">
        <PanelTitle icon={<Activity size={18} />} title="System Health Summary" />
        <div className="healthGrid">
          <ContractItem label="Current state" value={health.description} />
          <ContractItem label="What to do next" value={health.next} />
          <ContractItem label="Live data target" value={`${missionControlBaseUrl()}/api/status`} />
          <ContractItem label="Read-only rule" value="The board can inspect status, but cannot execute tasks or write memory." />
        </div>
      </section>

      <div className="grid">
        <Metric icon={<ShieldCheck />} label="Policy" value={data.policy} tone="ok" />
        <Metric icon={<PauseCircle />} label="Pause State" value={data.pause.active ? 'Paused' : 'Ready'} tone={data.pause.active ? 'warn' : 'ok'} />
        <Metric icon={<Database />} label="Queue Total" value={formatNumber(data.queueTotal)} />
        <Metric icon={<Activity />} label="Wake Logs" value={formatNumber(data.logCount)} />

        <section className="panel wide" id="requests">
          <PanelTitle icon={<Inbox size={18} />} title="Request Inbox Preview" />
          <div className="requestList">
            {REQUESTS.map((request) => <RequestRow key={`${request.source}-${request.title}`} request={request} />)}
          </div>
          <p className="muted smallText">Requests are displayed as planning signals only. No request can run commands from this board.</p>
        </section>

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
          <LogToolbar filter={logFilter} query={logQuery} onFilterChange={setLogFilter} onQueryChange={setLogQuery} />
          <div className="logSummary">
            <span>{formatNumber(visibleLogs.length)} visible</span>
            <span>{formatNumber(data.logs.length)} total</span>
            <span>{formatNumber(failedLogs)} flagged</span>
          </div>
          <div className="logList">
            {visibleLogs.length ? visibleLogs.slice(0, 8).map((log, index) => <LogRow key={log.path ?? log.name ?? index} log={log} />) : <EmptyState text="No logs match the current filter." />}
          </div>
        </section>

        <section className="panel wide" id="decisions">
          <PanelTitle icon={<HelpCircle size={18} />} title="Decision Queue" />
          <div className="decisionList">
            {DECISIONS.map((item) => <DecisionRow key={item.title} item={item} />)}
          </div>
        </section>

        <section className="panel wide" id="brain-sync">
          <PanelTitle icon={<Brain size={18} />} title="Brain Sync" />
          <div className="brainSyncGrid">
            <ContractItem label="Current rule" value="Record meaningful work into the Obsidian brain handoff." />
            <ContractItem label="Write policy" value="UI remains read-only; brain updates happen through approved repo/doc workflow only." />
            <ContractItem label="Next handoff" value="Dashboard UX shifted toward daily focus, projects, requests, decisions, and brain sync." />
            <ContractItem label="Archivist gate" value="Future memory promotion still needs Nova Archivist review." />
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
          <PanelTitle icon={<GitBranch size={18} />} title="Runtime Paths" />
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

function ProjectCardView({ project }: { project: ProjectCard }) {
  return (
    <article className="projectCard">
      <div className="projectCardHeader">
        <Sparkles size={16} />
        <span className={`projectStatus ${project.status}`}>{project.status}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.next}</p>
      <small>{project.note}</small>
    </article>
  );
}

function RequestRow({ request }: { request: RequestItem }) {
  return (
    <article className="requestRow">
      <span>{request.source}</span>
      <strong>{request.title}</strong>
      <p>{request.status}</p>
    </article>
  );
}

function DecisionRow({ item }: { item: DecisionItem }) {
  return (
    <article className="decisionRow">
      <strong>{item.title}</strong>
      <p>{item.detail}</p>
    </article>
  );
}

function LogToolbar({
  filter,
  query,
  onFilterChange,
  onQueryChange,
}: {
  filter: LogFilter;
  query: string;
  onFilterChange: (filter: LogFilter) => void;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="logToolbar">
      <div className="searchBox">
        <Search size={15} />
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search logs by name, status, or path" />
      </div>
      <div className="filterButtons" role="group" aria-label="Log filters">
        {(['all', 'ok', 'flagged'] as const).map((item) => (
          <button key={item} type="button" className={filter === item ? 'activeFilter' : ''} onClick={() => onFilterChange(item)}>
            {item}
          </button>
        ))}
      </div>
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

function filterLogs(logs: WakeLog[], filter: LogFilter, query: string): WakeLog[] {
  const normalizedQuery = query.trim().toLowerCase();

  return logs.filter((log) => {
    const matchesFilter = filter === 'all' || (filter === 'ok' ? log.ok !== false : log.ok === false);
    const haystack = `${log.name ?? ''} ${log.status ?? ''} ${log.path ?? ''}`.toLowerCase();
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });
}

function getHealthSummary(data: NormalizedMissionStatus, source: 'live' | 'mock'): { label: string; tone: 'ok' | 'warn'; description: string; next: string } {
  if (source === 'mock') {
    return {
      label: 'Mock only',
      tone: 'warn',
      description: 'The board is showing static preview data. This is good for UI review but not live Nova status.',
      next: 'Start the local Mission Control backend on 8765, then press Refresh Status.',
    };
  }

  if (data.pause.active) {
    return {
      label: 'Paused',
      tone: 'warn',
      description: 'Mission Control is reachable, but Nova is currently paused by the PAUSE_NOVA gate.',
      next: 'Inspect the pause reason before continuing any future workflow.',
    };
  }

  return {
    label: 'Ready',
    tone: 'ok',
    description: 'Mission Control is reachable and reporting a ready read-only status.',
    next: 'Review queues, logs, requests, and decisions before choosing the next work block.',
  };
}

function sectionId(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}
