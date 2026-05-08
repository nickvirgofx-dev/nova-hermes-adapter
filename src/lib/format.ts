export function formatDate(value?: string): string {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatNumber(value?: number): string {
  return Number.isFinite(value) ? String(value) : '0';
}

export function formatBytes(value?: number): string {
  if (!value || value <= 0) return '-';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function serverAddress(host = '127.0.0.1', port = 8765): string {
  return `${host}:${port}`;
}
