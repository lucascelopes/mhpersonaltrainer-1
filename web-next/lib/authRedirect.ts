/** Keep post-auth navigation on this app, even when the redirect query is user supplied. */
export function internalAuthRedirect(value: string | null, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
