'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { formatDate } from '@/lib/firestoreHooks';
import { fetchAppointmentById, confirmAppointment, cancelAppointment } from '@/lib/services/scheduling';
import { useAuth } from '@/lib/auth';

const actionErrorMessage = (error: string | undefined, action: 'confirmar' | 'cancelar') => {
  if (/permission[_ -]?denied|insufficient permissions/i.test(error || '')) {
    return 'Você não tem permissão para alterar este agendamento.';
  }
  return `Não foi possível ${action} o agendamento. Tente novamente.`;
};

export default function ScheduleDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const appointmentId = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    return last && last !== 'schedule' ? last : params.id;
  }, [pathname, params.id]);
  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.uid) {
        setAppointment(null);
        setLoading(authLoading);
        setError(authLoading ? '' : 'Entre na sua conta para ver este agendamento.');
        return;
      }
      setLoading(true);
      setError('');
      setAppointment(null);
      const result = await fetchAppointmentById(appointmentId);
      if (!active) return;
      if (result.data) {
        setAppointment(result.data);
      } else {
        setAppointment(null);
        setError(result.error || 'Agendamento não encontrado.');
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [appointmentId, user?.uid, authLoading]);

  const handleConfirm = async () => {
    if (!user?.uid || !appointment) return;
    setSaving(true);
    const result = await confirmAppointment(appointment.id);
    if (result.error || !result.data) {
      setError(actionErrorMessage(result.error, 'confirmar'));
    } else {
      setError('');
      setAppointment({ ...appointment, status: 'confirmado' });
    }
    setSaving(false);
  };

  const handleCancel = async () => {
    if (!user?.uid || !appointment) return;
    setSaving(true);
    const result = await cancelAppointment(appointment.id);
    if (result.error || !result.data) {
      setError(actionErrorMessage(result.error, 'cancelar'));
    } else {
      setError('');
      setAppointment({ ...appointment, status: 'cancelado' });
    }
    setSaving(false);
  };

  return (
    <PageShell
      title="Detalhes do agendamento"
      description="Consulte os detalhes e o status do agendamento."
      breadcrumbs={[{ label: 'Agenda', href: '/schedule' }]}
    >
      {loading && <p className="subtle" role="status">Carregando agendamento...</p>}
      {error && <p role="alert" style={{ color: '#c0392b' }}>{error}</p>}
      {appointment && (
        <div className="card">
          <p><strong>Tipo:</strong> {appointment.tipo}</p>
          <p><strong>Status:</strong> {appointment.status}</p>
          <p><strong>Data:</strong> {formatDate(appointment.data)}</p>
          <p><strong>Início:</strong> {appointment.horaInicio}</p>
          <p><strong>Fim:</strong> {appointment.horaFim}</p>
          {appointment.observacoes && (
            <p style={{ marginTop: 8 }}><strong>Observações:</strong> {appointment.observacoes}</p>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="button" type="button" onClick={handleConfirm} disabled={saving}>
              Confirmar
            </button>
            <button className="button secondary" type="button" onClick={handleCancel} disabled={saving}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
