export type SupportTicketStatus = 'aberto' | 'em_andamento' | 'respondido' | 'resolvido';
export type SupportTicketPriority = 'baixa' | 'media' | 'alta' | 'critica';

const normalize = (value?: string | null) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

export const SUPPORT_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  baixa: 'Baixa', media: 'Média', alta: 'Alta', critica: 'Crítica',
};

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  aberto: 'Aberto', em_andamento: 'Em andamento', respondido: 'Respondido', resolvido: 'Resolvido',
};

export function normalizeSupportPriority(value?: string | null): SupportTicketPriority {
  const priority = normalize(value);
  return priority === 'media' || priority === 'alta' || priority === 'critica' ? priority : 'baixa';
}

export function resolveSupportStatus(ticket: { status?: string | null; resposta?: string | null }): SupportTicketStatus {
  const status = normalize(ticket.status).replace(/\s+/g, '_');
  if (status === 'resolvido' || status === 'fechado') return 'resolvido';
  if (status === 'em_andamento') return 'em_andamento';
  if (status === 'respondido') return 'respondido';
  if (status === 'aberto') return 'aberto';
  // Old records without an explicit status may already contain a team reply.
  return String(ticket.resposta || '').trim() ? 'respondido' : 'aberto';
}
