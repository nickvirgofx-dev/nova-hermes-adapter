import type { MissionControlStatus } from './types';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8765';
const REQUEST_TIMEOUT_MS = 8_000;

export function missionControlBaseUrl(): string {
  const configured = import.meta.env.VITE_MISSION_CONTROL_URL;
  return typeof configured === 'string' && configured.trim() ? configured.trim().replace(/\/$/, '') : DEFAULT_BASE_URL;
}

export async function fetchMissionControlStatus(signal?: AbortSignal): Promise<MissionControlStatus> {
  const timeout = new AbortController();
  const timeoutId = window.setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  const requestSignal = mergeAbortSignals(signal, timeout.signal);

  try {
    const response = await fetch(`${missionControlBaseUrl()}/api/status`, {
      method: 'GET',
      signal: requestSignal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Mission Control returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('Mission Control did not return JSON');
    }

    return response.json() as Promise<MissionControlStatus>;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Mission Control request timed out');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function mergeAbortSignals(...signals: Array<AbortSignal | undefined>): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (!signal) continue;
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}
