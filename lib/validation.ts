import { ZodError } from 'zod';

function labelForPath(path: Array<string | number>) {
  if (path.length === 0) return 'Field';

  return path
    .map((segment) =>
      String(segment)
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]+/g, ' ')
        .trim()
    )
    .join(' ')
    .replace(/^\w/, (character) => character.toUpperCase());
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => {
        const label = labelForPath(issue.path.filter((segment): segment is string | number => typeof segment !== 'symbol'));
        if (issue.message.toLowerCase().includes(label.toLowerCase())) {
          return issue.message;
        }
        return `${label}: ${issue.message}`;
      })
      .join(' ');
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message;
    }

    const parts = [record.error_description, record.details, record.hint]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim());

    if (parts.length > 0) {
      return parts.join(' ');
    }
  }

  return fallback;
}
