type ReportedError = { message?: unknown; code?: unknown };

export function shouldReportAppError(error: ReportedError): boolean {
  const marker = [error.message, error.code].find(
    (value): value is string => typeof value === 'string' && /^\s*(?:Error:\s*)?NEXT_REDIRECT(?:;|\s*$)/.test(value)
  );
  return !marker;
}
