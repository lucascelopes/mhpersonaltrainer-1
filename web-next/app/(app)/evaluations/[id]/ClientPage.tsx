'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import mobileStyles from '../evaluationMobile.module.css';
import PageShell from '@/components/PageShell';
import { useAuth } from '@/lib/auth';
import { formatDate, useUserScope } from '@/lib/firestoreHooks';
import {
  fetchEvaluationById,
  getEvaluationStatusColor,
  getEvaluationStatusLabel,
  getEvaluationTypeLabel,
} from '@/lib/services/evaluations';
import type {
  Circumferences,
  EvaluationAnswer,
  EvaluationType,
  OnlineEvaluation,
  PersonalizedEvaluation,
  PhysicalEvaluation,
  PhysicalTestEvaluation,
  PosturalEvaluation,
} from '@/lib/types/evaluation';

const evaluationTypes: EvaluationType[] = ['online', 'postural', 'personalizada', 'fisica'];

const isEvaluationType = (value: string | null): value is EvaluationType =>
  value === 'online' || value === 'postural' || value === 'personalizada' || value === 'fisica';

const formatMetric = (value?: number, suffix?: string) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)}${suffix ? ` ${suffix}` : ''}`
    : '-';

const hasAnswerValue = (value: EvaluationAnswer['resposta']) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

const mapCircumferenceEntries = (circunferencias?: Circumferences) => {
  if (!circunferencias) return [];
  const labels: Record<string, string> = {
    pescoco: 'Pescoço',
    ombro: 'Ombro',
    torax: 'Tórax',
    cintura: 'Cintura',
    quadril: 'Quadril',
    bracoDireito: 'Braço direito',
    bracoEsquerdo: 'Braço esquerdo',
    antebracoDireito: 'Antebraço direito',
    antebracoEsquerdo: 'Antebraço esquerdo',
    punhoDireito: 'Punho direito',
    punhoEsquerdo: 'Punho esquerdo',
    coxaDireita: 'Coxa direita',
    coxaEsquerda: 'Coxa esquerda',
    panturrilhaDireita: 'Panturrilha direita',
    panturrilhaEsquerda: 'Panturrilha esquerda',
  };
  return Object.entries(circunferencias)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
    .map(([key, value]) => ({
      label: labels[key] || key,
      value: Number(value),
    }));
};

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="student-icon">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export default function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, isLoading: authLoading } = useAuth();
  const { userId } = useUserScope();
  const isStudent = role === 'aluno';

  const evaluationId = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    return last && last !== 'evaluations' ? last : params.id;
  }, [pathname, params.id]);

  const typeParam = searchParams.get('type');
  const requestedType = isEvaluationType(typeParam) ? typeParam : null;
  const requestedUserId = searchParams.get('studentId') || searchParams.get('userId');
  const scopedUserId = role === 'admin' ? requestedUserId || userId : userId;

  const [evaluation, setEvaluation] = useState<PhysicalEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (authLoading) return;
      if (!scopedUserId || !evaluationId) {
        setError(scopedUserId ? 'Avaliação não encontrada.' : 'Nenhum aluno selecionado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setEvaluation(null);

      const typesToTry = requestedType ? [requestedType] : evaluationTypes;
      let lastError = '';

      for (const type of typesToTry) {
        const result = await fetchEvaluationById(evaluationId, type, scopedUserId, {
          allowLegacyLookup: !isStudent,
        });
        if (!active) return;
        if (result.data) {
          setEvaluation(result.data);
          setLoading(false);
          return;
        }
        if (result.error) {
          lastError = result.error;
        }
      }

      setError(lastError || 'Avaliação não encontrada.');
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [authLoading, evaluationId, isStudent, requestedType, scopedUserId]);

  const typeLabel = evaluation ? getEvaluationTypeLabel(evaluation.type) : '';
  const statusLabel = evaluation ? getEvaluationStatusLabel(evaluation.status) : '';
  const statusColor = evaluation ? getEvaluationStatusColor(evaluation.status) : '#6b7280';
  const evaluationDate = evaluation ? formatDate(evaluation.date) : '-';
  const updatedDate = evaluation ? formatDate(evaluation.updatedAt || evaluation.createdAt) : '-';

  const onlineData = evaluation?.type === 'online' ? (evaluation as OnlineEvaluation) : null;
  const posturalData = evaluation?.type === 'postural' ? (evaluation as PosturalEvaluation) : null;
  const personalizedData =
    evaluation?.type === 'personalizada' ? (evaluation as PersonalizedEvaluation) : null;
  const physicalData =
    evaluation?.type === 'fisica' ? (evaluation as PhysicalTestEvaluation) : null;

  const onlineCirc = useMemo(
    () => mapCircumferenceEntries(onlineData?.circunferencias),
    [onlineData?.circunferencias]
  );
  const physicalCirc = useMemo(
    () => mapCircumferenceEntries(physicalData?.composicaoCorporal?.circunferencias),
    [physicalData?.composicaoCorporal?.circunferencias]
  );

  const personalizedAnswered = personalizedData
    ? personalizedData.respostas?.filter((item) => hasAnswerValue(item.resposta)).length || 0
    : 0;
  const personalizedQuestions = personalizedData?.perguntas?.length || 0;

  const photoCount = posturalData
    ? Object.values(posturalData.fotosPostura || {}).filter(Boolean).length
    : 0;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/evaluations');
  };

  const body = (
    <div className="student-eval-detail-content">
      <section className="student-section-card">
        <div className="student-eval-detail-section-header">
          <h3>Resumo</h3>
          <span
            className="student-eval-status"
            style={{ backgroundColor: `${statusColor}1F`, color: statusColor }}
          >
            {statusLabel}
          </span>
        </div>
        <div className="student-eval-detail-grid">
          <div className="student-eval-detail-metric">
            <span>Tipo</span>
            <strong>{typeLabel}</strong>
          </div>
          <div className="student-eval-detail-metric">
            <span>Data</span>
            <strong>{evaluationDate}</strong>
          </div>
          <div className="student-eval-detail-metric">
            <span>Atualizado</span>
            <strong>{updatedDate}</strong>
          </div>
        </div>
      </section>

      {onlineData && (
        <section className="student-section-card">
          <h3>Indicadores online</h3>
          <div className="student-eval-detail-grid">
            <div className="student-eval-detail-metric">
              <span>Peso</span>
              <strong>{formatMetric(onlineData.peso, 'kg')}</strong>
            </div>
            <div className="student-eval-detail-metric">
              <span>Altura</span>
              <strong>{formatMetric(onlineData.altura, 'm')}</strong>
            </div>
            <div className="student-eval-detail-metric">
              <span>IMC</span>
              <strong>{formatMetric(onlineData.imc)}</strong>
            </div>
          </div>
          {onlineData.observacoes && (
            <p className="student-eval-detail-note">{onlineData.observacoes}</p>
          )}
          {onlineCirc.length > 0 && (
            <div className="student-eval-detail-tags">
              {onlineCirc.slice(0, 10).map((item) => (
                <span key={`online-${item.label}`} className="student-eval-detail-tag">
                  {item.label}: {formatMetric(item.value)}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {posturalData && (
        <section className="student-section-card">
          <h3>Análise postural</h3>
          <div className="student-eval-detail-grid">
            <div className="student-eval-detail-metric">
              <span>Fotos enviadas</span>
              <strong>{photoCount}</strong>
            </div>
            <div className="student-eval-detail-metric">
              <span>Recomendações</span>
              <strong>{posturalData.recomendacoes?.length || 0}</strong>
            </div>
          </div>
          {posturalData.analise?.observacoes && (
            <p className="student-eval-detail-note">{posturalData.analise.observacoes}</p>
          )}
          {!!posturalData.recomendacoes?.length && (
            <div className="student-eval-detail-tags">
              {posturalData.recomendacoes.slice(0, 8).map((item, index) => (
                <span key={`postural-${index}`} className="student-eval-detail-tag">
                  {item}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {personalizedData && (
        <section className="student-section-card">
          <h3>Avaliação personalizada</h3>
          <div className="student-eval-detail-grid">
            <div className="student-eval-detail-metric">
              <span>Perguntas</span>
              <strong>{personalizedQuestions}</strong>
            </div>
            <div className="student-eval-detail-metric">
              <span>Respondidas</span>
              <strong>
                {personalizedAnswered}/{personalizedQuestions}
              </strong>
            </div>
            <div className="student-eval-detail-metric">
              <span>Prazo</span>
              <strong>{personalizedData.prazoResposta ? formatDate(personalizedData.prazoResposta) : '-'}</strong>
            </div>
          </div>
          {personalizedData.resultado && (
            <p className="student-eval-detail-note">{personalizedData.resultado}</p>
          )}
          {!!personalizedData.recomendacoes?.length && (
            <div className="student-eval-detail-tags">
              {personalizedData.recomendacoes.slice(0, 8).map((item, index) => (
                <span key={`personalizada-${index}`} className="student-eval-detail-tag">
                  {item}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {physicalData && (
        <section className="student-section-card">
          <h3>Avaliação física</h3>
          <div className="student-eval-detail-grid">
            {typeof physicalData.composicaoCorporal?.peso === 'number' && physicalData.composicaoCorporal.peso > 0 && (
              <div className="student-eval-detail-metric">
                <span>Peso</span>
                <strong>{formatMetric(physicalData.composicaoCorporal.peso, 'kg')}</strong>
              </div>
            )}
            {typeof physicalData.composicaoCorporal?.imc === 'number' && physicalData.composicaoCorporal.imc > 0 && (
              <div className="student-eval-detail-metric">
                <span>IMC</span>
                <strong>{formatMetric(physicalData.composicaoCorporal.imc)}</strong>
              </div>
            )}
            {typeof physicalData.composicaoCorporal?.percentualGordura === 'number' && (
              <div className="student-eval-detail-metric">
                <span>% Gordura</span>
                <strong>{formatMetric(physicalData.composicaoCorporal.percentualGordura, '%')}</strong>
              </div>
            )}
            {typeof physicalData.composicaoCorporal?.massaMagra === 'number' && physicalData.composicaoCorporal.massaMagra > 0 && (
              <div className="student-eval-detail-metric">
                <span>Massa magra</span>
                <strong>{formatMetric(physicalData.composicaoCorporal.massaMagra, 'kg')}</strong>
              </div>
            )}
            {!!physicalData.testes?.length && (
              <div className="student-eval-detail-metric">
                <span>Testes</span>
                <strong>{physicalData.testes.length}</strong>
              </div>
            )}
            {!!physicalData.resultados?.length && (
              <div className="student-eval-detail-metric">
                <span>Resultados dos testes</span>
                <strong>{physicalData.resultados.length}</strong>
              </div>
            )}
          </div>
          {physicalCirc.length > 0 && (
            <div className="student-eval-detail-tags">
              {physicalCirc.slice(0, 10).map((item) => (
                <span key={`fisica-${item.label}`} className="student-eval-detail-tag">
                  {item.label}: {formatMetric(item.value)}
                </span>
              ))}
            </div>
          )}
          {physicalData.resultado && (
            <div>
              <h4>Resultado</h4>
              <p className="student-eval-detail-note">{physicalData.resultado}</p>
            </div>
          )}
          {!!physicalData.recomendacoes?.length && (
            <div>
              <h4>Recomendações</h4>
              <div className="student-eval-detail-tags">
                {physicalData.recomendacoes.map((item, index) => (
                  <span key={`fisica-recomendacao-${index}`} className="student-eval-detail-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <PageShell title="Avaliação" description="Carregando seu perfil de acesso.">
        <p className="subtle" role="status" aria-live="polite">Carregando perfil…</p>
      </PageShell>
    );
  }

  if (isStudent) {
    return (
      <section className={`student-evaluation-detail ${mobileStyles.evaluationContent}`}>
        <header className="student-eval-detail-header">
          <button
            type="button"
            className="student-workout-back"
            onClick={handleBack}
            aria-label="Voltar às avaliações"
          >
            <IconArrowLeft />
          </button>
          <div className="student-eval-detail-title">
            <p>Avaliações</p>
            <h1>{loading ? 'Carregando…' : evaluation ? `Avaliação ${typeLabel}` : 'Avaliação'}</h1>
            {!loading && evaluation && <span>{evaluationDate}</span>}
          </div>
        </header>

        {loading ? (
          <div className="student-loading">
            <p className="student-home-kicker">Carregando avaliação</p>
            <p className="student-home-sub">Buscando detalhes completos.</p>
          </div>
        ) : error || !evaluation ? (
          <div className="student-empty-state">
            <p>{error || 'Avaliação não encontrada.'}</p>
            <button type="button" className="student-inline-button" onClick={handleBack}>
              Voltar às avaliações
            </button>
          </div>
        ) : (
          body
        )}
      </section>
    );
  }

  return (
    <PageShell
      title={loading ? 'Avaliação' : evaluation ? `Avaliação ${typeLabel}` : 'Avaliação'}
      description="Detalhes da avaliação e indicadores do aluno."
      breadcrumbs={[{ label: 'Avaliações', href: '/evaluations' }]}
    >
      {loading ? (
        <p className="subtle">Carregando avaliação…</p>
      ) : error || !evaluation ? (
        <div className="portal-empty">
          <strong>{error || 'Avaliação não encontrada.'}</strong>
        </div>
      ) : (
        body
      )}
    </PageShell>
  );
}
