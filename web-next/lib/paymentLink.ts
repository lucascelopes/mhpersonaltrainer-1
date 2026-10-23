export function isValidPaymentLink(value?: string | null): boolean {
  if (!value?.trim()) return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}
