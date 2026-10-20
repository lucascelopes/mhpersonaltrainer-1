export type UserDisplayRole = 'admin' | 'academy' | 'personal' | 'aluno';

const enabled = (value: unknown) => value === true || value === 'true' || value === 1;

export function getUserDisplayRole(data: {
  email?: unknown;
  admin?: unknown;
  academyAccount?: unknown;
  professorAccount?: unknown;
}): UserDisplayRole {
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  if (enabled(data.admin) && email.endsWith('@admin.com')) return 'admin';
  if (enabled(data.academyAccount)) return 'academy';
  if (enabled(data.professorAccount)) return 'personal';
  return 'aluno';
}
