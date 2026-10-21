'use client';

import PageShell from '@/components/PageShell';
import UserScopePicker from '@/components/data/UserScopePicker';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStudentScopeFromQuery } from '@/lib/hooks/useStudentScopeFromQuery';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useState, type FormEvent } from 'react';

const COLLECTIONS: Record<string, string> = {
  postural: 'avaliacaoPostural',
  fisica: 'avaliacoesFisicas',
  personalizada: 'avaliacaoPersonalizada',
};

export default function EvaluationCreatePage() {
  const searchParams = useSearchParams();
  const studentScope = useStudentScopeFromQuery(searchParams.get('studentId') || '');
  const { userId, isPersonal, student } = studentScope;
  const [tipo, setTipo] = useState<'postural' | 'fisica' | 'personalizada'>('postural');
  const [aluno, setAluno] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', userId, COLLECTIONS[tipo]), {
        aluno: isPersonal ? student?.nome || '' : aluno,
        observacoes,
        status: 'pendente',
        createdAt: Timestamp.now(),
        tipo,
      });
      setAluno('');
      setObservacoes('');
    } finally {
      setSaving(false);
    }
  };

  if (isPersonal && !userId) {
    const requestedStudentId = searchParams.get('studentId') || '';
    return (
      <PageShell title="Nova avaliação" description="Escolha um aluno antes de criar uma avaliação.">
        <section className="portal-card" aria-live="polite">
          <h2>{studentScope.loading ? 'Carregando aluno' : 'Selecione um aluno'}</h2>
          <p className="subtle">
            {studentScope.loading
              ? 'Conferindo o acesso ao aluno...'
              : studentScope.error || (requestedStudentId
                ? 'Esse aluno não está vinculado à sua conta.'
                : 'Abra o perfil de um aluno da sua lista para criar uma avaliação.')}
          </p>
          <Link href="/students" className="button">Ver alunos</Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={isPersonal && student ? `Nova avaliação para ${student.nome}` : 'Nova avaliacao'}
      description="Crie uma avaliacao fisica, postural ou personalizada."
      breadcrumbs={[{
        label: 'Avaliacoes',
        href: isPersonal && userId ? `/evaluations?studentId=${encodeURIComponent(userId)}` : '/evaluations',
      }]}
    >
      <div className="card">
        <UserScopePicker />
        <form style={{ display: 'grid', gap: 12 }} onSubmit={handleSubmit}>
          <label>
            Tipo de avaliacao
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as 'postural' | 'fisica' | 'personalizada')}
              style={{ marginTop: 6, width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}
            >
              <option value="postural">Postural</option>
              <option value="fisica">Fisica</option>
              <option value="personalizada">Personalizada</option>
            </select>
          </label>
          <label>
            Aluno
            <input
              type="text"
              value={isPersonal ? student?.nome || '' : aluno}
              onChange={(event) => setAluno(event.target.value)}
              placeholder="Nome do aluno"
              readOnly={isPersonal}
              style={{ marginTop: 6, width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </label>
          <label>
            Observacoes iniciais
            <textarea
              rows={4}
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              placeholder="Observacoes"
              style={{ marginTop: 6, width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </label>
          <button className="button" type="submit" disabled={saving || !userId}>
            {saving ? 'Salvando...' : 'Criar avaliacao'}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
