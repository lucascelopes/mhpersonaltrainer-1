/** Parses amounts typed in Brazilian currency fields, including grouped thousands. */
export function parseBrazilianMoneyInput(value: string): number {
  const numeric = value.replace(/[^\d,.-]/g, '').trim();
  if (!numeric || numeric.includes('-')) return 0;

  const lastSeparator = Math.max(numeric.lastIndexOf(','), numeric.lastIndexOf('.'));
  const digitsAfterSeparator = lastSeparator < 0 ? 0 : numeric.length - lastSeparator - 1;
  const decimalSeparator = digitsAfterSeparator > 0 && digitsAfterSeparator <= 2
    ? numeric[lastSeparator]
    : null;
  const cleaned = decimalSeparator
    ? `${numeric.slice(0, lastSeparator).replace(/[.,]/g, '')}.${numeric.slice(lastSeparator + 1)}`
    : numeric.replace(/[.,]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : 0;
}
