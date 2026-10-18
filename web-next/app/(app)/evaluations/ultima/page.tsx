'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import PageShell from '@/components/PageShell';
import UserScopePicker from '@/components/data/UserScopePicker';
import { useAuth } from '@/lib/auth';
import { useCollectionData, useUserScope } from '@/lib/firestoreHooks';
import type { EvaluationStatus, EvaluationType } from '@/lib/types/evaluation';
import mobileStyles from '../evaluationMobile.module.css';

interface EvaluationRow {
  id: string;
  status?: string;
  date?: unknown;
  createdAt?: unknown;
  prazoResposta?: unknown;
  data?: unknown;
  peso?: number;
  percentualGordura?: number;
  percentualDeGordura?: number;
  porcentualDeGordura?: number;
  percentualGorduraSiri?: number;
  percentualGorduraBrozek?: number;
  massaMagra?: number;
  composicaoCorporal?: {
    peso?: number;
    percentualGordura?: number;
    massaMagra?: number;
  };
  resultado?: string;
  recomendacoes?: string[];
}

interface EvaluationItem extends EvaluationRow {
  type: EvaluationType;
  dateValue: Date | null;
}

const typeLabels: Record<EvaluationType, string> = {
  online: 'Online',
  personalizada: 'Personalizada',
  postural: 'Postural',
  fisica: 'Física',
};

const statusLabels: Record<EvaluationStatus, string> = {
  pendente: 'Pendente',
  agendada: 'Agendada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
  nao_realizada: 'Não realizada',
};

const statusColors: Record<EvaluationStatus, string> = {
  pendente: '#6c757d',
  agendada: '#5bc0de',
  em_andamento: '#4361ee',
  concluida: '#2f855a',
  cancelada: '#d9534f',
  nao_realizada: '#b7791f',
};

const evaluationStatuses = Object.keys(statusLabels) as EvaluationStatus[];

function toDate(value: unknown): Date | null {
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    const result = (value as { toDate: () => Date }).toDate();
    return result instanceof Date && Number.isFinite(result.getTime()) ? result : null;
  }
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const result = new Date(value);
  return Number.isFinite(result.getTime()) ? result : null;
}

function formatEvaluationDate(value: Date | null): string {
  if (!value) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value).replace('.', '');
}

function metricValue(...values: unknown[]): number | undefined {
  const value = values.find((candidate) => typeof candidate === 'number' && Number.isFinite(candidate));
  return typeof value === 'number' ? value : undefined;
}

