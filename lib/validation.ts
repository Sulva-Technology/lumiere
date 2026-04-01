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

  return fallback;
}
