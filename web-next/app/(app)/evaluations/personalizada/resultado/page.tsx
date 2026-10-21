'use client';

import PageShell from '@/components/PageShell';
import UserScopePicker from '@/components/data/UserScopePicker';
import { firestoreHelpers, useCollectionData } from '@/lib/firestoreHooks';
import { useSearchParams } from 'next/navigation';
import { useStudentScopeFromQuery } from '@/lib/hooks/useStudentScopeFromQuery';
import PersonalStudentRequired from '@/components/data/PersonalStudentRequired';
import { useMemo } from 'react';

interface ResultadoRow {
  id: string;
  resultado?: string;
  recomendacoes?: string[];
  createdAt?: any;
  data?: any;
}

export default function ResultadoPersonalizadaPage() {
  const searchParams = useSearchParams();
  const requestedStudentId = searchParams.get('studentId') || '';
  const studentScope = useStudentScopeFromQuery(requestedStudentId);
  const { userId, isPersonal } = studentScope;
  const query = useMemo(() => [firestoreHelpers.orderBy('createdAt', 'desc'), firestoreHelpers.limit(1)], []);
  const { data } = useCollectionData<ResultadoRow>(['users', userId, 'avaliacaoPersonalizada'], query);
  const latest = data[0];

  if (isPersonal && !userId) {
    return (
      <PageShell title="Resultado da avaliação" description="Consulte o resultado do aluno selecionado.">
        <PersonalStudentRequired
          loading={studentScope.loading}
          requestedStudentId={requestedStudentId}
          error={studentScope.error}
          description="Abra o perfil de um aluno da sua lista para ver o resultado."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Resultado da avaliacao personalizada"
      description="Resumo do questionario e plano sugerido."
      breadcrumbs={[{
        label: 'Avaliacoes',
        href: isPersonal && userId ? `/evaluations?studentId=${encodeURIComponent(userId)}` : '/evaluations',
      }]}
    >
      <UserScopePicker />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div className="card">
          <h3>Resultado</h3>
          {userId && latest ? (
            <>
              <p className="subtle" style={{ marginTop: 8 }}>{latest.resultado ?? 'Resultado nao informado.'}</p>
              {latest.recomendacoes?.length ? (
                <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {latest.recomendacoes.map((item, index) => (
                    <li key={`${latest.id}-rec-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="subtle" style={{ marginTop: 8 }}>Informe um UID para ver resultados.</p>
          )}
        </div>
        <div className="card">
          <h3>Proximos passos</h3>
          <p className="subtle" style={{ marginTop: 8 }}>
            Ajustes recomendados para as proximas 4 semanas.
          </p>
          <button className="button" style={{ marginTop: 12 }}>
            Salvar no perfil do aluno
          </button>
        </div>
      </div>
    </PageShell>
  );
}