function formatMetric(value: number, unit: string): string {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

export default function UltimaAvaliacaoPage() {
  const { userId } = useUserScope();
  const { role } = useAuth();
  const emptyConstraints = useMemo(() => [], []);
  const onlinePath = useMemo(() => ['users', userId, 'avaliacaoOnline'], [userId]);
  const posturalPath = useMemo(() => ['users', userId, 'avaliacaoPostural'], [userId]);
  const personalizadaPath = useMemo(() => ['users', userId, 'avaliacaoPersonalizada'], [userId]);
  const fisicaPath = useMemo(() => ['users', userId, 'avaliacoesFisicas'], [userId]);
  const online = useCollectionData<EvaluationRow>(onlinePath, emptyConstraints);
  const postural = useCollectionData<EvaluationRow>(posturalPath, emptyConstraints);
  const personalizada = useCollectionData<EvaluationRow>(personalizadaPath, emptyConstraints);
  const fisica = useCollectionData<EvaluationRow>(fisicaPath, emptyConstraints);

  const evaluations = useMemo(() => {
    const collections: Array<{ type: EvaluationType; rows: EvaluationRow[] }> = [
      { type: 'online', rows: online.data },
      { type: 'postural', rows: postural.data },
      { type: 'personalizada', rows: personalizada.data },
      { type: 'fisica', rows: fisica.data },
    ];

    return collections
      .flatMap(({ type, rows }) => rows.map((row) => {
        const dateValue = [row.date, row.createdAt, row.prazoResposta, row.data]
          .map(toDate)
          .find((date): date is Date => Boolean(date)) ?? null;
        return { ...row, type, dateValue };
      }))
      .sort((left, right) => (right.dateValue?.getTime() ?? 0) - (left.dateValue?.getTime() ?? 0));
  }, [fisica.data, online.data, personalizada.data, postural.data]);

  const latest = evaluations[0];
  const loading = online.loading || postural.loading || personalizada.loading || fisica.loading;
  const error = online.error || postural.error || personalizada.error || fisica.error;
  const status = latest && evaluationStatuses.includes(latest.status as EvaluationStatus)
    ? latest.status as EvaluationStatus
    : null;
  const bodyComposition = latest?.composicaoCorporal;
  const metrics = latest ? [
    { label: 'Peso', value: metricValue(latest.peso, bodyComposition?.peso), unit: 'kg' },
    {
      label: 'Gordura corporal',
      value: metricValue(
        latest.porcentualDeGordura,
        latest.percentualDeGordura,
        latest.percentualGordura,
        bodyComposition?.percentualGordura,
        latest.percentualGorduraSiri,
        latest.percentualGorduraBrozek
      ),
      unit: '%',
    },
    { label: 'Massa magra', value: metricValue(latest.massaMagra, bodyComposition?.massaMagra), unit: 'kg' },
  ].filter((metric): metric is { label: string; value: number; unit: string } => metric.value !== undefined) : [];
  const recommendations = latest?.recomendacoes?.filter((item) => typeof item === 'string' && item.trim()) ?? [];

  return (
    <PageShell
      title="Última avaliação"
      description="Resumo do registro mais recente deste perfil."
      breadcrumbs={[{ label: 'Avaliações', href: '/evaluations' }]}
    >
      <UserScopePicker />
      <div className={`student-evaluation-detail ${mobileStyles.evaluationContent}`}>
        <section className="card student-eval-detail-content">
          <div className="student-eval-detail-section-header">
            <h3>Resumo</h3>
            {status && latest && (
              <span
                className="student-eval-status"
                style={{ backgroundColor: `${statusColors[status]}1F`, color: statusColors[status] }}
              >
                {statusLabels[status]}
              </span>
            )}
          </div>

          {loading ? (
            <p className="student-eval-detail-note" role="status">Carregando avaliações…</p>
          ) : error ? (
            <p className="student-eval-detail-note" role="alert">
              Não foi possível carregar o histórico agora. Tente novamente mais tarde.
            </p>
          ) : !userId ? (
            <div className="student-empty-state">
              <p>{role === 'admin' ? 'Informe o UID de um aluno para consultar as avaliações.' : 'Não foi possível identificar o perfil atual.'}</p>
            </div>
          ) : !latest ? (
            <div className="student-empty-state">
              <p>Nenhuma avaliação foi registrada para este perfil.</p>
              <Link href="/evaluations" className="button secondary">Ver histórico</Link>
            </div>
          ) : (
            <div className="student-eval-detail-content">
              <div className="student-eval-detail-grid">
                <div className="student-eval-detail-metric">
                  <span>Tipo de avaliação</span>
                  <strong>{typeLabels[latest.type]}</strong>
                </div>
                <div className="student-eval-detail-metric">
                  <span>Data</span>
                  <strong>{formatEvaluationDate(latest.dateValue)}</strong>
                </div>
                {metrics.map((metric) => (
                  <div className="student-eval-detail-metric" key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{formatMetric(metric.value, metric.unit)}</strong>
                  </div>
                ))}
              </div>

              {latest.resultado && (
                <section className="student-section-card">
                  <h4>Resultado</h4>
                  <p className="student-eval-detail-note">{latest.resultado}</p>
                </section>
              )}

              {recommendations.length > 0 && (
                <section className="student-section-card">
                  <h4>Recomendações</h4>
                  <div className="student-eval-detail-tags">
                    {recommendations.map((item, index) => (
                      <span className="student-eval-detail-tag" key={`${latest.id}-recommendation-${index}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {metrics.length === 0 && !latest.resultado && recommendations.length === 0 && (
                <p className="student-eval-detail-note">Este registro ainda não contém medidas ou um resumo.</p>
              )}

              <Link href={`/evaluations/${latest.id}?type=${latest.type}`} className="button secondary">
                Ver avaliação completa
              </Link>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
