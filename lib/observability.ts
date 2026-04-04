type LogLevel = 'info' | 'warn' | 'error';

export function logEvent(level: LogLevel, event: string, details: Record<string, unknown> = {}) {
  const payload = {
    level,
    event,
    details,
    ts: new Date().toISOString(),
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}
