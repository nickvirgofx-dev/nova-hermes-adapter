import type { MissionControlStatus } from './types';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8765';

export function missionControlBaseUrl(): string {
  return import.meta.env.VITE_MISSION_CONTROL_URL || DEFAULT_BASE_URL;
}

export async function fetchMissionControlStatus(signal?: AbortSignal): Promise<MissionControlStatus> {
  const response = await fetch(`${missionControlBaseUrl()}/api/status`, {
    method: 'GET',
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Mission Control returned ${response.status}`);
  }

  return response.json() as Promise<MissionControlStatus>;
}
